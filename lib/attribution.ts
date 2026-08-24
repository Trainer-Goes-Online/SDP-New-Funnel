// Edge-safe attribution primitives — no `node:crypto`, no DOM. Used by
// middleware.ts (Edge runtime) and the create-order route (Node) to
// resolve UTMs + fbclid + fbc before packing them into Razorpay notes.
//
// Two concerns are kept separate:
//   ATTRIBUTION = last-touch  → utm_*, fbclid, gclid, ts
//   CONTEXT     = first-touch → landing_url, referrer
//
// Precedence for resolving a signal: URL → cookie → body → referrer → _fbc → none
// (referrer is deliberately skipped for fbclid; it's capped at 256 chars and
// truncates a real 195-char fbclid to ~49 chars — worse than empty because it
// looks valid.)

export const ATTR_COOKIE = 'sdp_attr';
export const ATTR_TTL_SECONDS = 30 * 24 * 60 * 60;

export const URL_TO_KEY: Record<string, string> = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_content: 'content',
  utm_term: 'term',
  fbclid: 'fbclid',
  gclid: 'gclid',
};

export const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export interface AttrRecord {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  gclid?: string;
  ts?: number;
  landing_url?: string;
  referrer?: string;
}

const isFilled = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/** Extract utm_*, fbclid, gclid from a URL or bare search string. */
export function parseAttributionFromUrl(input: string | null | undefined): AttrRecord {
  const out: AttrRecord = {};
  if (!input) return out;
  try {
    const search = input.includes('?') ? input.slice(input.indexOf('?')) : input;
    const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    for (const [param, key] of Object.entries(URL_TO_KEY)) {
      const v = sp.get(param);
      if (isFilled(v)) (out as Record<string, string>)[key] = v;
    }
  } catch {
    /* malformed URL → return whatever we managed */
  }
  return out;
}

/** `_fbc` is `fb.<subdomainIdx>.<clickTsMs>.<fbclid>` — the ONLY complete fbclid source. */
export function parseFbc(fbc: string | null | undefined): { fbclid?: string; ts?: number } {
  if (!isFilled(fbc)) return {};
  const p = fbc.split('.');
  if (p.length < 4 || p[0] !== 'fb') return {};
  const ts = Number(p[2]);
  return {
    fbclid: p.slice(3).join('.'),
    ts: Number.isFinite(ts) && ts > 0 ? ts : undefined,
  };
}

export function readAttrCookie(raw: string | null | undefined): AttrRecord {
  if (!isFilled(raw)) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Merge a fresh page-hit into the stored cookie. Last-touch for
 * attribution keys; first-touch for landing_url + referrer.
 */
export function mergeAttribution(
  stored: AttrRecord,
  opts: { live: AttrRecord; landingUrl: string; referrer: string; now: number }
): { attr: AttrRecord; changed: boolean } {
  const attr: AttrRecord = { ...stored };
  let changed = false;

  if (!isFilled(attr.landing_url) && isFilled(opts.landingUrl)) {
    attr.landing_url = opts.landingUrl;
    attr.referrer = isFilled(opts.referrer) ? opts.referrer : '';
    changed = true;
  }

  if (opts.live && Object.keys(opts.live).length > 0) {
    Object.assign(attr, opts.live, { ts: opts.now });
    changed = true;
  }

  return { attr, changed };
}

export interface ResolvedAttribution {
  utm: Record<UtmKey, string>;
  fbclid: string;
  fbclidTs: number;
  gclid: string;
  referrer: string;
  landingUrl: string;
  provenance: string;
  utmSource: 'cookie' | 'body' | 'referrer' | 'none';
  clidSource: 'cookie' | 'body' | 'fbc' | 'none';
}

/**
 * Resolve a final attribution record from all available sources. UTMs
 * fall back to referrer parsing when both cookie + body are blank.
 * fbclid falls back to the client's _fbc cookie (parsed), which is
 * the only length-preserving fbclid source — referrer is intentionally
 * NOT consulted (256-char cap truncates it silently).
 */
export function resolveAttribution(input: {
  cookieAttr?: AttrRecord;
  bodyAttr?: AttrRecord;
  referrer?: string;
  landingUrl?: string;
  fbc?: string;
  now?: number;
}): ResolvedAttribution {
  const cookieAttr = input.cookieAttr ?? {};
  const bodyAttr = input.bodyAttr ?? {};
  const referrer = input.referrer ?? '';
  const landingUrl = input.landingUrl ?? '';
  const fbc = input.fbc ?? '';
  const now = input.now ?? Date.now();

  const utm: Record<string, string> = {};
  let utmSource: ResolvedAttribution['utmSource'] = 'none';

  for (const [label, src] of [
    ['cookie', cookieAttr] as const,
    ['body', bodyAttr] as const,
  ]) {
    for (const key of UTM_KEYS) {
      if (!isFilled(utm[key]) && isFilled((src as Record<string, string>)[key])) {
        utm[key] = (src as Record<string, string>)[key];
        if (utmSource === 'none') utmSource = label;
      }
    }
  }

  // Fallback: parse UTMs out of the referrer or landing URL if nothing
  // survived. Rare, but rescues attribution when both cookies were lost.
  if (UTM_KEYS.every(k => !isFilled(utm[k]))) {
    const recovered = {
      ...parseAttributionFromUrl(landingUrl),
      ...parseAttributionFromUrl(referrer),
    } as Record<string, string>;
    let used = false;
    for (const key of UTM_KEYS) {
      if (isFilled(recovered[key])) {
        utm[key] = recovered[key];
        used = true;
      }
    }
    if (used) utmSource = 'referrer';
  }

  for (const key of UTM_KEYS) if (!isFilled(utm[key])) utm[key] = '';

  let fbclid = '';
  let fbclidTs = 0;
  let clidSource: ResolvedAttribution['clidSource'] = 'none';

  if (isFilled(cookieAttr.fbclid)) {
    fbclid = cookieAttr.fbclid;
    clidSource = 'cookie';
    fbclidTs = Number(cookieAttr.ts) || 0;
  } else if (isFilled(bodyAttr.fbclid)) {
    fbclid = bodyAttr.fbclid;
    clidSource = 'body';
    fbclidTs = Number(bodyAttr.ts) || 0;
  } else {
    const f = parseFbc(fbc);
    if (isFilled(f.fbclid)) {
      fbclid = f.fbclid;
      clidSource = 'fbc';
      fbclidTs = f.ts || 0;
    }
  }
  if (!fbclidTs) fbclidTs = Number(cookieAttr.ts) || Number(bodyAttr.ts) || 0;

  return {
    utm: utm as Record<UtmKey, string>,
    fbclid,
    fbclidTs: fbclidTs || now,
    gclid: [cookieAttr.gclid, bodyAttr.gclid].find(isFilled) || '',
    referrer:
      [referrer, cookieAttr.referrer, bodyAttr.referrer].find(isFilled) || '',
    landingUrl:
      [landingUrl, cookieAttr.landing_url, bodyAttr.landing_url].find(isFilled) || '',
    provenance: `utm:${utmSource}|clid:${clidSource}`,
    utmSource,
    clidSource,
  };
}
