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

// ── Config the owner should review before launch ────────────────────────────
// Where team-demo requests land, shown to visitors and used as the reply-to on
// the Web3Forms submission.
const SALES_EMAIL = 'maan@posturepal.in';
// Web3Forms access key (safe to expose client-side — it only routes to your
// verified inbox). Set NEXT_PUBLIC_WEB3FORMS_KEY in .env.local and in Vercel.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
// ─────────────────────────────────────────────────────────────────────────────

const B2B_FAQS = [
  { q: 'Does employee webcam footage ever leave their device?', a: 'No. All posture analysis runs on-device. Frames are processed locally and never uploaded, stored, or streamed anywhere. The app works fully offline — there is no cloud component in the detection loop.' },
  { q: 'What do employees actually see?', a: 'A live posture score, a quiet desktop notification when their posture slips, and a personal dashboard of their daily and weekly trends. Nothing is shared with anyone else — including their manager.' },
  { q: 'Can managers or HR see individual posture data?', a: 'No. Posture data stays on each employee\'s machine. Anonymized, team-level trend reporting is on our roadmap — individual surveillance is not, and never will be.' },
  { q: 'What does rollout involve?', a: 'Send employees the installer (Windows & macOS) and a license key. There are no employee accounts to provision, no servers to stand up, and no hardware to procure. Most people are calibrated and running in under two minutes.' },
  { q: 'How is it licensed for teams?', a: 'Per seat, with volume pricing and invoice billing. Tell us your headcount and we\'ll send a quote the same day.' },
  { q: 'Can we try it before buying?', a: 'Yes. Run a free 21-day pilot with any group — full features, no credit card, no procurement required. If it doesn\'t stick, you\'ve spent nothing.' },
  { q: 'Do you hold SOC 2 / ISO certifications?', a: 'We don\'t claim certifications we don\'t hold. What we can show you is the architecture: no footage leaves the device, no employee accounts, no cloud processing. Bring your IT team to the demo — we\'ll answer anything.' },
];

const VALUE_TRIO = [
  { title: 'Fewer ergonomic complaints', body: 'Catch slouching in the moment — before it becomes the neck ache that lands on HR\'s desk.' },
  { title: 'Better deep-work comfort', body: 'Comfortable people focus longer. A quiet nudge beats a mid-afternoon backache every time.' },
  { title: 'A benefit people notice', body: 'Low cost per seat, felt daily. Wellness spend your team can actually point to.' },
];

const IT_CHECKLIST = [
  'All AI runs on the employee\'s device — offline-capable',
  'No footage recorded, stored, or transmitted',
  'No admin dashboard of individual behavior — ever',
  'Simple installers for Windows & Mac; Linux coming soon',
];

// The three product demos, framed for a team audience.
const TEAMS_DEMOS = [
  { num: '01', video: '/demo-posture-score.mp4', mediaFirst: false,
    title: 'A live posture score', body: 'Every employee sees their sitting position scored 0–100 in real time — private to them, never to a manager.' },
  { num: '02', video: '/demo-slouch-alerts.mp4', mediaFirst: true, wash: true,
    title: 'A gentle, on-device nudge', body: 'The moment posture slips, a quiet desktop reminder appears. No meetings, no behaviour program — it just works in the background.' },
  { num: '03', video: '/demo-progress.mp4', mediaFirst: false,
    title: 'Progress people can feel', body: 'Daily and weekly trends make the improvement visible to the one person who can act on it — the employee.' },
];

const ROLLOUT_STEPS = [
  { step: 'STEP 01', title: 'Pilot with one team', body: 'Start with 10–20 volunteers for a few weeks. No procurement drama.' },
  { step: 'STEP 02', title: 'Send license keys', body: 'Each person installs in minutes and calibrates once. That\'s the whole setup.' },
  { step: 'STEP 03', title: 'Hear about it', body: 'People feel the difference in weeks — and tell you. Expand when you\'re ready.' },
];

