'use client';

import React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Easing for the framer-motion interactions that remain (FAQ accordion, mobile menu).
export const EASE = [0.22, 1, 0.36, 1];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// GSAP scroll reveal — a premium eased fade + rise that fires once as the
// element scrolls in. Initial opacity:0 is inline so there's no flash of
// unstyled content before GSAP takes over.
export const Reveal = ({ children, delay = 0, y = 18, style = {}, className }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} style={{ opacity: 0, ...style }} className={className}>
      {children}
    </div>
  );
};

// Kicker + heading + optional lede — the repeating section header pattern.
export const SectionHeading = ({ kicker, title, lede, center = false, onDark = false, maxWidth }) => (
  <div style={{ textAlign: center ? 'center' : 'left' }}>
    {kicker && (
      <Reveal>
        <div className={`kicker${onDark ? ' kicker--on-dark' : ''}${center ? ' kicker--center' : ''}`}>{kicker}</div>
      </Reveal>
    )}
    <Reveal delay={0.06}>
      <h2
        style={{
          fontSize: 'clamp(1.85rem, 3vw, 2.75rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          margin: center ? '16px auto 0' : '16px 0 0',
          maxWidth,
        }}
      >
        {title}
      </h2>
    </Reveal>
    {lede && (
      <Reveal delay={0.1}>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: onDark ? 'var(--sage)' : 'var(--muted)',
            margin: center ? '14px auto 0' : '14px 0 0',
            maxWidth: '52ch',
          }}
        >
          {lede}
        </p>
      </Reveal>
    )}
  </div>
);
