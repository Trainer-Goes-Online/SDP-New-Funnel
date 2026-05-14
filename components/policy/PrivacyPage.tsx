'use client';

import { useScrollReveal } from '@/components/shared/useScrollReveal';
import { useTocActive } from '@/components/shared/useTocActive';
import PolicyHero from './PolicyHero';
import PolicyContactCTA from './PolicyContactCTA';
import PolicyFooter from './PolicyFooter';

const TOC = [
  { id: 'who', label: 'Who We Are' },
  { id: 'what', label: 'What We Collect' },
  { id: 'comments', label: 'Comments' },
  { id: 'media', label: 'Media Uploads' },
  { id: 'forms', label: 'Contact Forms' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'embeds', label: 'Embedded Content' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'share', label: 'Who We Share With' },
  { id: 'retain', label: 'How Long We Keep It' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'protect', label: 'How We Protect Data' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPage() {
  useScrollReveal();
  useTocActive();

  return (
    <>
      <PolicyHero
        eyebrow="Privacy · Plain English"
        title={<>PRIVACY <em>POLICY.</em></>}
        sub={
          <>
            What we collect, why we collect it, how long we keep it, and exactly what
            control you have. <strong>No jargon, no padding.</strong>
          </>
        }
        metaLabel="Site"
        metaValue="sciencedrivenperformance.in"
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
                This policy describes how <strong>Science Driven Performance</strong>{' '}
                (operated by <strong>Empirical Performance LLP</strong>) collects, uses,
                and protects your personal data when you visit our website, fill out
                forms, or work with us as a coaching client.
              </p>

              <section className="legal-section" id="who" data-reveal>
                <h2>Who We Are</h2>
                <p>
                  Our website address is{' '}
                  <a href="https://sciencedrivenperformance.in" target="_blank" rel="noopener noreferrer">
                    sciencedrivenperformance.in
                  </a>
                  . Science Driven Performance is the trading name of Empirical Performance
                  LLP, an India-registered partnership delivering science-driven coaching
                  to senior professionals.
                </p>
              </section>

              <section className="legal-section" id="what" data-reveal>
                <h2>What Personal Data We Collect — And Why</h2>
                <p>We only collect what we actually use. The categories below cover everything that may touch our systems.</p>
                <ul className="l-list">
                  <li><strong>Contact data:</strong> name, email, phone, country — collected when you book a pre-strategy call or fill out a contact form.</li>
                  <li><strong>Health context you choose to share:</strong> bloodwork values, weight history, training notes, schedule constraints — only collected if and when you share them as part of coaching.</li>
                  <li><strong>Technical data:</strong> IP address, browser user agent, referring URL, pages visited — collected automatically for security, analytics, and abuse prevention.</li>
                  <li><strong>Payment metadata:</strong> we never see or store your card number. Razorpay processes payments and shares back only the transaction status and payer name/email.</li>
                </ul>
              </section>

              <section className="legal-section" id="comments" data-reveal>
                <h2>Comments</h2>
                <p>If you leave a comment on the site, we collect the data shown in the comment form, plus your IP address and browser user agent string. This helps us flag spam.</p>
                <p>
                  An anonymised string (a hash) derived from your email may be sent to the
                  Gravatar service to check if you have a Gravatar profile picture. The
                  Gravatar privacy policy is available at{' '}
                  <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer">
                    automattic.com/privacy
                  </a>
                  . After your comment is approved, your profile picture is publicly
                  visible alongside it.
                </p>
              </section>

              <section className="legal-section" id="media" data-reveal>
                <h2>Media</h2>
                <p>If you upload images to the website, avoid uploading images containing embedded location data (EXIF GPS). Other visitors can download images and extract location metadata from them.</p>
              </section>

              <section className="legal-section" id="forms" data-reveal>
                <h2>Contact Forms</h2>
                <p>When you submit a contact or booking form, we receive the data you entered and store it for the purpose of replying, scheduling your pre-strategy call, and (if you become a client) onboarding you. We do not sell or trade form submissions.</p>
              </section>

              <section className="legal-section" id="cookies" data-reveal>
                <h2>Cookies</h2>
                <p>Cookies are small text files stored in your browser. We use them sparingly:</p>
                <ul className="l-list">
                  <li><strong>Comment cookies:</strong> if you leave a comment, you can opt-in to save your name, email, and website in cookies so you do not have to refill them. These last one year.</li>
                  <li><strong>Login cookies:</strong> if you visit our login page, a temporary cookie checks whether your browser accepts cookies. It contains no personal data and is discarded when you close your browser.</li>
                  <li><strong>Session cookies:</strong> when you log in, additional cookies save your login state and screen display preferences. Login cookies last two days; screen-option cookies last one year. “Remember Me” extends the login cookie to two weeks. Logging out removes them.</li>
                  <li><strong>Edit cookies:</strong> if you edit or publish an article, a cookie records the post ID. It expires after one day and holds no personal data.</li>
                </ul>
              </section>

              <section className="legal-section" id="embeds" data-reveal>
                <h2>Embedded Content From Other Websites</h2>
                <p>Pages on this site may include embedded content such as Vimeo videos or Calendly booking widgets. Embedded content behaves exactly as if you had visited that third-party website directly — those websites may collect data about you, set their own cookies, embed additional tracking, and monitor your interaction with the embedded content, including if you are logged into that site.</p>
              </section>

              <section className="legal-section" id="analytics" data-reveal>
                <h2>Analytics</h2>
                <p>We use privacy-respecting analytics to understand which content is useful and which is not. Analytics data is aggregated and does not identify you individually. Where we run advertising on Meta or Google, those platforms set their own cookies subject to their own privacy policies.</p>
              </section>

              <section className="legal-section" id="share" data-reveal>
                <h2>Who We Share Your Data With</h2>
                <p>We share the minimum necessary data with the following categories of service providers, all bound by their own privacy obligations:</p>
                <ul className="l-list">
                  <li><strong>Razorpay</strong> — payment processing for the pre-strategy fee.</li>
                  <li><strong>Calendly</strong> — booking and scheduling your pre-strategy call slot.</li>
                  <li><strong>Email and calendar providers</strong> — to send booking confirmations, prep emails, and reminders.</li>
                  <li><strong>Spam-detection services</strong> — visitor comments may be automatically checked for spam.</li>
                </ul>
                <p>We do not sell your data. Ever.</p>
              </section>

              <section className="legal-section" id="retain" data-reveal>
                <h2>How Long We Retain Your Data</h2>
                <p>If you leave a comment, the comment and its metadata are retained indefinitely so we can automatically recognise and approve any follow-up comments instead of holding them for moderation.</p>
                <p>For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can view, edit, or delete their personal information at any time (except they cannot change their username). Site administrators can also view and edit that information.</p>
                <p>For coaching clients, we retain your data for the duration of the engagement plus as long as needed for legal, tax, or compliance obligations.</p>
              </section>

              <section className="legal-section" id="rights" data-reveal>
                <h2>What Rights You Have Over Your Data</h2>
                <p>If you have an account on this site or have left comments, you can request an exported file of the personal data we hold about you, including any data you have provided. You can also request that we erase any personal data we hold. This does not include data we are legally required to keep for administrative, financial, legal, or security reasons.</p>
                <div className="callout">
                  <div className="callout-title">Easiest path: <em>email us.</em></div>
                  <p>
                    Send your request to <strong>coaching@sciencedrivenperformance.com</strong>{' '}
                    from the email address we have on file, and we will action it within a
                    reasonable timeframe.
                  </p>
                </div>
              </section>

              <section className="legal-section" id="protect" data-reveal>
                <h2>How We Protect Your Data</h2>
                <p>Access to client data is limited to coaching team members who need it to do their work. We use reputable cloud providers, enforce strong passwords and two-factor authentication on internal systems, and review access periodically. No internet-connected system is 100% secure, but we take reasonable, industry-standard precautions.</p>

                <h3>Data Breach Procedures</h3>
                <p>If we detect a breach affecting your personal data, we will notify affected users by email and, where required, the relevant authorities, within the timeframe required by applicable law.</p>

                <h3>Automated Decision-Making and Profiling</h3>
                <p>We do not use automated decision-making or algorithmic profiling to make material decisions about clients. Coaching decisions are made by humans, informed by data you have chosen to share.</p>

                <h3>What Third Parties We Receive Data From</h3>
                <p>If you arrive via a third-party referrer (for example, a paid advertising platform or a social network), we may receive standard referral data such as the URL you came from. We do not purchase personal data from third-party brokers.</p>
              </section>

              <section className="legal-section" id="contact" data-reveal>
                <h2>Your Contact Information &amp; Questions</h2>
                <p>
                  For any privacy-related question, exercise of rights, or correction
                  request, contact us at{' '}
                  <a href="mailto:coaching@sciencedrivenperformance.com">
                    coaching@sciencedrivenperformance.com
                  </a>
                  . We try to respond within a few business days.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>

      <PolicyContactCTA
        icon={
          <>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </>
        }
        heading={<>Privacy Question Or <em>Data Request?</em></>}
        body={
          <>
            Email <a href="mailto:coaching@sciencedrivenperformance.com">coaching@sciencedrivenperformance.com</a>{' '}
            and we will get back to you within a few business days.
          </>
        }
      />

      <PolicyFooter />
    </>
  );
}
