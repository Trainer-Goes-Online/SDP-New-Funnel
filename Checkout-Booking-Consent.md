# Checkout Booking-Awareness Notice & Consent — Skill

A reusable UI pattern to add to any **checkout page whose payment redirects the buyer to a
second step** (booking a call, choosing a slot, completing onboarding, etc.).

## The problem this solves

Buyers complete payment, then **close or leave the tab before the automatic post-payment
redirect finishes**. They never reach the booking step, so they've paid but got "nothing" — which
breeds confusion, support tickets, refund requests, and trust damage. Two lightweight UI additions
fix it by setting expectations *before* they pay:

1. A **highlighted notice above the form** telling them to wait ~2 minutes after payment for the
   automatic redirect to the booking step.
2. A **highlighted consent checkbox next to the pay button** that they must tick to acknowledge
   they'll wait for the redirect and book their slot. Payment is gated on it.

## Two rules that always apply

- **Follow the site's own landing-page theme.** Do NOT introduce new colors, fonts, or a new
  visual style. Reuse the existing brand tokens/variables (primary/brand color, ink/text color,
  danger color, radius, fonts) already defined for the site so these elements look native to the
  page. Every color/spacing value below is a placeholder — map it to the site's existing tokens.
- **Mobile-first, optimized for every screen size.** These elements must read and tap perfectly on
  small phones through desktop: fluid text, comfortable tap targets, no horizontal overflow, and
  no cramped padding. A dedicated small-screen media query is mandatory, not optional.

---

## 1. Behavior spec

- The **notice** renders inside the form panel, **directly above the form fields** (below the
  form heading). Always visible; not dismissible.
- The **consent checkbox** renders inside the submit area, **immediately above the pay button**.
- **Payment is gated:** on pressing pay, if the box is unticked, block submission, switch the
  consent element to an error state (danger color + a short error message), and scroll it into
  view. Do not open the payment gateway until it's ticked.
- Ticking the box clears the error state immediately.
- Keep any existing analytics "attempted to pay" event firing on the click as before — the gate is
  a UI guard, it should not silently swallow that intent signal. (Do not add new tracking here.)
- Accessibility: the checkbox is a real `<input type="checkbox">` inside a `<label>` so the whole
  row is tappable; the error message uses `role="alert"`; set `aria-invalid` on error.

---

## 2. Copy (generalized — adapt tone to the brand, keep the meaning)

**Notice above the form**
> **Important — don't close this page after paying.** The moment your payment succeeds, please
> wait about **2 minutes** without closing or refreshing. You'll be redirected automatically to
> [the next step — e.g. a calendar where you book your call]. Leaving early may stop your
> [booking/order] from being completed.

**Consent checkbox label**
> I understand that after a successful payment I'll be redirected to [book my call / complete my
> booking], and I'll keep this page open for up to **2 minutes** to finish.

**Error message when unticked**
> Please confirm you'll wait for the redirect to [book your call].

Swap the bracketed phrases for the specific second step of that funnel. Keep it calm and
reassuring — the goal is to set expectations, not alarm.

---

## 3. Markup (framework-agnostic structure)

Rename classes to match the site's convention. Structure is what matters.

```html
<!-- Directly above the form fields, inside the form panel -->
<div class="co-notice" role="note">
  <span class="co-notice-icon" aria-hidden="true">⏳</span>
  <p class="co-notice-text">
    <strong>Important — don't close this page after paying.</strong>
    The moment your payment succeeds, please wait about <strong>2 minutes</strong> without
    closing or refreshing. You'll be redirected automatically to book your call. Leaving early
    may stop your booking from being completed.
  </p>
</div>

<!-- Immediately above the pay button, inside the submit area -->
<label id="co-consent" class="co-consent">   <!-- add class "err" on validation failure -->
  <input type="checkbox" class="co-consent-box" />
  <span class="co-consent-text">
    I understand that after a successful payment I'll be redirected to book my call, and I'll keep
    this page open for up to <strong>2 minutes</strong> to complete my booking.
  </span>
</label>
<p class="co-consent-msg" role="alert"><!-- shown only in error state -->
  Please confirm you'll wait for the redirect to book your call.
</p>

<button type="submit" class="pay-button">Pay &amp; Book My Call</button>
```

