// Edge-safe attribution primitives — no `node:crypto`, no DOM. Used by
// middleware.ts (Edge runtime) and the create-order route (Node) to
// resolve UTMs + fbclid + fbc before packing them into Razorpay notes.
//
// Two concerns are kept separate:
//   ATTRIBUTION = last-touch  → utm_*, fbclid, gclid, ts
//   CONTEXT     = first-touch → landing_url, referrer
//
// Precedence for fbclid: URL → cookie → body → _fbc → none.
// Referrer is deliberately skipped for fbclid (256-char cap truncates
// it — a rf-derived fbclid looks valid but isn't).
//
// Precedence for utm_* is QUALITY-RANKED, not positional:
//   Scan landing → referrer → cookie → body and take the first
//   ad-grade utm set found anywhere. Fall back to the best-filled
//   non-ad set only when no source has one. Whole sets are chosen,
//   never merged field-by-field: mixing utm_source from an ad with
//   utm_content from a bio tap is worse than either.
//
// "Ad-grade" = utm_source is NOT in ORGANIC_SOURCES, utm_content is
// NOT `link_in_bio`, and it's not a bare medium=`social` with no
// campaign. Tune ORGANIC_SOURCES per client.

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

// Organic entry-point utm_source values. Add per-client bio/link-tree
// tags here so an organic bio tap can never masquerade as a paid click.
// Ads for SDP use `Instagram_Stories`, `Instagram_Reels`, `Facebook_*`,
// etc. — those are NOT in this set and are correctly treated as ad.
export const ORGANIC_SOURCES = new Set<string>([
  'ig',
  'fb',
  'instagram',
  'facebook',
  'l.instagram.com',
  'lm.facebook.com',
  'linktr.ee',
  'taplink.cc',
  'beacons.ai',
  'bio.link',
]);

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

/** True if the utm set has ANY of the 5 standard utm_* fields filled. */
export function hasUtm(u: Partial<Record<UtmKey, string>>): boolean {
  return UTM_KEYS.some(k => isFilled(u?.[k]));
}

/** Organic classifier — a filled utm set that came from a bio/link-tree tap. */
export function isOrganicUtm(u: Partial<Record<UtmKey, string>>): boolean {
  if (!hasUtm(u)) return false;
  if ((u.content ?? '').toLowerCase() === 'link_in_bio') return true;
  if (ORGANIC_SOURCES.has((u.source ?? '').toLowerCase())) return true;
  if ((u.medium ?? '').toLowerCase() === 'social' && !isFilled(u.campaign)) return true;
  return false;
}

/** Ad classifier — a filled utm set that came from a paid ad. */
export function isAdUtm(u: Partial<Record<UtmKey, string>>): boolean {
  return isFilled(u.source) && hasUtm(u) && !isOrganicUtm(u);
}

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
  const tryParse = (s: string): AttrRecord | null => {
    try {
      const p = JSON.parse(s);
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as AttrRecord) : null;
    } catch {
      return null;
    }
  };
  const safeDecode = (s: string): string => { try { return decodeURIComponent(s); } catch { return s; } };
  // Handle three cookie shapes for the transition:
  //   (a) raw JSON            — post-F10 style, current
  //   (b) single-encoded      — Set-Cookie default frameworks
  //   (c) double-encoded      — legacy pre-F10 cookies still in the wild
  //                             from before the middleware fix
  return tryParse(raw)
      ?? tryParse(safeDecode(raw))
      ?? tryParse(safeDecode(safeDecode(raw)))
      ?? {};
}

/**
 * Merge a fresh page-hit into the stored cookie.
 *
 *  - landing_url + referrer are FIRST-TOUCH (write once, never overwrite).
 *  - fbclid + gclid are PURE LAST-TOUCH — the newest click ID always wins.
 *  - utm_* fields are AD-STICKY:
 *      • an ad-grade live utm overwrites anything (including a prior ad — latest ad wins)
 *      • an organic live utm does NOT overwrite a stored ad-grade utm
 *      • when nothing ad-grade is stored yet, any live utm writes
 *    Prevents an Instagram bio tap after an ad click from silently
 *    reattributing the sale to link_in_bio.
 */
