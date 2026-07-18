'use client';

import React from 'react';
import Link from 'next/link';
import { Reveal, SectionHeading } from './motion';
import SiteHeader from './SiteHeader';
import FooterBar from './FooterBar';
import HeroBackdrop from './HeroBackdrop';
import MediaFrame from './MediaFrame';
import VideoDemo from './VideoDemo';
import FaqList from './FaqList';
import { PRICE, RazorpayButton, TrialButton } from './purchase';

const FAQS = [
  { q: "How does the free trial work?", a: "Sign up with your name and email, download PosturePal for Windows or Mac, and click the launch link. You get 21 days of full access — no credit card required. The trial timer starts when you launch the app (within 24 hours of signing up). After 21 days, you can keep using PosturePal forever by paying Rs. 299 once." },
  { q: "Is it available now?", a: "Yes. Start the free trial, or buy a lifetime license. Both download links are sent immediately." },
  { q: "Does my webcam footage get sent anywhere?", a: "No. All processing is on-device. Nothing leaves your machine." },
  { q: "Does it work on Mac, Windows, and Linux?", a: "Currently available on Windows & Mac. Linux versions are coming soon." },
  { q: "What if I wear glasses or have a beard?", a: "PosturePal tracks skeletal points — shoulders, ears, nose — not your face. Glasses and beards are irrelevant." },
  { q: "Can I use it on two computers?", a: "Yes. A paid license covers 2 devices. A free trial is tied to one device." },
  { q: "Is this a subscription?", a: "No. One payment, lifetime access." },
];

const FEATURES = [
  {
    num: '01', video: '/demo-posture-score.mp4', mediaFirst: false,
    title: 'Know your score.',
    body: 'AI analyzes your sitting position and scores it 0–100 in real time. You always know exactly where you stand — or sit.',
    bullets: ['Real-time AI posture analysis', 'Score from 0 to 100, updated live', 'Tells you exactly what to adjust'],
  },
  {
    num: '02', video: '/demo-slouch-alerts.mp4', mediaFirst: true, wash: true,
    title: 'Get nudged before it hurts.',
    body: 'Runs silently. The moment your posture drops, a small notification appears. One glance, one adjustment, back to work.',
    bullets: ['Runs silently in the background', 'Non-intrusive desktop notification', 'One glance to correct and move on'],
  },
  {
    num: '03', video: '/demo-progress.mp4', mediaFirst: false,
    title: 'Track your improvement.',
    body: 'See exactly how much time you spend in good vs bad posture — daily and weekly — so the improvement is visible, not vague.',
    bullets: ['Good vs bad posture time split', 'Daily and weekly score trends', 'Long-term progress tracking'],
  },
];

const TRIAL_FEATURES = ['Full posture detection', 'Alerts & analytics', 'Works fully offline', 'Upgrade anytime'];
const LIFETIME_FEATURES = ['Lifetime license, 2 devices', '100% offline AI', 'Webcam stays on your device', 'License key shown instantly'];