### Gate logic (pseudo-code)

```
state: consent = false, consentError = false

onPayClick():
  fireExistingAttemptAnalytics()          // unchanged, if present
  validateFormFields()
  if (!consent) consentError = true
  if (fieldErrors) { scrollToFirstFieldError(); return }
  if (!consent)   { scrollTo('#co-consent'); return }   // BLOCK — don't open gateway
  proceedToPayment()

onConsentChange(checked):
  consent = checked
  if (checked) consentError = false
```

---

## 4. Styling (map every value to the site's existing theme tokens)

Placeholders like `--brand`, `--ink-soft`, `--danger`, `--r` should resolve to the site's own
variables. If the site has no token, read the value off its primary CTA / landing page and reuse it
so these blocks look native.

```css
/* Highlighted notice — a tinted panel with a left accent bar in the brand color */
.co-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 22px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--brand) 7%, transparent); /* or rgba(brand,.07) */
  border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
  border-left: 4px solid var(--brand);
  border-radius: var(--r, 12px);
}
.co-notice-icon { font-size: 18px; line-height: 1.5; flex: 0 0 auto; }
.co-notice-text { margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--ink-soft); }
.co-notice-text strong { color: var(--brand-deep, var(--brand)); font-weight: 700; }

/* Highlighted consent — tinted, tappable, hover-lit; error state uses the danger color */
.co-consent {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-bottom: 16px;
  padding: 13px 15px;
  background: color-mix(in srgb, var(--brand) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent);
  border-radius: var(--r, 12px);
  cursor: pointer;
  transition: border-color .2s, background .2s;
}
.co-consent:hover { border-color: var(--brand); }
.co-consent-box {
  flex: 0 0 auto;
  width: 20px; height: 20px; margin-top: 1px;
  accent-color: var(--brand);          /* checkbox tint follows the brand */
  cursor: pointer;
}
.co-consent-text { font-size: 13px; line-height: 1.5; color: var(--ink-soft); }
.co-consent-text strong { color: var(--brand-deep, var(--brand)); font-weight: 700; }

.co-consent.err {
  background: color-mix(in srgb, var(--danger) 6%, transparent);
  border-color: var(--danger);
  animation: coConsentShake .4s ease;
}
@keyframes coConsentShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.co-consent-msg { margin: -6px 0 16px; font-size: 12.5px; font-weight: 600; color: var(--danger); }

@media (prefers-reduced-motion: reduce) {
  .co-consent.err { animation: none; }
}
```

### Mandatory mobile optimization

Test and tune from ~320px up. Tighten padding, keep text fluid, and enlarge the checkbox tap
target on touch.

```css
@media (max-width: 480px) {
  .co-notice { padding: 12px 13px; margin-bottom: 18px; }
  .co-notice-text { font-size: 12.5px; }
  .co-consent { padding: 12px 13px; }
  .co-consent-text { font-size: 12.5px; }
  .co-consent-box { width: 22px; height: 22px; }  /* larger, easier to tap */
}
```

Also ensure globally (usually already true on a themed page): text uses `overflow-wrap: break-word`
so long words never overflow, and the page never scrolls horizontally at any width.

---

## 5. QA checklist

- **Placement:** notice sits directly above the form fields; consent sits directly above the pay
  button.
- **Gate:** pressing pay with the box unticked does NOT open the payment gateway — it shows the
  error state and scrolls to the checkbox. Ticking it clears the error and lets payment proceed.
- **Theme match:** the notice/consent use the site's brand color, danger color, radius, and fonts —
  they look like they belong to the page, not bolted on.
- **Mobile (test 320 / 360 / 390 / 414 px):** no horizontal scroll; text wraps cleanly; padding
  isn't cramped; checkbox is an easy tap target; consent still reads clearly above a full-width pay
  button.
- **Desktop/tablet:** notice and consent align to the form width and read comfortably.
- **A11y:** whole consent row is clickable (input inside label); error announced via
  `role="alert"`; `aria-invalid` toggles with the error state.
- **Reduced motion:** the error shake is suppressed under `prefers-reduced-motion`.
```
