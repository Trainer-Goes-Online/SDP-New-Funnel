import crypto from 'crypto';

// Extracted verbatim from the (now deleted) verify-payment/route.ts so
// the webhook and any future server-side firer share one canonical
// event shape. Preserves: event_id = paymentId, external_id derivation,
// full 11-signal user_data (em/ph/fn/ln/ct/country/external_id +
// fbc/fbp/IP/UA), custom_data with currency + value + payment_id.

export async function sendMetaCapiEvent(params: {
  eventName: string;
  pixelId: string;
  accessToken: string;
  paymentId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  eventSourceUrl: string;
  fbc: string | undefined;
  fbp: string | undefined;
  clientIp: string | undefined;
  clientUserAgent: string | undefined;
}) {
  const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

  const normEmail   = params.email.trim().toLowerCase();
  const normPhone   = params.phone.replace(/\D/g, '');
  const normFn      = params.firstName.trim().toLowerCase();
  const normLn      = params.lastName.trim().toLowerCase();
  const normCt      = params.city.trim().toLowerCase().replace(/[^a-z]/g, '');
  const normCountry = params.country.trim().toLowerCase();

  const emailHash = normEmail ? sha256(normEmail) : undefined;

  const event = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.paymentId,
    action_source: 'website',
    event_source_url: params.eventSourceUrl,
    user_data: {
      ...(emailHash   && { em:          [emailHash] }),
      ...(emailHash   && { external_id: [emailHash] }),
      ...(normPhone   && { ph:          [sha256(normPhone)] }),
      ...(normFn      && { fn:          [sha256(normFn)] }),
      ...(normLn      && { ln:          [sha256(normLn)] }),
      ...(normCt      && { ct:          [sha256(normCt)] }),
      ...(normCountry && { country:     [sha256(normCountry)] }),
      ...(params.fbc             && { fbc: params.fbc }),
      ...(params.fbp             && { fbp: params.fbp }),
      ...(params.clientUserAgent && { client_user_agent: params.clientUserAgent }),
      ...(params.clientIp        && { client_ip_address: params.clientIp }),
    },
    custom_data: {
      currency: 'INR',
      value: Number(process.env.NEXT_PUBLIC_PRICE_INR ?? '97'),
      payment_id: params.paymentId,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v25.0/${params.pixelId}/events?access_token=${params.accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}