export function mergeAttribution(
  stored: AttrRecord,
  opts: { live: AttrRecord; landingUrl: string; referrer: string; now: number }
): { attr: AttrRecord; changed: boolean } {
  const attr: AttrRecord = { ...stored };
  let changed = false;

  // First-touch context.
  if (!isFilled(attr.landing_url) && isFilled(opts.landingUrl)) {
    attr.landing_url = opts.landingUrl;
    attr.referrer = isFilled(opts.referrer) ? opts.referrer : '';
    changed = true;
  }

  const live = opts.live ?? {};

  // Ad-sticky utm write — WHOLE-SET replacement (addendum §1). Never
  // merge field-by-field: an ad URL missing utm_medium would otherwise
  // inherit `social` from a prior bio tap, and isOrganicUtm's
  // `medium=social + no campaign` classifier would then mis-tag the
  // stored set as organic, breaking the next ad-sticky guard.
  if (hasUtm(live) && (isAdUtm(live) || !isAdUtm(attr))) {
    for (const k of UTM_KEYS) attr[k] = live[k] ?? '';
    attr.ts = opts.now;
    changed = true;
  }

  // Pure last-touch click IDs — regardless of utm-write decision above.
  if (isFilled(live.fbclid) && attr.fbclid !== live.fbclid) {
    attr.fbclid = live.fbclid;
    attr.ts = opts.now;
    changed = true;
  }
  if (isFilled(live.gclid) && attr.gclid !== live.gclid) {
    attr.gclid = live.gclid;
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
  /** `utm:<layer>/<quality>|clid:<layer>` — e.g. `utm:cookie/ad|clid:cookie`. */
  provenance: string;
  utmSource: 'landing' | 'referrer' | 'cookie' | 'body' | 'none';
  utmQuality: 'ad' | 'organic' | 'other' | 'none';
  clidSource: 'cookie' | 'body' | 'fbc' | 'none';
}

/**
 * Quality-ranked resolver. Scans candidate sources in the order
 *   landing → referrer → cookie → body
 * and takes the first source that carries an ad-grade utm set. Only if
 * no source is ad-grade does it fall back to the best-filled source
 * (which for a genuine bio buyer correctly stays link_in_bio). Whole
 * sets are chosen, never merged field-by-field.
 *
 * fbclid precedence is unchanged: cookie → body → _fbc-derived.
 * Referrer is NEVER a source for fbclid (256-char truncation risk).
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

  const utmSetOf = (o: AttrRecord): Record<UtmKey, string> => {
    const out = {} as Record<UtmKey, string>;
    for (const k of UTM_KEYS) out[k] = o[k] ?? '';
    return out;
  };

  const candidates: Array<{
    label: ResolvedAttribution['utmSource'];
    utm: Record<UtmKey, string>;
  }> = [
    { label: 'landing',  utm: utmSetOf(parseAttributionFromUrl(landingUrl)) },
    { label: 'referrer', utm: utmSetOf(parseAttributionFromUrl(referrer)) },
    { label: 'cookie',   utm: utmSetOf(cookieAttr) },
    { label: 'body',     utm: utmSetOf(bodyAttr) },
  ];

  // First choice: any ad-grade utm anywhere.
  let chosen = candidates.find(c => isAdUtm(c.utm));
  let utmQuality: ResolvedAttribution['utmQuality'] = chosen ? 'ad' : 'none';

  // Fallback: best-filled non-ad source, so a real bio buyer still gets
  // credited to `link_in_bio` — we never fabricate an ad.
  if (!chosen) {
    chosen = candidates.find(c => hasUtm(c.utm));
    utmQuality = chosen ? (isOrganicUtm(chosen.utm) ? 'organic' : 'other') : 'none';
  }

  const utm = chosen ? { ...chosen.utm } : utmSetOf({});
  const utmSource: ResolvedAttribution['utmSource'] = chosen ? chosen.label : 'none';

  // fbclid — click IDs stay pure last-touch (cookie → body → _fbc).
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
    utm,
    fbclid,
    fbclidTs: fbclidTs || now,
    gclid: [cookieAttr.gclid, bodyAttr.gclid].find(isFilled) ?? '',
    referrer:
      [referrer, cookieAttr.referrer, bodyAttr.referrer].find(isFilled) ?? '',
    landingUrl:
      [landingUrl, cookieAttr.landing_url, bodyAttr.landing_url].find(isFilled) ?? '',
    provenance: `utm:${utmSource}/${utmQuality}|clid:${clidSource}`,
    utmSource,
    utmQuality,
    clidSource,
  };
}
