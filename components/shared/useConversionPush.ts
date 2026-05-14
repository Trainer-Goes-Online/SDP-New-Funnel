'use client';

import { useEffect } from 'react';
import { restoreUtm } from '@/lib/utm';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    sdpAttribution?: ReturnType<typeof restoreUtm>;
  }
}

/**
 * Fires a `purchase_complete` event onto window.dataLayer once on the
 * thank-you page so GTM, GA4, and Meta Pixel can attribute the conversion.
 * Reads order_id / payment_id from the URL query params and merges the
 * sdp_utm cookie attribution.
 */
export function useConversionPush() {
  useEffect(() => {
    const attr = restoreUtm();
    window.sdpAttribution = attr;

    const qs = new URLSearchParams(window.location.search);
    const orderId =
      qs.get('order_id') ?? qs.get('razorpay_order_id') ?? qs.get('payment_id') ?? '';
    const paymentId = qs.get('payment_id') ?? qs.get('razorpay_payment_id') ?? '';

    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: 'purchase_complete',
      transaction_id: orderId,
      payment_id: paymentId,
      value: Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97'),
      currency: 'INR',
      items: [
        {
          item_id: 'sdp-pre-strategy-call',
          item_name: 'SDP Pre-Strategy Call',
          item_category: 'Consultation',
          price: Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97'),
          quantity: 1,
        },
      ],
      utm_source: attr.source ?? '(direct)',
      utm_medium: attr.medium ?? '(none)',
      utm_campaign: attr.campaign ?? '',
      utm_term: attr.term ?? '',
      utm_content: attr.content ?? '',
      utm_id: attr.utm_id ?? '',
      gclid: attr.gclid ?? '',
      fbclid: attr.fbclid ?? '',
      msclkid: attr.msclkid ?? '',
      ttclid: attr.ttclid ?? '',
      li_fat_id: attr.li_fat_id ?? '',
      ref: attr.ref ?? '',
      referrer: attr.referrer ?? '',
      landing_path: attr.landing_path ?? '',
      first_seen: attr.first_seen ?? '',
    });
  }, []);
}
