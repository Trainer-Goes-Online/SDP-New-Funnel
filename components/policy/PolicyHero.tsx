import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: ReactNode;
  sub: ReactNode;
  metaLabel: string;
  metaValue: string;
}

export default function PolicyHero({ eyebrow, title, sub, metaLabel, metaValue }: Props) {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow" data-reveal>{eyebrow}</div>
        <h1 data-reveal style={{ ['--d' as string]: '.08s' }}>{title}</h1>
        <p className="hero-sub" data-reveal style={{ ['--d' as string]: '.14s' }}>{sub}</p>
        <div className="hero-meta" data-reveal style={{ ['--d' as string]: '.20s' }}>
          <span className="pip" aria-hidden="true" />
          {metaLabel}: <b>{metaValue}</b>
        </div>
      </div>
    </section>
  );
}
