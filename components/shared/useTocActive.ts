'use client';

import { useEffect } from 'react';

/**
 * Highlights the active link in a `.toc` aside as the user scrolls past
 * each `<section id="...">` referenced by `<a href="#id">` in the TOC.
 */
export function useTocActive(tocSelector = '.toc a') {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(tocSelector));
    if (!tocLinks.length) return;

    const sections = tocLinks
      .map(a => {
        const id = a.getAttribute('href')?.slice(1) ?? '';
        return { link: a, el: id ? document.getElementById(id) : null };
      })
      .filter((s): s is { link: HTMLAnchorElement; el: HTMLElement } => !!s.el);

    function onScroll() {
      const y = window.scrollY + 120;
      let current = sections[0];
      for (const s of sections) {
        if (s.el.offsetTop <= y) current = s;
      }
      tocLinks.forEach(a => a.classList.remove('active'));
      if (current) current.link.classList.add('active');
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tocSelector]);
}
