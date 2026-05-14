# CLAUDE.md

Orientation for Claude Code working in this repo. Keep edits aligned with the product positioning and conventions below.

## Product context

**Science Driven Performance (SDP)** is a 90-day, clinical, data-driven fitness coaching system. This repo is the **sales funnel** for it — not the product itself.

- **Who it sells to:** senior professionals 40+, India-based and NRI globally, who have restarted fitness 3+ times. Decision-makers with travel-heavy lifestyles.
- **Core proof points used throughout copy:** 550+ clients across 14 countries, 8-year track record, full blood-panel every 90 days (HbA1c, fasting insulin, lipids, testosterone, vitamin D, thyroid), 10% body-weight loss guarantee, founders Anish & Shubham.
- **Funnel flow:** landing (`/`) → checkout (`/new-checkout-page`, ₹97 refundable pre-strategy call) → book-a-call (`/new-book-a-call`, calendar slot picker) → thank-you (`/new-thank-you`, confirmation + Vimeo follow-up video). Three policy pages support the checkout.
- **Tone:** clinical, low-hype, empathetic to past failure, refund-friendly. Lean on blood-marker data, not transformation hype. Global-friendly phrasing but India-first (₹ pricing, Razorpay).
- **Site metadata base:** `https://sciencedrivenperformance.com`.

When editing copy or UI: preserve the "engineered for senior professionals" framing and refundable / no-pressure trust signals. Avoid bro-fitness language.

## Tech stack

