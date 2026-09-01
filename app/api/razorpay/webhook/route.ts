import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { KIND, unpackNotes } from '@/lib/razorpay-notes';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

// Razorpay-driven tracking authority — replaces verify-payment.
//
// Fires server-to-server so a user who completes payment inside a UPI
// app and never returns to the tab still triggers Pabbly + Meta CAPI.
// Razorpay retries this endpoint on non-200; Meta 48h-dedups on
// event_id (safe), Pabbly is dedup'd downstream by the Apps Script on
// lead_id.

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
  created_at: number;
  notes?: Record<string, unknown>;
}

interface RazorpayWebhookBody {
  event: string;
  payload?: { payment?: { entity?: RazorpayPaymentEntity } };
}

export async function POST(req: NextRequest) {
  // Raw body FIRST — HMAC must run on the exact bytes Razorpay signed,
  // not on a re-serialized JSON.
  const rawBody = await req.text();

  // 1. HMAC signature verify.
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }
  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.error('[webhook] missing x-razorpay-signature header');
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });
  }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected !== signature) {
    console.error('[webhook] invalid signature');
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
  }
  console.log('[webhook] signature verified');

  // 2. Parse + event filter.
  let body: RazorpayWebhookBody;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhookBody;
  } catch {
    console.error('[webhook] invalid JSON body');
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (body.event !== 'payment.captured') {
    console.log(`[webhook] ignoring event=${body.event}`);
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: 'event_not_captured',
      event: body.event,
    });
  }

  // 3. Payment entity.
  const payment = body.payload?.payment?.entity;
  if (!payment?.id) {
    console.error('[webhook] no payment entity');
    return NextResponse.json({ ok: false, error: 'no_payment_entity' }, { status: 400 });
  }
  const paymentId = payment.id;
  console.log(`[webhook] paymentId=${paymentId} received event=payment.captured`);

  // 4. Kind gate — filter payments from other funnels on the same account.
  const notes = unpackNotes(payment.notes);
  if (notes.kind !== KIND) {
    console.log(
      `[webhook] paymentId=${paymentId} kind mismatch: got="${notes.kind}", want="${KIND}"`
    );
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: 'kind_mismatch',
      kind: notes.kind,
    });
  }
  console.log(`[webhook] paymentId=${paymentId} kind matched: ${notes.kind}`);

  // 5. Snapshot the incoming data for observability.
  console.log(
    `[webhook] paymentId=${paymentId} data:`,
    JSON.stringify({
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.created_at,
      cust: { fn: notes.cust.fn, em: notes.cust.em, co: notes.cust.co },
      utm: notes.utm,
      fbclidLen: notes.fbclid.length,
      fbcLen: notes.fbc.length,
      uaLen: notes.ua.length,
      provenance: notes.pv,
    })
  );

  // 6. Build the same 38-field Pabbly payload the deleted verify-payment
  //    used, so downstream Sheet mapping is byte-for-byte compatible.
  const amountInr = String(Math.round(Number(payment.amount) / 100));
  const createdMs = (payment.created_at ?? Math.floor(Date.now() / 1000)) * 1000;
  const dt = new Date(createdMs);
  const fullName = `${notes.cust.fn} ${notes.cust.ln}`.trim();
  const externalIdHash = notes.cust.em
    ? crypto
        .createHash('sha256')
        .update(notes.cust.em.trim().toLowerCase())
        .digest('hex')
    : '';

  const pabblyPayload = {
    lead_id:           paymentId,
    first_name:        notes.cust.fn,
    last_name:         notes.cust.ln,
    full_name:         fullName,
    email:             notes.cust.em,
    phone:             `${notes.cust.dl}${notes.cust.ph}`,
    city:              notes.cust.ct,
    country_code:      notes.cust.co,
    payment_id:        paymentId,
    order_id:          payment.order_id,
    amount:            amountInr,
    currency:          payment.currency,
    coupon_code:       notes.cpn,
    is_test:           'false',
    payment_date:      dt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
    payment_time:      dt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
    payment_timestamp: dt.toISOString(),
    utm_source:        notes.utm.s,
    utm_medium:        notes.utm.m,
    utm_campaign:      notes.utm.c,
    utm_content:       notes.utm.n,
    utm_term:          notes.utm.t,
    utm_id:            notes.utm.id,
    gclid:             notes.oclids.g,
    fbclid:            notes.fbclid,
    msclkid:           notes.oclids.m,
    ttclid:            notes.oclids.t,
    li_fat_id:         notes.oclids.l,
    ref:               '',
    referrer:          notes.rf,
    landing_path:      notes.lp,
    first_seen:        notes.fs,
    event_source_url:  notes.esu,
    fbc:               notes.fbc,
    fbp:               notes.fbp,
    external_id:       externalIdHash,
    client_ip_address: notes.ip,
    client_user_agent: notes.ua,
    // L7 — provenance so a blank-utm row is diagnosable at a glance.
    // Format: `utm:<layer>/<quality>|clid:<layer>` — e.g.
    // `utm:cookie/ad|clid:cookie`. APPENDED at end of the schema so
    // existing lifecycle columns don't shift — Apps Script COL map
    // only needs one new entry, no re-indexing.
    attribution_source: notes.pv,
  };

  // 7. Fire Pabbly (non-blocking; never throws to the response).
  let pabblyResult: 'sent' | 'skipped' | 'error' = 'skipped';
  const webhookUrl = process.env.PABBLY_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const r = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pabblyPayload),
      });
      if (r.ok) {
        console.log(`[webhook] paymentId=${paymentId} Pabbly sent (${r.status})`);
        pabblyResult = 'sent';
      } else {
        console.error(
          `[webhook] paymentId=${paymentId} Pabbly failed ${r.status} ${r.statusText}`
        );
        pabblyResult = 'error';
      }
    } catch (err) {
      console.error(`[webhook] paymentId=${paymentId} Pabbly error:`, err);
      pabblyResult = 'error';
    }
  } else {
    console.error(
      `[webhook] paymentId=${paymentId} PABBLY_WEBHOOK_URL not set — Pabbly skipped`
    );
  }

  // 8. Fire Meta CAPI — both events in parallel, prod-gated.
  let capiResult: 'sent' | 'skipped' | 'error' = 'skipped';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? process.env.META_PIXEL_ID;
  const metaAccessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (metaPixelId && metaAccessToken && process.env.NODE_ENV === 'production') {
    const fullPhone = `${notes.cust.dl}${notes.cust.ph}`;
    const sharedPayload = {
      pixelId: metaPixelId,
      accessToken: metaAccessToken,
      paymentId,
      email: notes.cust.em,
      phone: fullPhone,
      firstName: notes.cust.fn,
      lastName: notes.cust.ln,
      city: notes.cust.ct,
      country: notes.cust.co,
      eventSourceUrl: notes.esu,
      fbc: notes.fbc || undefined,
      fbp: notes.fbp || undefined,
      clientIp: notes.ip || undefined,
      clientUserAgent: notes.ua || undefined,
    };
    const eventNames = ['SDPPurchase', 'Purchase'];
    const results = await Promise.allSettled(
      eventNames.map(eventName => sendMetaCapiEvent({ eventName, ...sharedPayload }))
    );
    let ok = 0;
    let err = 0;
    results.forEach((r, i) => {
      const name = eventNames[i];
      if (r.status === 'fulfilled') {
        console.log(
          `[webhook] paymentId=${paymentId} Meta CAPI "${name}" sent:`,
          JSON.stringify(r.value)
        );
        ok += 1;
      } else {
        console.error(
          `[webhook] paymentId=${paymentId} Meta CAPI "${name}" error:`,
          r.reason
        );
        err += 1;
      }
    });
    capiResult = ok > 0 && err === 0 ? 'sent' : err > 0 ? 'error' : 'skipped';
  } else {
    console.log(
      `[webhook] paymentId=${paymentId} Meta CAPI skipped — env vars unset or not production`
    );
  }

  return NextResponse.json({
    ok: true,
    paymentId,
    kind: notes.kind,
    pabbly: pabblyResult,
    capi: capiResult,
  });
}
