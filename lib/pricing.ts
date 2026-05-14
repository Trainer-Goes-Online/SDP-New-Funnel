export const ORIGINAL_PRICE_INR = 999;
export const PRICE_INR = Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97');

export interface Coupon {
  discountPct: number;
  bypassRazorpay: boolean;
  label: string;
}

export const COUPONS: Record<string, Coupon> = {
  TGOTEST2026: {
    discountPct: 100,
    bypassRazorpay: true,
    label: 'Test coupon — payment bypassed',
  },
};

export function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}
