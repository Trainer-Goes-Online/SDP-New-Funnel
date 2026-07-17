// Once-per-browser GA4 event helper. The base gtag.js tag in
// app/layout.tsx is gated on NODE_ENV === 'production', so on localhost
// window.gtag will be undefined — in that case we deliberately skip
// WITHOUT stamping the localStorage flag, otherwise the event would be
// permanently suppressed for that browser and never fire on production.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const PREFIX = 'sdp_ga4_';

export function trackGa4EventOnce(event: string): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  const key = `${PREFIX}${event}_fired`;
  try {
    if (window.localStorage.getItem(key)) return;
    // Stamp BEFORE the gtag call — a CTA click navigates away
    // immediately after, and an un-stamped flag double-fires.
    window.localStorage.setItem(key, '1');
  } catch {
    // private mode / storage disabled → best-effort: fire anyway
  }

  try {
    window.gtag('event', event);
  } catch {
    // never throw into a click handler
  }
}
