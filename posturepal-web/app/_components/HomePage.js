'use client';

import React from 'react';
import Link from 'next/link';
import { Reveal, SectionHeading } from './motion';
import SiteHeader from './SiteHeader';
import FooterBar from './FooterBar';
import HeroBackdrop from './HeroBackdrop';
import MediaFrame from './MediaFrame';
import VideoDemo from './VideoDemo';
import { PRICE } from './purchase';

const PRIVACY_POINTS = [
  { title: 'On-device AI', body: 'All analysis happens locally, even offline.' },
  { title: 'No cloud', body: 'No servers, no sync, no account required to run.' },
  { title: 'No footage stored', body: 'Frames are analyzed and discarded in memory.' },
  { title: 'No wearable', body: 'Just the webcam you already own.' },
];

const HOW_STEPS = [
  { num: '01', title: 'Install and calibrate', body: 'Sit up the way you\'d like to sit. Click calibrate once — that\'s your baseline.' },
  { num: '02', title: 'It watches posture, on-device', body: 'The AI scores your sitting position 0–100 in real time, silently, in the background.' },
  { num: '03', title: 'A gentle nudge, when it matters', body: 'The moment you slouch, a small notification appears. One glance, one adjustment.' },
];

const ROLL_WORDS = ['deep work.', 'flow state.', 'a long coding run.'];

// Word cycler for the how-it-works lede — a single-line window scrolling a
// vertical stack of words. Each word is one line (1.45em) tall, so the stack is
// shifted by that much per step (a % here would be relative to the whole stack).
const LINE_EM = 1.45;
const WordRoll = () => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex(i => (i + 1) % ROLL_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ display: 'inline-block', height: `${LINE_EM}em`, overflow: 'hidden', verticalAlign: 'bottom' }}>
      <span style={{ display: 'block', transition: 'transform 0.5s var(--ease)', transform: `translateY(-${index * LINE_EM}em)` }}>
        {ROLL_WORDS.map(w => (
          <span key={w} style={{ display: 'block', height: `${LINE_EM}em`, lineHeight: `${LINE_EM}em`, fontWeight: 600, color: 'var(--forest)' }}>{w}</span>
        ))}
      </span>
    </span>
  );
};

const PathCard = ({ href, eyebrow, title, blurb }) => (
  <Link href={href} className="card card--shadow lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '22px 24px', textDecoration: 'none' }}>
    <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--emerald)' }}>{eyebrow}</span>
    <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {title} <span aria-hidden="true" style={{ color: 'var(--emerald)' }}>→</span>
    </span>
    <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--muted)' }}>{blurb}</span>
  </Link>
);

