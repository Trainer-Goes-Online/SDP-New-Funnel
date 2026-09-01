import { NextRequest, NextResponse } from 'next/server';
import {
  ATTR_COOKIE,
  ATTR_TTL_SECONDS,
  mergeAttribution,
  parseAttributionFromUrl,
  readAttrCookie,
} from '@/lib/attribution';

// L1 — capture attribution at the edge on the FIRST request, before any
// React hydration. This is the fix for F1: a plain <a href="/checkout">
// on a slow in-app browser races React hydration and loses. A cookie
// written server-side by middleware doesn't care about hydration and
// survives the navigation.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  try {
    const live = parseAttributionFromUrl(req.nextUrl.search);
    const stored = readAttrCookie(req.cookies.get(ATTR_COOKIE)?.value);
    const { attr, changed } = mergeAttribution(stored, {
      live,
      landingUrl: req.nextUrl.href,
      referrer: req.headers.get('referer') ?? '',
      now: Date.now(),
    });
    if (changed) {
      // F10 — pass RAW JSON. Next's cookies.set() already percent-encodes;
      // wrapping with encodeURIComponent double-encodes (%7B → %257B), and
      // the browser reader's single-decode then fails to parse and drops
      // the cookie on the floor. See readAttrCookie for the legacy path.
      res.cookies.set(ATTR_COOKIE, JSON.stringify(attr), {
        path: '/',
        maxAge: ATTR_TTL_SECONDS,
        sameSite: 'lax',
        // httpOnly:false — a legacy client fallback may read this if the
        // request-time server read ever misses. Not a security concern:
        // the payload is public marketing attribution, never PII.
        httpOnly: false,
        secure: req.nextUrl.protocol === 'https:',
      });
    }
  } catch {
    /* attribution capture must never break a page load */
  }
  return res;
}

// Run on HTML page navigations only. Excludes:
//   - /api/*         (server routes, don't need edge capture)
//   - _next/*        (Next.js internals)
//   - any path ending in a file extension (.png .jpg .svg .ico .json .txt etc.)
export const config = {
  matcher: ['/((?!api|_next|.*\\.[a-zA-Z0-9]+$).*)'],
};
