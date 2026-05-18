export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  phone: string;
  countryCode: string;
  dialCode: string;
}

export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  li_fat_id?: string;
  ref?: string;
  referrer?: string;
  landing_path?: string;
  first_seen?: string;
}

export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
    step?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    fbq?: (...args: unknown[]) => void;
  }
}