// Small inline control: shows SALES_EMAIL with a one-click copy button so
// visitors can write to us directly without opening a mail client.
const EmailCopy = () => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(SALES_EMAIL).then(() => setCopied(true)).catch(() => {});
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <a href={`mailto:${SALES_EMAIL}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{SALES_EMAIL}</a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
        style={{
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em',
          color: copied ? 'var(--accent)' : 'var(--sage)', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '4px 12px',
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
};

// Demo-request form — registers interest via Web3Forms, which emails the
// submitted address straight to SALES_EMAIL. No backend of our own.
const DemoRequestForm = () => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!WEB3FORMS_KEY) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Team demo request — PosturePal',
          from_name: 'PosturePal for Teams',
          email,
          replyto: email,
          message: `New team demo request.\n\nWork email: ${email}`,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div style={{ marginTop: '24px', background: 'var(--forest-deep)', border: '1.5px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '20px 22px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent)' }}>✓ Interest registered</div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--sage)', margin: '6px 0 0' }}>
          Thanks — we&apos;ll reach out to you shortly. Prefer to write first? Reach us at <EmailCopy />
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
        <input
          type="email"
          required
          placeholder="you@company.com"
          aria-label="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input field-input--dark"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button type="submit" className="btn btn-accent" style={{ padding: '13px 24px' }} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Register interest'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ fontSize: '0.82rem', fontWeight: 500, color: '#E5A3A3', margin: '12px 0 0' }}>
          Something went wrong. Please write to us directly instead.
        </p>
      )}
      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8FA396', margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>Enter your email and we&apos;ll reach out — or write to us at</span>
        <EmailCopy />
      </div>
    </>
  );
};

export default function TeamsPage() {
  return (
    <div>
      <SiteHeader />

      {/* HERO — copy left, live posture animation right */}
      <section className="section--hero">
        <div className="shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
          <div>
            <Reveal><div className="pill">PosturePal for Teams</div></Reveal>
            <Reveal delay={0.06}>
              <h1 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)', lineHeight: 1.08, margin: '20px 0 0', maxWidth: '16ch' }}>
                A wellness benefit your team actually <span className="hl">feels.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--muted)', margin: '20px 0 0', maxWidth: '48ch', textWrap: 'pretty' }}>
                Desk work quietly wears backs down. PosturePal keeps your people upright through the
                day — with on-device AI that never sends a single frame off their laptop. IT-friendly
                by design.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '30px' }}>
                <a href="#pricing-teams" className="btn btn-accent">Book a demo</a>
                <Link href="/#how" className="btn btn-ghost">See how it works</Link>
              </div>
            </Reveal>
          </div>
          <HeroBackdrop />
        </div>
      </section>

      {/* VALUE TRIO */}
      <section className="section section--wash">
        <div className="shell">
          <SectionHeading kicker="Why teams run it" title="Small nudges. Visible outcomes." maxWidth="24ch" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '48px' }}>
            {VALUE_TRIO.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.08}>
                <div className="card--soft" style={{ height: '100%' }}>
                  <h3 style={{ fontFamily: 'inherit', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>{card.title}</h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--muted)', margin: '10px 0 0' }}>{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEE IT IN ACTION — the three product demos */}
      <section className="section">
        <div className="shell">
          <SectionHeading kicker="See it in action" title="What your team actually gets." maxWidth="22ch" />
          <div style={{ display: 'grid', gap: 'clamp(48px, 6vw, 80px)', marginTop: '48px' }}>
            {TEAMS_DEMOS.map(f => (
              <div key={f.num} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }}>
                {f.mediaFirst && (
                  <Reveal delay={0.12}>
                    <MediaFrame><VideoDemo src={f.video} /></MediaFrame>
                  </Reveal>
                )}
                <div>
                  <Reveal><div className="num-chip">{f.num}</div></Reveal>
                  <Reveal delay={0.06}>
                    <h3 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)', lineHeight: 1.2, letterSpacing: '-0.01em', margin: '16px 0 0' }}>{f.title}</h3>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--muted)', margin: '12px 0 0', maxWidth: '48ch' }}>{f.body}</p>
                  </Reveal>
                </div>
                {!f.mediaFirst && (
                  <Reveal delay={0.12}>
                    <MediaFrame><VideoDemo src={f.video} /></MediaFrame>
                  </Reveal>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY FOR IT — dark band */}
      <section className="section dark-band">
        <div className="shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <Reveal><div className="kicker">For your IT review</div></Reveal>
            <Reveal delay={0.06}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.015em', margin: '16px 0 0' }}>
                Cameras stay private. Full stop.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--sage)', margin: '16px 0 0', maxWidth: '52ch' }}>
                There is no employee-monitoring angle here — by architecture, not by policy. Nothing
                to host, nothing to secure, nothing to audit for camera data.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <ul className="check-list check-list--hairline-dark">
              {IT_CHECKLIST.map(item => (
                <li key={item} className="check-item"><span className="check-mark">✓</span>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ROLLOUT */}
      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Rollout" title="Live in an afternoon." />
          <div className="hairline-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: '48px' }}>
            {ROLLOUT_STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08} style={{ padding: '28px 24px 0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--faint)' }}>{s.step}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '8px' }}>{s.title}</div>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--muted)', margin: '6px 0 0' }}>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / DEMO */}
      <section id="pricing-teams" className="section section--wash">
        <div className="shell">
          <SectionHeading kicker="Pricing" title="Simple, per-seat. Let's talk." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginTop: '48px', alignItems: 'start' }}>
            <Reveal>
              <div className="card card--shadow">
                <div className="pill" style={{ padding: '6px 14px', letterSpacing: '0.1em' }}>Teams license</div>
                <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.01em', marginTop: '18px' }}>Per-seat, one-time</div>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--muted)', margin: '8px 0 0' }}>
                  Volume pricing on the Rs. 299 lifetime license. No subscriptions, no renewals to
                  manage. <span className="mono-note">(FINAL PRICING TBD — lead capture, not checkout)</span>
                </p>
                <ul className="check-list" style={{ margin: '22px 0 0' }}>
                  <li className="check-item"><span className="check-mark">✓</span>License keys for every seat, managed by email</li>
                  <li className="check-item"><span className="check-mark">✓</span>Free pilot for your first team</li>
                  <li className="check-item"><span className="check-mark">✓</span>Priority support during rollout</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card--forest" style={{ borderRadius: 'var(--radius-lg)', padding: '36px 32px' }}>
                <h3 style={{ fontWeight: 500, fontSize: '1.6rem', letterSpacing: '-0.01em', margin: 0 }}>Book a 20-minute demo</h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--sage)', margin: '10px 0 0' }}>
                  We&apos;ll show the product live, answer your IT questions, and set up a pilot.
                </p>
                <DemoRequestForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="shell shell--narrow">
          <SectionHeading kicker="FAQ" title="Questions IT will ask." />
          <Reveal delay={0.1}>
            <div style={{ marginTop: '32px' }}>
              <FaqList items={B2B_FAQS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA — dark band */}
      <section className="section--lg dark-band" style={{ textAlign: 'center' }}>
        <div className="shell" style={{ maxWidth: '720px' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.1, margin: 0 }}>Bring PosturePal to your team.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '34px' }}>
              <a href="#pricing-teams" className="btn btn-accent">Book a demo</a>
              <Link href="/individuals" className="btn btn-ghost-dark">Just for me instead →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterBar />
    </div>
  );
}
