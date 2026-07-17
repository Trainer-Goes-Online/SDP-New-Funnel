import crypto from 'crypto';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

const CONTENT_META = {
  content_ids: ['sdp_pre_strategy'],
  content_name: 'SDP Pre-Strategy Call',
  content_type: 'product',
} as const;

function postToMeta(pixelId: string, accessToken: string, event: unknown) {
  return fetch(
    `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    }
  ).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err));
    }
    return res.json();
  });
}

export async function sendAddToCartEvent(params: {
  pixelId: string;
  accessToken: string;
  eventSourceUrl: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
  clientUserAgent?: string;
}) {
  // event_id is deterministic per fbp so Meta's 48h dedup collapses
  // any accidental duplicates from the same browser (double-click,
  // multi-tab). Random fallback if _fbp is missing.
  const seed = params.fbp ?? crypto.randomBytes(8).toString('hex');
  const event = {
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    event_id: sha256(`${seed}|atc`),
    action_source: 'website',
    event_source_url: params.eventSourceUrl,
    user_data: {
      ...(params.fbc             && { fbc: params.fbc }),
      ...(params.fbp             && { fbp: params.fbp }),
      ...(params.clientIp        && { client_ip_address: params.clientIp }),
      ...(params.clientUserAgent && { client_user_agent: params.clientUserAgent }),
    },
    custom_data: {
      currency: 'INR',
      value: Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97'),
      ...CONTENT_META,
    },
  };
  return postToMeta(params.pixelId, params.accessToken, event);
}

export async function sendInitiateCheckoutEvent(params: {
  pixelId: string;
  accessToken: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  countryCode: string;
  eventSourceUrl: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
  clientUserAgent?: string;
}) {
  const normEmail   = params.email.trim().toLowerCase();
  const normPhone   = params.phone.replace(/\D/g, '');
  const normFn      = params.firstName.trim().toLowerCase();
  const normLn      = params.lastName.trim().toLowerCase();
  const normCt      = params.city.trim().toLowerCase().replace(/[^a-z]/g, '');
  const normCountry = params.countryCode.trim().toLowerCase();
  const emailHash   = normEmail ? sha256(normEmail) : undefined;

  const event = {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    // Same email = same event_id even across sessions/devices. Meta
    // 48h-dedups on (event_name, event_id) as a safety net beneath
    // the client's localStorage flag.
    event_id: sha256(`${normEmail}|ic`),
    action_source: 'website',
    event_source_url: params.eventSourceUrl,
    user_data: {
      ...(emailHash   && { em:          [emailHash] }),
      // Same external_id derivation as verify-payment/route.ts so Meta
      // sees one stable identity across ATC → IC → Purchase → SDPPurchase.
      ...(emailHash   && { external_id: [emailHash] }),
      ...(normPhone   && { ph:          [sha256(normPhone)] }),
      ...(normFn      && { fn:          [sha256(normFn)] }),
      ...(normLn      && { ln:          [sha256(normLn)] }),
      ...(normCt      && { ct:          [sha256(normCt)] }),
      ...(normCountry && { country:     [sha256(normCountry)] }),
      ...(params.fbc             && { fbc: params.fbc }),
      ...(params.fbp             && { fbp: params.fbp }),
      ...(params.clientIp        && { client_ip_address: params.clientIp }),
      ...(params.clientUserAgent && { client_user_agent: params.clientUserAgent }),
    },
    custom_data: {
      currency: 'INR',
      value: Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97'),
      ...CONTENT_META,
    },
  };
  return postToMeta(params.pixelId, params.accessToken, event);
}
