import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { couponCode } = body as { couponCode?: string };

    const bypassCode = process.env.TEST_BYPASS_COUPON?.trim();
    if (
      bypassCode &&
      couponCode &&
      couponCode.trim().toUpperCase() === bypassCode.toUpperCase()
    ) {
      const ts = Date.now();
      return NextResponse.json({
        bypass: true,
        orderId: `test_order_${ts}`,
        paymentId: `test_pay_${ts}`,
        amount: 0,
        currency: 'INR',
      });
    }

    if (!razorpay) {
      console.error('[create-order] Razorpay not configured — missing environment variables');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const amount = priceInPaise();
    const currency = 'INR';

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

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
