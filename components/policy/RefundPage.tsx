'use client';

import { useScrollReveal } from '@/components/shared/useScrollReveal';
import { useTocActive } from '@/components/shared/useTocActive';
import PolicyHero from './PolicyHero';
import PolicyContactCTA from './PolicyContactCTA';
import PolicyFooter from './PolicyFooter';

const TOC = [
  { id: 'intro', label: 'Introduction' },
  { id: 'fee', label: '₹97 Pre-Strategy Fee' },
  { id: 'offers', label: 'Coaching Refunds' },
  { id: 'guarantee', label: 'Money-Back Guarantee' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'exclusions', label: 'Exclusions' },
  { id: 'metrics', label: 'What We Look At' },
  { id: 'process', label: 'How To Request' },
  { id: 'timeline', label: 'Timeline & Method' },
  { id: 'queries', label: 'Query Channels' },
  { id: 'final', label: 'Final Note' },
];

export default function RefundPage() {
  useScrollReveal();
  useTocActive();

  return (
    <>
      <PolicyHero
        eyebrow="Refund Policy · Plain English"
        title={<>REFUND <em>POLICY.</em></>}
        sub={
          <>
            The full policy for the <strong>₹97 pre-strategy fee</strong> and the SDP
            comprehensive coaching programme. Refund windows, eligibility, what counts,
            what doesn’t.
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
                At Science Driven Performance, we are dedicated to providing exceptional
                service and value for your investment in your health. Please read this
                refund policy fully before committing to any coaching service.{' '}
                <strong>Your satisfaction is our priority</strong>, and we want both sides
                aligned on what refunds look like before you sign up.
              </p>

              <section className="legal-section" id="intro" data-reveal>
                <h2>Introduction</h2>
                <p>
                  All fees paid towards our coaching services are{' '}
                  <strong>non-refundable under normal circumstances</strong>. However, in
                  the unlikely event that our coaching team is unable to deliver the
                  signed-up program before the agreed deadline, we will adjust your fees
                  against any services already delivered and refund any balance remaining.
                </p>
                <p>
                  For additional context, also read the{' '}
                  <a href="/new-terms-and-conditions">Terms &amp; Conditions</a>. If
                  anything below is unclear, email us before you commit —{' '}
                  <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>.
                </p>
              </section>

              <section className="legal-section" id="fee" data-reveal>
                <h2>₹97 Pre-Strategy Fee</h2>
                <p>
                  The ₹97 fee charged at the time of booking your pre-strategy call is{' '}
                  <strong>fully refundable</strong> under either of these conditions:
                </p>
                <ul className="l-list">
                  <li><strong>Either side decides we are not the right fit</strong> on the pre-strategy call.</li>
                  <li><strong>You decide to step away after the call</strong> and notify us within the booking confirmation thread.</li>
                </ul>
                <p>
                  No friction, no follow-up email asking you to reconsider. Mention it on
                  the call or reply to the booking confirmation. Refund processes within{' '}
                  <strong>48 hours</strong> back to the original payment method.
                </p>
              </section>

              <section className="legal-section" id="offers" data-reveal>
                <h2>Coaching Programme Refunds</h2>
                <p>SDP coaching is sold in two structures. Refund handling differs:</p>
                <div className="plan-grid">
                  <div className="plan-card">
                    <div className="label">Plan 01</div>
                    <div className="name">SDP Comprehensive Coaching</div>
                    <div className="row"><span><b>Refund window:</b> Within 90 days of purchase.</span></div>
                    <div className="row"><span><b>How to request:</b> Email proof of purchase to <b>coaching@sciencedrivenperformance.com</b>.</span></div>
                    <div className="row"><span><b>After 90 days:</b> No refunds, except under the money-back guarantee below.</span></div>
                  </div>
                  <div className="plan-card">
                    <div className="label">Plan 02</div>
                    <div className="name">Comprehensive Monthly Subscription</div>
                    <div className="row"><span><b>Refund window:</b> Monthly subscription fees are non-refundable.</span></div>
                    <div className="row"><span><b>Cancellation:</b> Cancel any time through your account or by emailing us. You won’t be charged for the following month.</span></div>
                    <div className="row"><span><b>No prorating</b> for the current billing month.</span></div>
                  </div>
                </div>
              </section>

              <section className="legal-section" id="guarantee" data-reveal>
                <h2>Money-Back Guarantee</h2>
                <p>If you have not achieved the results projected for you after the program design phase, you may be eligible for a refund under the conditions below. The guarantee exists because we believe in the system — and because we ask you to commit fully to it before claiming it does not work.</p>
                <div className="callout">
                  <div className="callout-title">The deal: <em>commit, execute, document.</em></div>
                  <p>If you follow the protocol and the protocol fails, we own that. If the protocol was never executed, we cannot honestly say it failed.</p>
                </div>
              </section>

              <section className="legal-section" id="eligibility" data-reveal>
                <h2>Eligibility Criteria</h2>
                <p>To qualify for a money-back-guarantee refund, you must satisfy <strong>all</strong> of the following:</p>
                <ul className="l-list">
                  <li><strong>Documentation:</strong> monthly weight tracker, training data, records of regular communication with coaches, and outcomes from the strategies prescribed.</li>
                  <li><strong>Progression stage:</strong> completion of the “Fat Loss” phase, or a minimum of six months in the “Gaining” phase.</li>
                  <li><strong>Time-bound request:</strong> refund requests must be submitted within 15 days of reaching the one-year mark of your association with SDP. Requests beyond this window will not be entertained.</li>
                </ul>
              </section>

              <section className="legal-section" id="exclusions" data-reveal>
                <h2>Exclusions — Refunds Will Not Be Granted If</h2>
                <ul className="x-list">
                  <li>You are still within the initial Fat Loss or Muscle Gain phase and have not completed at least 3 to 6 months in coaching.</li>
                  <li>You have already achieved or exceeded the initial goals set by the coaching team.</li>
                  <li>You did not adhere to the training, diet, or tracking protocol prescribed by the coaching team.</li>
                  <li>You did not follow our guidelines and protocols generally.</li>
                  <li>You exited the program prematurely and rejoined later.</li>
                  <li>You did not actively participate in or attend recommended training and consultation sessions.</li>
                  <li>You did not use or integrate the provided tools and resources as directed.</li>
                  <li>You used dishonest tactics or misrepresented adherence.</li>
                  <li>You failed to provide timely feedback or to collaborate during scheduled checkpoints and reviews.</li>
                </ul>
              </section>

              <section className="legal-section" id="metrics" data-reveal>
                <h2>What We Actually Look At</h2>
                <p>Refund requests are reviewed against the following:</p>
                <ul className="l-list">
                  <li><strong>Adherence to training, diet, and accountability protocols</strong> — did you follow the plan as designed?</li>
                  <li><strong>Consistent communication, attendance, and action</strong> — did you show up to check-in calls, raise issues in time, and execute action steps based on your performance metrics?</li>
                  <li><strong>Document compliance</strong> — did you read, understand, and correctly implement the actionable documents provided by the coaching team?</li>
                </ul>
              </section>

              <section className="legal-section" id="process" data-reveal>
                <h2>How To Request A Refund</h2>
                <div className="step-list">
                  <div className="step-item">
                    <div className="step-num">01</div>
                    <div className="step-text"><b>Start with us.</b> Email our support team at <b>coaching@sciencedrivenperformance.com</b> with all necessary documentation and a clear written summary of your request.</div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">02</div>
                    <div className="step-text"><b>Patient review.</b> Allow us up to <b>14 business days</b> for a thorough review. We may reach out for further clarification or supporting evidence.</div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">03</div>
                    <div className="step-text"><b>Decision.</b> Post-review, we will share our decision in writing. If we are refunding, expect the amount within the next <b>14 business days</b>.</div>
                  </div>
                </div>
              </section>

              <section className="legal-section" id="timeline" data-reveal>
                <h2>Timeline &amp; Method Of Refund</h2>
                <ul className="l-list">
                  <li><strong>Time frame for request:</strong> within 15 days of the one-year mark of your association with SDP for the money-back guarantee; within the 90-day window for the comprehensive coaching plan.</li>
                  <li><strong>Method:</strong> refunds are processed using the original payment method. Where this is not possible, we will arrange a bank transfer.</li>
                  <li><strong>Posting time:</strong> please allow up to <strong>14 business days</strong> for the refund to reflect in your account.</li>
                  <li><strong>Documentation:</strong> all refund claims must be supported by the documentation specified above. The refund request form (link shared on email) guides you through what we need. Incomplete forms or missing documentation may lead to denial.</li>
                  <li><strong>Policy review:</strong> we may modify this policy at any time. Major changes will be communicated by email. It is your responsibility to stay updated.</li>
                </ul>
              </section>

              <section className="legal-section" id="queries" data-reveal>
                <h2>Where To Raise Coaching Queries</h2>
                <p>To make sure your coaching queries are not missed, raise them through the official channels only:</p>
                <ul className="l-list">
                  <li><strong>Fortnightly check-in calls.</strong></li>
                  <li>
                    <strong>Support email:</strong>{' '}
                    <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>.
                  </li>
                </ul>
                <p>Queries posted only in WhatsApp groups or DMs to individual team members may be missed due to high message volume and will not be considered as “raised in time” for refund-eligibility purposes.</p>
              </section>

              <section className="legal-section" id="final" data-reveal>
                <h2>Final Note</h2>
                <p>We are rooting for your success. This policy exists so that both of us are aligned about what success looks like, what counts as effort, and what happens when something is genuinely not working. <strong>We are more than a platform — we are your partners in growth.</strong> If challenges emerge, lean on us. We are here to guide, support, and work with you.</p>
                <p>Any financial statements or personal information shared during the refund process will be handled with utmost confidentiality and used only to assess the refund request.</p>
              </section>
            </article>
          </div>
        </div>
      </section>

      <PolicyContactCTA
        icon={
          <>
            <path d="M12 2l8 3v7c0 4.97-3.35 9.26-8 10-4.65-.74-8-5.03-8-10V5l8-3z" />
            <polyline points="9 12 11 14 15 10" />
          </>
        }
        heading={<>Refund Question Or <em>Request?</em></>}
        body={
          <>
            Email{' '}
            <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>{' '}
            with proof of purchase and supporting documentation. We respond within a few
            business days.
          </>
        }
      />

      <PolicyFooter />
    </>
  );
}
