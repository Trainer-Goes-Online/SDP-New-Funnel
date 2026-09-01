import type { UtmData } from './types';
import { ORGANIC_SOURCES } from './attribution';

const COOKIE_KEY = 'sdp_utm';
const COOKIE_TTL_DAYS = 90;

const TRACKED_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'ref',
] as const;

// UTM subset for ad-vs-organic classification. Must stay in sync with
// lib/attribution.ts's UTM_KEYS so the client and edge cookies agree
// on whether a stored utm is "ad-grade" or "organic bio-tap".
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CLID_KEYS = ['gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id'] as const;

function hasAnyUtm(s: Record<string, string>): boolean {
  return UTM_KEYS.some(k => !!s[k]);
}
function isOrganicUtmSet(s: Record<string, string>): boolean {
  if (!hasAnyUtm(s)) return false;
  if ((s.utm_content ?? '').toLowerCase() === 'link_in_bio') return true;
  if (ORGANIC_SOURCES.has((s.utm_source ?? '').toLowerCase())) return true;
  if ((s.utm_medium ?? '').toLowerCase() === 'social' && !s.utm_campaign) return true;
  return false;
}
function isAdUtmSet(s: Record<string, string>): boolean {
  return !!s.utm_source && hasAnyUtm(s) && !isOrganicUtmSet(s);
}

function readCookieJson(name: string): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const escaped = name.replace(/([.$?*|{}()[\]\\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  try {
    return match ? (JSON.parse(decodeURIComponent(match[1])) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeCookieJson(name: string, value: Record<string, string>) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Lax`;
}

function toUtmData(o: Record<string, string>): UtmData {
  return {
    source:       o.utm_source   || undefined,
    medium:       o.utm_medium   || undefined,
    campaign:     o.utm_campaign || undefined,
    content:      o.utm_content  || undefined,
    term:         o.utm_term     || undefined,
    utm_id:       o.utm_id       || undefined,
    gclid:        o.gclid        || undefined,
    fbclid:       o.fbclid       || undefined,
    msclkid:      o.msclkid      || undefined,
    ttclid:       o.ttclid       || undefined,
    li_fat_id:    o.li_fat_id    || undefined,
    ref:          o.ref          || undefined,
    referrer:     o.referrer     || undefined,
    landing_path: o.landing_path || undefined,
    first_seen:   o.first_seen   || undefined,
  };
}

export function captureUtm(searchParams: URLSearchParams): UtmData {
  const stored = readCookieJson(COOKIE_KEY);
  let dirty = false;

  // Assemble the live utm set from this page hit.
  const live: Record<string, string> = {};
  TRACKED_KEYS.forEach(k => {
    const v = searchParams.get(k);
    if (v) live[k] = v;
  });

  // Ad-sticky utm write — an organic bio tap (utm_source=ig,
  // utm_content=link_in_bio, …) must NOT overwrite a stored ad utm.
  // A real ad always wins (latest ad wins). Keeps the client cookie
  // aligned with the server sdp_attr cookie's mergeAttribution logic.
  const liveUtm: Record<string, string> = {};
  for (const k of UTM_KEYS) if (live[k]) liveUtm[k] = live[k];
  // utm_id piggybacks on the utm block since it identifies the same ad set.
  if (live.utm_id) liveUtm.utm_id = live.utm_id;

  if (hasAnyUtm(liveUtm) && (isAdUtmSet(liveUtm) || !isAdUtmSet(stored))) {
    // WHOLE-SET replacement (addendum §1) — never inherit any field
    // from the prior set, or an ad URL missing utm_medium picks up
    // `social` from a bio tap and later mis-classifies as organic.
    for (const k of UTM_KEYS) {
      const v = liveUtm[k] ?? '';
      if (stored[k] !== v) { stored[k] = v; dirty = true; }
    }
    const idv = liveUtm.utm_id ?? '';
    if (stored.utm_id !== idv) { stored.utm_id = idv; dirty = true; }
  }

  // Click IDs are PURE last-touch — the newest click ID always wins,
  // regardless of ad-vs-organic. Meta cares about the latest fbclid it
  // saw the user on; refreshing it is required for attribution match.
  CLID_KEYS.forEach(k => { if (live[k] && stored[k] !== live[k]) { stored[k] = live[k]; dirty = true; } });
  if (live.ref && stored.ref !== live.ref) { stored.ref = live.ref; dirty = true; }

  if (!stored.referrer && typeof document !== 'undefined' && document.referrer) {
    try {
      const rh = new URL(document.referrer).hostname;
      if (rh && rh !== window.location.hostname) { stored.referrer = rh; dirty = true; }
    } catch { /* noop */ }
  }
  if (!stored.landing_path && typeof window !== 'undefined') {
    stored.landing_path = window.location.pathname; dirty = true;
  }
  if (!stored.first_seen) { stored.first_seen = new Date().toISOString(); dirty = true; }

  if (dirty) writeCookieJson(COOKIE_KEY, stored);
  return toUtmData(stored);
}

export function restoreUtm(): UtmData {
  return toUtmData(readCookieJson(COOKIE_KEY));
}

/**
 * Append canonical UTM/click-id params (not internal first-touch keys) to a
 * given href. Used for outbound CTA links so attribution survives a hop
 * to a different origin even when the cookie isn't shared.
 */
export function decorateHref(href: string): string {
  if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return href;
  const stored = readCookieJson(COOKIE_KEY);
  const extra: string[] = [];
  TRACKED_KEYS.forEach(k => {
    const v = stored[k];
    if (v) extra.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  });
  if (!extra.length) return href;
  const sep = href.indexOf('?') === -1 ? '?' : '&';
  return href + sep + extra.join('&');
}
