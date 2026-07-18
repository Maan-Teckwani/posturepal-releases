'use client';

import React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Hero posture animation — the spine slouches amber, a "Sit Straight" reminder
// sweeps in from the left and glows, and the spine straightens to green in
// response. The looping motion is pure CSS (keyframes in globals.css); GSAP adds
// a premium entrance + a subtle scroll parallax. Decorative only.
// First block is the base (column-reverse stacks it at the bottom); the last is
// the head, which straightens last.
const BLOCKS = [
  { w: 'clamp(180px,26vw,300px)', h: 'clamp(32px,4.8vh,50px)', slx: '-12px', sly: '0px',  slr: '-2deg',   o: 0.6,  r: 12 },
  { w: 'clamp(160px,23vw,266px)', h: 'clamp(30px,4.5vh,46px)', slx: '18px',  sly: '0px',  slr: '3.5deg',  o: 0.66, r: 11 },
  { w: 'clamp(150px,22vw,256px)', h: 'clamp(30px,4.5vh,46px)', slx: '-24px', sly: '0px',  slr: '-5deg',   o: 0.72, r: 11 },
  { w: 'clamp(140px,21vw,242px)', h: 'clamp(29px,4.3vh,44px)', slx: '22px',  sly: '0px',  slr: '4.5deg',  o: 0.78, r: 10 },
  { w: 'clamp(128px,20vw,226px)', h: 'clamp(28px,4.2vh,42px)', slx: '-30px', sly: '0px',  slr: '-6.5deg', o: 0.84, r: 10 },
  { w: 'clamp(104px,16vw,188px)', h: 'clamp(28px,4.2vh,42px)', slx: '28px',  sly: '-4px', slr: '6.5deg',  o: 0.92, r: 10 },
];

const HeroBackdrop = () => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Subtle scroll parallax — a pure enhancement; it never hides content, so the
    // panel (its CSS entrance handles fade-in) is always visible even if GSAP is slow.
    const ctx = gsap.context(() => {
      gsap.to(el.querySelector('.pp-layer'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 20%', end: 'bottom top', scrub: true },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-pp="" className="hero-anim">
      <div className="pp-layer">
        <div className="pp-stack">
          <div className="pp-ground" />
          <div className="pp-nudge">
            <div className="pp-beam" />
            <div className="pp-halo" />
            <div className="pp-pill"><span className="pp-pill-dot" />Sit Straight</div>
          </div>
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              className="pp-block"
              style={{
                width: b.w,
                height: b.h,
                borderRadius: b.r,
                opacity: b.o,
                animationDelay: `${i * 0.1}s, ${i * 0.1}s`,
                '--slx': b.slx,
                '--sly': b.sly,
                '--slr': b.slr,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBackdrop;
