import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Signature-only gate. Called by the checkout form's Razorpay success
// handler ONLY to decide whether to redirect to /new-book-a-call. All
// tracking (Pabbly + Meta CAPI) is fired by the webhook route from
// Razorpay's own server-to-server call — not from here.

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = (await req.json()) as {
      orderId?: string;
      paymentId?: string;
      signature?: string;
    };

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('[verify-signature] Razorpay secret not configured');
      return NextResponse.json(
        { valid: false, error: 'Payment verification not configured.' },
        { status: 500 }
      );
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const valid = expected === signature;
    if (!valid) {
      console.error(`[verify-signature] paymentId=${paymentId} invalid signature`);
      return NextResponse.json(
        { valid: false, error: 'Payment verification failed.' },
        { status: 400 }
      );
    }

    console.log(`[verify-signature] paymentId=${paymentId} ok`);
    return NextResponse.json({ valid: true, paymentId });
  } catch (err) {
    console.error('[verify-signature]', err);
    return NextResponse.json(
      { valid: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
