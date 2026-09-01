import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import type { CustomerData, UtmData } from '@/lib/types';
import {
  ATTR_COOKIE,
  readAttrCookie,
  resolveAttribution,
  type AttrRecord,
  type ResolvedAttribution,
} from '@/lib/attribution';
import { packNotes, type NotePayload } from '@/lib/razorpay-notes';

let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function priceInPaise(): number {
  const inr = Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97');
  return Math.max(1, Math.round(inr * 100));
}

const CANONICAL_CHECKOUT_URL =
  'https://sdp.sciencedrivenperformance.in/new-checkout-page';

// Builds the 38-field Pabbly payload for the coupon-bypass branch. The
// real-payment path packs the same signals into notes and lets the
// webhook build this payload from the payment.entity; bypass never
// hits Razorpay so it fires Pabbly directly from here.
function buildBypassPabblyPayload(input: {
  paymentId: string;
  orderId: string;
  customer: CustomerData;
  couponCode: string;
  resolved: ResolvedAttribution;
  fbc: string;
  fbp: string;
  clientIp: string;
  clientUserAgent: string;
}) {
  const dt = new Date();
  const emailHash = input.customer.email
    ? crypto
        .createHash('sha256')
        .update(input.customer.email.trim().toLowerCase())
        .digest('hex')
    : '';
  return {
    lead_id:           input.paymentId,
    first_name:        input.customer.firstName,
    last_name:         input.customer.lastName,
    full_name:         `${input.customer.firstName} ${input.customer.lastName}`.trim(),
    email:             input.customer.email,
    phone:             `${input.customer.dialCode}${input.customer.phone}`,
    city:              input.customer.city,
    country_code:      input.customer.countryCode,
    payment_id:        input.paymentId,
    order_id:          input.orderId,
    amount:            '0',
    currency:          'INR',
    coupon_code:       input.couponCode,
    is_test:           'true',
    payment_date:      dt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
    payment_time:      dt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
    payment_timestamp: dt.toISOString(),
    utm_source:        input.resolved.utm.source,
    utm_medium:        input.resolved.utm.medium,
    utm_campaign:      input.resolved.utm.campaign,
    utm_content:       input.resolved.utm.content,
    utm_term:          input.resolved.utm.term,
    utm_id:            '',
    gclid:             input.resolved.gclid,
    fbclid:            input.resolved.fbclid,
    msclkid:           '',
    ttclid:            '',
    li_fat_id:         '',
    ref:               '',
    referrer:          input.resolved.referrer,
    landing_path:      input.resolved.landingUrl,
    first_seen:        '',
    event_source_url:  CANONICAL_CHECKOUT_URL,
    fbc:               input.fbc,
    fbp:               input.fbp,
    external_id:       emailHash,
    client_ip_address: input.clientIp,
    client_user_agent: input.clientUserAgent,
    attribution_source: input.resolved.provenance,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      couponCode,
      customer,
      utm,
    }: {
      couponCode?: string;
      customer?: CustomerData;
      utm?: UtmData;
    } = body;

    // Resolve attribution once — used by both bypass and real paths.
    // The webhook can't read cookies (server-to-server call from
    // Razorpay), so all this MUST happen here at order-create time.
    const cookieFbcRaw = req.cookies.get('_fbc')?.value ?? '';
    const fbpCookie = req.cookies.get('_fbp')?.value ?? '';
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      '';
    const clientUserAgent = req.headers.get('user-agent') ?? '';
    const attrCookie = readAttrCookie(req.cookies.get(ATTR_COOKIE)?.value);
    const bodyAttr: AttrRecord = {
      source:      utm?.source   ?? '',
      medium:      utm?.medium   ?? '',
      campaign:    utm?.campaign ?? '',
      content:     utm?.content  ?? '',
      term:        utm?.term     ?? '',
      fbclid:      utm?.fbclid   ?? '',
      gclid:       utm?.gclid    ?? '',
      referrer:    utm?.referrer     ?? '',
      landing_url: utm?.landing_path ?? '',
      ts: 0,
    };
    const resolved = resolveAttribution({
      cookieAttr: attrCookie,
      bodyAttr,
      referrer: utm?.referrer ?? '',
      landingUrl: utm?.landing_path ?? '',
      fbc: cookieFbcRaw,
    });
    // Synthesize _fbc from stored parts when the browser cookie was
    // cleared between click and purchase — keeps Meta attribution intact.
    const fbc =
      cookieFbcRaw ||
      (resolved.fbclid ? `fb.1.${resolved.fbclidTs}.${resolved.fbclid}` : '');

    // ---- Coupon bypass path (QA free-checkout) ----
    const bypassCode = process.env.TEST_BYPASS_COUPON?.trim();
    if (
      bypassCode &&
      couponCode &&
      couponCode.trim().toUpperCase() === bypassCode.toUpperCase()
    ) {
      const ts = Date.now();
      const bypassOrderId = `test_order_${ts}`;
      const bypassPaymentId = `test_pay_${ts}`;

      // Fire Pabbly directly — this path never hits Razorpay so the
      // webhook won't fire. Meta CAPI stays skipped (was skipped in
      // legacy verify-payment too via !isTestBypass).
      const webhookUrl = process.env.PABBLY_WEBHOOK_URL;
      if (webhookUrl && customer?.email) {
        const bypassPayload = buildBypassPabblyPayload({
          paymentId: bypassPaymentId,
          orderId: bypassOrderId,
          customer,
          couponCode: couponCode.trim(),
          resolved,
          fbc,
          fbp: fbpCookie,
          clientIp,
          clientUserAgent,
        });
        try {
          const r = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bypassPayload),
          });
          console.log(
            `[create-order] bypass paymentId=${bypassPaymentId} Pabbly ${r.ok ? 'sent' : 'failed'} (${r.status})`
          );
        } catch (err) {
          console.error(
            `[create-order] bypass paymentId=${bypassPaymentId} Pabbly error:`,
            err
          );
        }
      } else if (!webhookUrl) {
        console.error(
          `[create-order] bypass paymentId=${bypassPaymentId} PABBLY_WEBHOOK_URL not set — Pabbly skipped`
        );
      }

      return NextResponse.json({
        bypass: true,
        orderId: bypassOrderId,
        paymentId: bypassPaymentId,
        amount: 0,
        currency: 'INR',
      });
    }

    // ---- Real payment path ----
    if (!razorpay) {
      console.error('[create-order] Razorpay not configured — missing environment variables');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }
    if (!customer?.email) {
      return NextResponse.json(
        { error: 'Missing customer information. Please refresh and try again.' },
        { status: 400 }
      );
    }

    const amount = priceInPaise();
    const currency = 'INR';

    const notePayload: NotePayload = {
      cust: {
        fn: customer.firstName ?? '',
        ln: customer.lastName  ?? '',
        em: customer.email     ?? '',
        ph: customer.phone     ?? '',
        ct: customer.city      ?? '',
        co: customer.countryCode ?? '',
        dl: customer.dialCode  ?? '',
      },
      utm: {
        s:  resolved.utm.source,
        m:  resolved.utm.medium,
        c:  resolved.utm.campaign,
        n:  resolved.utm.content,
        t:  resolved.utm.term,
        id: utm?.utm_id ?? '',
      },
      fbclid: resolved.fbclid,
      oclids: {
        g: resolved.gclid,
        m: utm?.msclkid   ?? '',
        t: utm?.ttclid    ?? '',
        l: utm?.li_fat_id ?? '',
      },
      fbc,
      fbp: fbpCookie,
      ip: clientIp,
      ua: clientUserAgent,
      esu: CANONICAL_CHECKOUT_URL,
      rf: resolved.referrer,
      lp: resolved.landingUrl,
      fs: utm?.first_seen ?? '',
      cpn: couponCode ?? '',
      pv: resolved.provenance,
    };

    const notes = packNotes(notePayload);

    console.log(
      `[create-order] creating Razorpay order — provenance=${resolved.provenance} amount=${amount}`
    );

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes,
    });

    console.log(`[create-order] order created id=${order.id}`);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('[create-order]', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
