interface Props {
  /** Set true on privacy/refund/terms — they include the Empirical Performance LLP attribution. */
  includeLlp?: boolean;
}

export default function PolicyFooter({ includeLlp = true }: Props) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="copy">SCIENCE DRIVEN PERFORMANCE</div>
        <p>
          © 2026 Science Driven Performance. All rights reserved. A TrainerGoesOnline
          initiative.{includeLlp ? ' Empirical Performance LLP.' : ''}
        </p>
        <div className="links">
          <a href="/new-privacy-policy/">Privacy Policy</a> ·{' '}
          <a href="/new-terms-and-conditions">Terms of Use</a> ·{' '}
          <a href="/new-refund-policy/">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}
