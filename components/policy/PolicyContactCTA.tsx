import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  heading: ReactNode;
  body: ReactNode;
}

export default function PolicyContactCTA({ icon, heading, body }: Props) {
  return (
    <section className="contact">
      <div className="wrap">
        <div className="contact-icon" aria-hidden="true" data-reveal>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <h3 data-reveal style={{ ['--d' as string]: '.06s' }}>{heading}</h3>
        <p data-reveal style={{ ['--d' as string]: '.10s' }}>{body}</p>
        <a href="/" className="home-link" data-reveal style={{ ['--d' as string]: '.16s' }}>
          ← Back to homepage
        </a>
      </div>
    </section>
  );
}
