// Client-side triggers for the two new Meta CAPI routes.
//
// AddToCart uses sendBeacon (survives page navigation — the CTA click
// navigates away immediately after). InitiateCheckout uses fetch with
// keepalive since the checkout page stays put; the localStorage flag
// is stamped on server success and left empty on failure so a retry
// can fire.

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const ATC_KEY = 'sdp_atc_fired';
const IC_KEY = 'sdp_ic_fired';

export function fireAddToCartOnce(eventSourceUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(ATC_KEY)) return;
    // Stamp optimistically — the CTA click will navigate before any
    // response comes back, and an un-stamped flag double-fires.
    window.localStorage.setItem(ATC_KEY, '1');
  } catch {
    /* private mode → best-effort */
  }

  const body = JSON.stringify({ eventSourceUrl });
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon('/api/meta/add-to-cart', blob)
    ) {
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    fetch('/api/meta/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* swallow — analytics must not break the click */
  }
}

export async function fireInitiateCheckoutOnce(params: {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dialCode: string;
    city: string;
    countryCode: string;
  };
  eventSourceUrl: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const normEmail = params.customer.email.trim().toLowerCase();
  if (!normEmail) return;

  let emailHash = '';
  try {
    emailHash = await sha256Hex(normEmail);
  } catch {
    // Web Crypto unavailable — just skip dedup, still fire
  }

  try {
    if (emailHash && window.localStorage.getItem(IC_KEY) === emailHash) return;
  } catch {
    /* proceed without dedup */
  }

  try {
    const res = await fetch('/api/meta/initiate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok && emailHash) {
      try { window.localStorage.setItem(IC_KEY, emailHash); } catch {}
    }
  } catch {
    /* swallow — must not block payment */
  }
}