export default function HomePage() {
  return (
    <div>
      <SiteHeader />

      {/* HERO — split: copy left, the live posture animation as the highlight right */}
      <section className="section--hero">
        <div className="shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
          <div>
            <Reveal>
              <div className="pill"><span className="pill-dot" />On-device AI · Private by design</div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', lineHeight: 1.05, margin: '20px 0 0', maxWidth: '13ch' }}>
                Sit like you <span className="hl">mean it.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--muted)', maxWidth: '46ch', margin: '20px 0 0', textWrap: 'pretty' }}>
                A private posture coach that lives on your laptop and nudges you upright — before the ache sets in.
              </p>
            </Reveal>

            {/* Equal two-path split */}
            <Reveal delay={0.18}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginTop: '32px' }}>
                <PathCard
                  href="/teams"
                  eyebrow="For your team"
                  title="PosturePal for Teams"
                  blurb="A wellness benefit your people actually feel."
                />
                <PathCard
                  href="/individuals"
                  eyebrow="For yourself"
                  title="PosturePal for You"
                  blurb="One payment. Your back thanks you forever."
                />
              </div>
            </Reveal>
          </div>

          {/* Live posture animation — the hero highlight */}
          <HeroBackdrop />
        </div>
      </section>

      {/* PRIVACY — dark forest band */}
      <section id="privacy" className="section--lg dark-band">
        <div className="shell">
          <Reveal><div className="kicker">Privacy</div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'end', marginTop: '20px' }}>
            <Reveal delay={0.06}>
              <h2 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', lineHeight: 1.1, margin: 0, maxWidth: '16ch' }}>
                Nothing leaves your device. <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Not a frame.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--sage)', margin: 0, maxWidth: '48ch', textWrap: 'pretty' }}>
                The AI runs entirely on your laptop. No footage is recorded, no images are uploaded,
                and there is no cloud account watching over your shoulder. It works with the webcam
                you already have — no wearable, no hardware.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <div className="hairline-grid hairline-grid--dark" style={{ marginTop: '64px' }}>
              {PRIVACY_POINTS.map(p => (
                <div key={p.title}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--paper-on-dark)' }}>{p.title}</div>
                  <div style={{ fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--sage)', marginTop: '6px' }}>{p.body}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section--lg">
        <div className="shell">
          <SectionHeading kicker="How it works" title="Three steps. Zero effort." />
          <Reveal delay={0.1}>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--muted)', margin: '14px 0 0', display: 'flex', flexWrap: 'wrap', gap: '0 6px', alignItems: 'baseline' }}>
              It keeps watch quietly while you&apos;re in <WordRoll />
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', marginTop: '56px', alignItems: 'center' }}>
            <div style={{ display: 'grid' }}>
              {HOW_STEPS.map((s, i) => (
                <Reveal key={s.num} delay={i * 0.08}>
                  <div style={{ display: 'flex', gap: '20px', padding: '24px 0', borderTop: '1px solid var(--line)', borderBottom: i === HOW_STEPS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <span className="num-chip num-chip--sm" style={{ flex: 'none' }}>{s.num}</span>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</div>
                      <div style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--muted)', marginTop: '4px' }}>{s.body}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.12}>
              <MediaFrame chrome label="PosturePal — live posture score">
                <VideoDemo src="/demo-posture-score.mp4" />
              </MediaFrame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TWO-PATH CHOOSER */}
      <section id="split" className="section--lg section--wash">
        <div className="shell">
          <SectionHeading kicker="Choose your path" title="One product. Two ways to bring it home." maxWidth="24ch" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginTop: '48px' }}>
            <Reveal>
              <div className="card card--shadow" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--emerald)' }}>Teams</div>
                <h3 style={{ fontWeight: 500, fontSize: '1.7rem', letterSpacing: '-0.01em', margin: '10px 0 0' }}>PosturePal for Teams</h3>
                <ul className="check-list" style={{ margin: '22px 0 0' }}>
                  <li className="check-item"><span className="check-mark">✓</span>Fewer ergonomic complaints, more comfortable deep work</li>
                  <li className="check-item"><span className="check-mark">✓</span>A low-cost, high-visibility wellness benefit</li>
                  <li className="check-item"><span className="check-mark">✓</span>Privacy-safe for IT — nothing leaves employee devices</li>
                </ul>
                <div style={{ flex: 1 }} />
                <Link href="/teams" className="btn btn-forest" style={{ marginTop: '28px', alignSelf: 'flex-start' }}>
                  Bring PosturePal to your team →
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card card--shadow" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--emerald)' }}>Personal</div>
                <h3 style={{ fontWeight: 500, fontSize: '1.7rem', letterSpacing: '-0.01em', margin: '10px 0 0' }}>PosturePal for You</h3>
                <ul className="check-list" style={{ margin: '22px 0 0' }}>
                  <li className="check-item"><span className="check-mark">✓</span>A live posture score, and nudges before the ache sets in</li>
                  <li className="check-item"><span className="check-mark">✓</span>21-day free trial — no credit card</li>
                  <li className="check-item"><span className="check-mark">✓</span>One payment, Rs. {PRICE}. Yours forever</li>
                </ul>
                <div style={{ flex: 1 }} />
                <Link href="/individuals" className="btn btn-forest" style={{ marginTop: '28px', alignSelf: 'flex-start' }}>
                  Get it for yourself →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST ROW — real quote from an existing user, name-only attribution */}
      <section className="section">
        <div className="shell" style={{ textAlign: 'center' }}>
          <Reveal>
            <blockquote style={{ margin: '0 auto', maxWidth: '820px' }}>
              <p className="quote" style={{ color: 'var(--ink)', margin: 0 }}>
                &ldquo;Best money I&apos;ve spent this year. Back pain is practically gone after three weeks.&rdquo;
              </p>
              <footer style={{ marginTop: '20px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--faint)' }}>— David K., PosturePal user</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA — dark forest band */}
      <section className="section--lg dark-band" style={{ textAlign: 'center' }}>
        <div className="shell" style={{ maxWidth: '760px' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', lineHeight: 1.1, margin: 0 }}>Sit better, starting today.</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--sage)', margin: '18px 0 0' }}>
              Private, quiet, and always on your side. Pick your path.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '36px' }}>
              <Link href="/teams" className="btn btn-accent">For your team →</Link>
              <Link href="/individuals" className="btn btn-ghost-dark">For yourself →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterBar />
    </div>
  );
}
