'use client';

import { useEffect } from 'react';

/**
 * Adds `.vis` to every element matching `[data-reveal]` as it enters the
 * viewport. Mirrors the CSS in landing.css / book-a-call.css that animates
 * opacity + translateY based on that class.
 */
export function useScrollReveal(selector = '[data-reveal]') {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('vis'));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );

    elements.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [selector]);
}
