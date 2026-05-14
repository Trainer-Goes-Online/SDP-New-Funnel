'use client';

import { useScrollReveal } from '@/components/shared/useScrollReveal';
import { useTocActive } from '@/components/shared/useTocActive';
import PolicyHero from './PolicyHero';
import PolicyContactCTA from './PolicyContactCTA';
import PolicyFooter from './PolicyFooter';

const TOC = [
  { id: 'agree', label: 'Agreement' },
  { id: 'services', label: 'Services' },
  { id: 'purchase', label: 'Purchase Options' },
  { id: 'refund', label: 'Refund Policy' },
  { id: 'premium', label: 'Premium Services' },
  { id: 'changes', label: 'Service Changes' },
  { id: 'limits', label: 'Limitations' },
  { id: 'client', label: 'Client Responsibility' },
  { id: 'copyright', label: 'Copyright & IP' },
  { id: 'payments', label: 'Payments & Billing' },
  { id: 'liability', label: 'Limitation Of Liability' },
  { id: 'indemnify', label: 'Indemnification' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  useScrollReveal();
  useTocActive();

  return (
    <>
      <PolicyHero
        eyebrow="Terms · Use Of Services"
        title={<>TERMS &amp; <em>CONDITIONS.</em></>}
        sub={
          <>
            The agreement between you and Science Driven Performance when you book a call,
            purchase coaching, or use this website. <strong>Read once, refer back when needed.</strong>
          </>
        }
        metaLabel="Operator"
        metaValue="Empirical Performance LLP"
      />

      <section className="legal">
        <div className="wrap">
          <div className="legal-grid">
            <aside className="toc" data-reveal>
              <div className="toc-label">On This Page</div>
              <ul>
                {TOC.map(({ id, label }) => (
                  <li key={id}><a href={`#${id}`}>{label}</a></li>
                ))}
              </ul>
            </aside>

            <article className="legal-body">
              <p className="legal-intro" data-reveal>
                <strong>Please read these terms carefully before using this site or our services.</strong>{' '}
                By using Science Driven Performance services, you agree to be bound by the
                terms below. We reserve the right to change these terms at any time without
                notice; continued use of our services constitutes acceptance of the updated
                terms.
              </p>

              <section className="legal-section" id="agree" data-reveal>
                <h2>The Agreement</h2>
                <p>
                  These terms form a binding agreement between you (the “Client” or “you”)
                  and <strong>Empirical Performance LLP</strong>, trading as{' '}
                  <strong>Science Driven Performance</strong> (“SDP”, “we”, “us”). They
                  apply whenever you visit the website, book a pre-strategy call, or
                  purchase coaching.
                </p>
              </section>

              <section className="legal-section" id="services" data-reveal>
                <h2>Description Of Services</h2>
                <p>Science Driven Performance provides personalised coaching services focused on fat loss, body recomposition, and overall fitness improvement for senior professionals. The service typically includes customised training plans, nutrition guidance, regular progress tracking, bloodwork-informed adjustments, and structured one-on-one communication with the coaching team. Specific deliverables and scope are detailed on the website and confirmed before enrolment.</p>
              </section>

              <section className="legal-section" id="purchase" data-reveal>
                <h2>Purchase Options</h2>
                <p>We offer two purchase structures:</p>
                <div className="options-grid">
                  <div className="option-card">
                    <div className="label">Option 01</div>
                    <div className="name">One-Time Purchase</div>
                    <p>A single payment for a defined service period as outlined on the website. No automatic renewal.</p>
                  </div>
                  <div className="option-card">
                    <div className="label">Option 02</div>
                    <div className="name">Subscription</div>
                    <p>A recurring payment for ongoing coaching. Subscriptions automatically renew for the same duration as initially selected unless cancelled by either party.</p>
                  </div>
                </div>
              </section>

              <section className="legal-section" id="refund" data-reveal>
                <h2>Refund Policy</h2>
                <p>
                  The <strong>₹97 pre-strategy fee</strong> is fully refundable if either
                  party decides on the call that we are not the right fit. The full
                  coaching refund policy, including the results-guarantee terms,
                  eligibility criteria, and exclusions, is published on our dedicated
                  refund policy page.
                </p>
                <div className="callout">
                  <div className="callout-title">Read the full policy: <em>refund-policy</em></div>
                  <p>
                    For detailed refund windows, eligibility, exclusions, and the request
                    process, see the{' '}
                    <a
                      href="/new-refund-policy/"
                      style={{ color: 'var(--brand-bright)', borderBottom: '1px solid rgba(96,165,250,.5)' }}
                    >
                      Refund Policy
                    </a>{' '}
                    page.
                  </p>
                </div>
              </section>

              <section className="legal-section" id="premium" data-reveal>
                <h2>Premium Services</h2>
                <p>We offer premium one-on-one coaching services that may include online training sessions, advanced nutrition planning, bloodwork-driven protocol adjustments, and detailed body composition analysis. These services are marketed through digital platforms (including Instagram, Facebook, YouTube, and email) to generate qualified leads and awareness.</p>
              </section>

              <section className="legal-section" id="changes" data-reveal>
                <h2>Modifications To Services &amp; Prices</h2>
                <p>Prices and service offerings are subject to change without notice. We reserve the right to modify, replace, or discontinue any service at any time. We are not liable to you or any third party for any modification, price change, or service suspension.</p>
              </section>

              <section className="legal-section" id="limits" data-reveal>
                <h2>Limitations Of Service</h2>
                <p>Our services are designed for personal use only. They are not intended for use by competitors or for any benchmarking, reverse-engineering, or syndication activity. Any change to your engagement beyond the outlined scope of your current plan requires mutual written approval.</p>
              </section>

              <section className="legal-section" id="client" data-reveal>
                <h2>Client Responsibility</h2>
                <p>While we provide expert tools, structured protocols, and ongoing coaching, the outcome of your fitness journey is ultimately your responsibility. You must follow the guidance, communicate honestly, and execute the plan to achieve results. You are also responsible for understanding and complying with your own medical, dietary, and personal health constraints, and for consulting qualified healthcare professionals where appropriate.</p>
                <div className="callout">
                  <div className="callout-title">Medical disclaimer.</div>
                  <p>
                    SDP coaching is for informational and educational purposes. It is not
                    medical advice. <strong>Always consult a qualified healthcare professional</strong>{' '}
                    before making changes to your diet, exercise, or lifestyle — especially
                    if you have existing conditions, are on medication, or are recovering
                    from surgery.
                  </p>
                </div>
              </section>

              <section className="legal-section" id="copyright" data-reveal>
                <h2>Copyright &amp; Intellectual Property</h2>
                <p>All content, training materials, written guides, audio, video, and frameworks created by us are the intellectual property of <strong>Empirical Performance LLP</strong> (trading as Science Driven Performance). Upon termination of your subscription, all materials provided to you may be used for personal reference only. You do not have the right to sell, license, redistribute, repost, or otherwise share these materials with third parties.</p>
              </section>

              <section className="legal-section" id="payments" data-reveal>
                <h2>Payments &amp; Billing</h2>
                <p>All payments for setup, coaching, and any premium services are due upfront unless otherwise agreed in writing. Subscriptions are billed on the schedule confirmed at signup, with automatic renewals unless cancelled. Failure to pay on time may result in suspension or immediate termination of service.</p>
                <p>The ₹97 pre-strategy fee is processed at the time of booking. Refer to the refund policy for refund handling.</p>
              </section>

              <section className="legal-section" id="liability" data-reveal>
                <h2>Limitation Of Liability</h2>
                <p>
                  Science Driven Performance is not liable for any indirect, incidental,
                  consequential, or special damages arising from your use of our services.
                  Our services are provided <strong>“as is”</strong> and we make no
                  guarantees regarding uninterrupted or error-free service, third-party
                  platform availability, or specific health outcomes. Individual results
                  vary based on adherence, baseline state, and many other factors outside
                  our control.
                </p>
              </section>

              <section className="legal-section" id="indemnify" data-reveal>
                <h2>Indemnification</h2>
                <p>You agree to indemnify, defend, and hold harmless Empirical Performance LLP (trading as Science Driven Performance) and its affiliates, partners, employees, contractors, and licensors from and against any and all liabilities, damages, losses, and expenses (including reasonable legal fees) arising from third-party claims, judgments, or settlements due to your misuse of the services, breach of these terms, or violation of any applicable laws or regulations.</p>
              </section>

              <section className="legal-section" id="contact" data-reveal>
                <h2>Contact</h2>
                <p>
                  Questions or comments regarding these terms? Email us at{' '}
                  <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>
                  . We respond within a few business days.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>

      <PolicyContactCTA
        icon={
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </>
        }
        heading={<>Question About <em>The Terms?</em></>}
        body={
          <>
            Email{' '}
            <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>.
            Plain English, real answer.
          </>
        }
      />

      <PolicyFooter />
    </>
  );
}
