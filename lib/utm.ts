import type { UtmData } from './types';

const COOKIE_KEY = 'sdp_utm';
const COOKIE_TTL_DAYS = 90;

const TRACKED_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'ref',
] as const;

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

  TRACKED_KEYS.forEach(k => {
    const v = searchParams.get(k);
    if (v) { stored[k] = v; dirty = true; }
  });

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