export default function IndividualsPage() {
  return (
    <div>
      <SiteHeader />

      {/* HERO — copy left, live posture animation right */}
      <section className="section--hero">
        <div className="shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
          <div>
            <Reveal><div className="pill">PosturePal for You</div></Reveal>
            <Reveal delay={0.06}>
              <h1 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)', lineHeight: 1.08, margin: '20px 0 0', maxWidth: '15ch' }}>
                Your back will <span className="hl">thank you.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--muted)', margin: '20px 0 0', maxWidth: '46ch', textWrap: 'pretty' }}>
                PosturePal turns your laptop&apos;s webcam into a quiet posture coach that nudges you
                before the ache sets in. Private. Offline. One payment.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '30px' }}>
                <TrialButton buttonText="Start free trial — 21 days" />
                <a href="#pricing-ind" className="btn btn-ghost">Buy lifetime — Rs. {PRICE}</a>
              </div>
            </Reveal>
            <Reveal delay={0.22}>
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--faint)', margin: '18px 0 0' }}>
                No credit card for the trial · Windows &amp; Mac
              </p>
            </Reveal>
          </div>
          <HeroBackdrop />
        </div>
      </section>

      {/* FEATURES 01–03 */}
      {FEATURES.map(f => (
        <section key={f.num} className={`section--feature${f.wash ? ' section--wash' : ''}`}>
          <div className="shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'center' }}>
            {f.mediaFirst && (
              <Reveal delay={0.12}>
                <MediaFrame>
                  <VideoDemo src={f.video} />
                </MediaFrame>
              </Reveal>
            )}
            <div>
              <Reveal><div className="num-chip">{f.num}</div></Reveal>
              <Reveal delay={0.06}>
                <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.015em', margin: '18px 0 0' }}>{f.title}</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--muted)', margin: '14px 0 0', maxWidth: '52ch' }}>{f.body}</p>
              </Reveal>
              <Reveal delay={0.14}>
                <ul className="check-list" style={{ margin: '22px 0 0' }}>
                  {f.bullets.map(b => (
                    <li key={b} className="check-item"><span className="check-mark">✓</span>{b}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
            {!f.mediaFirst && (
              <Reveal delay={0.12}>
                <MediaFrame>
                  <VideoDemo src={f.video} />
                </MediaFrame>
              </Reveal>
            )}
          </div>
        </section>
      ))}

      {/* PULL QUOTE — real user testimonial, name-only attribution */}
      <section className="section--feature" style={{ textAlign: 'center' }}>
        <div className="shell" style={{ maxWidth: '820px' }}>
          <Reveal>
            <blockquote style={{ margin: 0 }}>
              <p className="quote" style={{ color: 'var(--ink)', margin: 0 }}>
                &ldquo;My chiropractor asked what changed. I told him I have an AI watching my posture.&rdquo;
              </p>
              <footer style={{ marginTop: '18px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--faint)' }}>— Elena R., PosturePal user</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing-ind" className="section section--wash">
        <div className="shell" style={{ textAlign: 'center' }}>
          <SectionHeading kicker="Try free or buy once" title="Build the habit. Then keep it forever." center maxWidth="22ch" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '28px', margin: '48px auto 0', maxWidth: '820px', alignItems: 'stretch', textAlign: 'left' }}>
            <Reveal>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="pill pill--neutral" style={{ alignSelf: 'flex-start' }}>Free trial</div>
                <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.01em', marginTop: '18px' }}>21 days, on us.</div>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--muted)', margin: '6px 0 0' }}>No credit card. Full access.</p>
                <ul className="check-list check-list--hairline" style={{ margin: '22px 0 0' }}>
                  {TRIAL_FEATURES.map(feat => (
                    <li key={feat} className="check-item"><span className="check-mark">✓</span>{feat}</li>
                  ))}
                </ul>
                <div style={{ flex: 1 }} />
                <TrialButton buttonText="Start free trial →" variant="ghost" style={{ marginTop: '26px', width: '100%' }} />
                <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--faint)', margin: '12px 0 0', textAlign: 'center' }}>Timer starts when you launch the app.</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card" style={{ boxShadow: '6px 6px 0 rgba(22, 65, 46, 0.85)', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="pill pill--float">Most popular</div>
                <div className="pill" style={{ alignSelf: 'flex-start', padding: '6px 14px', letterSpacing: '0.1em' }}>Lifetime</div>
                <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.01em', marginTop: '18px' }}>One payment. Forever.</div>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--muted)', margin: '6px 0 0' }}>Rs. {PRICE} — no subscription.</p>
                <ul className="check-list check-list--hairline" style={{ margin: '22px 0 0' }}>
                  {LIFETIME_FEATURES.map(feat => (
                    <li key={feat} className="check-item"><span className="check-mark">✓</span>{feat}</li>
                  ))}
                </ul>
                <div style={{ flex: 1 }} />
                <RazorpayButton buttonText={`Pay Rs. ${PRICE} →`} style={{ marginTop: '26px', width: '100%' }} />
                <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--faint)', margin: '12px 0 0', textAlign: 'center' }}>Secure payment via Razorpay.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--faint)', margin: '32px 0 0' }}>
              Available for Windows &amp; Mac · Linux coming soon
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="shell shell--narrow">
          <SectionHeading kicker="FAQ" title="Questions, answered." />
          <Reveal delay={0.1}>
            <div style={{ marginTop: '32px' }}>
              <FaqList items={FAQS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA — dark band */}
      <section className="section--lg dark-band" style={{ textAlign: 'center' }}>
        <div className="shell" style={{ maxWidth: '720px' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.1, margin: 0 }}>The ache isn&apos;t a habit yet. Keep it that way.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '34px' }}>
              <a href="#pricing-ind" className="btn btn-accent">Start free trial</a>
              <Link href="/teams" className="btn btn-ghost-dark">For my team instead →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterBar />
    </div>
  );
}
