import { NextRequest, NextResponse } from 'next/server';
import type { CustomerData } from '@/lib/types';
import { sendInitiateCheckoutEvent } from '@/lib/meta-events';

const stripQuery = (url: string) => {
  try { const u = new URL(url); return `${u.origin}${u.pathname}`; }
  catch { return url; }
};

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ok: true, skipped: 'not_production' });
    }
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!pixelId || !accessToken) {
      console.log('[ic] skipped — env vars not set');
      return NextResponse.json({ ok: true, skipped: 'env_missing' });
    }

    const body: { customer?: CustomerData; eventSourceUrl?: string } = await req.json();
    const customer = body.customer;
    if (!customer?.email) {
      return NextResponse.json({ ok: false, error: 'missing email' }, { status: 400 });
    }

    const fbc = req.cookies.get('_fbc')?.value;
    const fbp = req.cookies.get('_fbp')?.value;
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      undefined;
    const clientUserAgent = req.headers.get('user-agent') ?? undefined;

    const eventSourceUrl = stripQuery(
      body.eventSourceUrl ?? 'https://sdp.sciencedrivenperformance.in/new-checkout-page'
    );

    const result = await sendInitiateCheckoutEvent({
      pixelId,
      accessToken,
      email: customer.email,
      phone: `${customer.dialCode ?? ''}${customer.phone ?? ''}`,
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      city: customer.city ?? '',
      countryCode: customer.countryCode ?? '',
      eventSourceUrl,
      fbc,
      fbp,
      clientIp,
      clientUserAgent,
    });
    console.log('[ic] fired:', result);
    return NextResponse.json({ ok: true, capi: 'sent' });
  } catch (err) {
    console.error('[ic] error:', err);
    return NextResponse.json({ ok: true, capi: 'error' });
  }
}