- **Framework:** Next.js 15.5 (App Router) with React 19, TypeScript 5.6 (strict, ES2022, path alias `@/*`).
- **Styling:** vanilla CSS only — **no Tailwind, no CSS modules**. Each page route owns a sibling `.css` file; shared base in [app/globals.css](app/globals.css). Class naming is BEM-ish under `.sdp-*` (e.g. `.sdp-root`, `.sdp-section`, `.sdp-light`, `.sdp-dark`). Light/dark themes via CSS custom properties (`--brand`, `--bg`, `--ink`, …).
- **Fonts:** Bebas Neue (headings), Manrope (body) from Google Fonts, preconnected in [app/layout.tsx](app/layout.tsx).
- **Payments:** [razorpay](https://www.npmjs.com/package/razorpay) v2.9 (server SDK + lazy-loaded checkout.js via Next.js `<Script strategy="lazyOnload">`).
- **Phone input:** [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js) v1.11 for validation/formatting.
- **Tooling:** npm (lockfile committed). No Tailwind, no styled-components, no UI kit.

See [package.json](package.json), [tsconfig.json](tsconfig.json), [next.config.ts](next.config.ts) (`reactStrictMode: true`, otherwise minimal).

## Route map

All non-root routes use the `/new-*` prefix. Don't rename without checking ad-traffic redirects.

| URL | Page file | CSS | Main component |
|---|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | [app/landing.css](app/landing.css) | [components/landing/LandingPage.tsx](components/landing/LandingPage.tsx) |
| `/new-checkout-page` | [app/new-checkout-page/page.tsx](app/new-checkout-page/page.tsx) | [app/new-checkout-page/checkout.css](app/new-checkout-page/checkout.css) | [components/checkout/CheckoutForm.tsx](components/checkout/CheckoutForm.tsx) |
| `/new-book-a-call` | [app/new-book-a-call/page.tsx](app/new-book-a-call/page.tsx) | [app/new-book-a-call/book-a-call.css](app/new-book-a-call/book-a-call.css) | [components/book-a-call/BookACallPage.tsx](components/book-a-call/BookACallPage.tsx) |
| `/new-thank-you` | [app/new-thank-you/page.tsx](app/new-thank-you/page.tsx) | [app/new-thank-you/thank-you.css](app/new-thank-you/thank-you.css) | [components/thank-you/ThankYouPage.tsx](components/thank-you/ThankYouPage.tsx) |
| `/new-privacy-policy` | [app/new-privacy-policy/page.tsx](app/new-privacy-policy/page.tsx) | [app/new-privacy-policy/privacy.css](app/new-privacy-policy/privacy.css) | [components/policy/PrivacyPage.tsx](components/policy/PrivacyPage.tsx) |
| `/new-refund-policy` | [app/new-refund-policy/page.tsx](app/new-refund-policy/page.tsx) | [app/new-refund-policy/refund.css](app/new-refund-policy/refund.css) | [components/policy/RefundPage.tsx](components/policy/RefundPage.tsx) |
| `/new-terms-and-conditions` | [app/new-terms-and-conditions/page.tsx](app/new-terms-and-conditions/page.tsx) | [app/new-terms-and-conditions/terms.css](app/new-terms-and-conditions/terms.css) | [components/policy/TermsPage.tsx](components/policy/TermsPage.tsx) |

**API routes:**

- `POST /api/razorpay/create-order` — [app/api/razorpay/create-order/route.ts](app/api/razorpay/create-order/route.ts). Creates Razorpay order; handles 100%-off coupon bypass (returns synthetic success without hitting Razorpay).
- `POST /api/razorpay/verify-payment` — [app/api/razorpay/verify-payment/route.ts](app/api/razorpay/verify-payment/route.ts). Verifies signature, fires Meta CAPI Purchase event, posts to Pabbly webhook for downstream CRM.

## Directory layout

```
app/                  App Router pages, API routes, per-route CSS, globals.css, layout.tsx
components/
  landing/            LandingPage.tsx (hero, VSL, testimonials, FAQ, CTAs)
  checkout/           CheckoutForm.tsx (form state, country dropdown, Razorpay handoff)
  book-a-call/        BookACallPage.tsx (calendar slot picker)
  thank-you/          ThankYouPage.tsx (confirmation + Vimeo follow-up)
  policy/             Privacy/Refund/Terms pages + PolicyHero, PolicyContactCTA, PolicyFooter
  shared/             useScrollReveal, useTocActive, useConversionPush, AnimatedCounter
lib/
  types.ts            CustomerData, UtmData, RazorpayResponse, Country, etc.
  pricing.ts          ORIGINAL_PRICE_INR=999; PRICE_INR from NEXT_PUBLIC_PRICE_INR; coupon logic
  countries.ts        Country list with dial codes + flags
  validation.ts       email / phone / name / city validators
  utm.ts              UTM capture from URL + decoration of outbound links
public/
  transformation-images/   Client before/after photos
```

## Integrations & env vars

Set in `.env.local` (gitignored). **Names only — never commit values.**

- **Razorpay** (live): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- **Pricing:** `NEXT_PUBLIC_PRICE_INR` — actual charged price (e.g. `1` for test, `97` default, `999` full). Strikethrough always shows ₹999.
- **Test bypass coupon:** `TEST_BYPASS_COUPON` — value `TGOTEST2026` skips Razorpay entirely for free end-to-end testing of the funnel.
- **Pabbly webhook:** `PABBLY_WEBHOOK_URL` — posts payment + customer + UTM payload for CRM automation.
- **Meta CAPI (optional):** `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` — server-side Purchase event with hashed email/phone.

**Third-party scripts:** Razorpay checkout.js (lazy-loaded), Vimeo (VSL on landing, follow-up video on thank-you).

## Conventions & gotchas

- **Per-page CSS:** each route's stylesheet sits next to its `page.tsx`. Don't dump styles into `globals.css` — keep them route-local. `landing.css` is ~100KB; that's intentional, it owns the entire long-form landing page.
- **Vanilla CSS only.** Resist the urge to add Tailwind or a CSS-in-JS lib. Use existing `--brand`, `--bg`, `--ink` CSS variables for theming.
- **All page components are `'use client'`** — server components are used only for thin `page.tsx` wrappers and the API routes.
- **UTM tracking:** every inbound URL's UTM params are captured by [lib/utm.ts](lib/utm.ts) and forwarded through the funnel; preserve this when adding new outbound links.
- **Analytics hook:** [components/shared/useConversionPush.ts](components/shared/useConversionPush.ts) is the single place for client-side conversion events. Reuse it; don't sprinkle ad-hoc pixel calls.
- **Scroll-reveal animations:** [components/shared/useScrollReveal.ts](components/shared/useScrollReveal.ts) — add `data-reveal` markers rather than re-implementing intersection observers.
- **Razorpay coupon bypass** lives entirely server-side in `create-order/route.ts`. Don't gate it client-side or the coupon becomes visible in the bundle.
- **Free checkout for QA:** use coupon `TGOTEST2026` on `/new-checkout-page`.

## Dev commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```
