import Link from 'next/link';
import { BrandMark } from './SiteHeader';

const COLUMNS = [
  {
    head: 'Product',
    links: [
      { href: '/#how', label: 'How it works' },
      { href: '/individuals#pricing-ind', label: 'Pricing' },
      { href: '/download', label: 'Download' },
    ],
  },
  {
    head: 'Teams',
    links: [
      { href: '/teams', label: 'Overview' },
      { href: '/teams#pricing-teams', label: 'Book a demo' },
    ],
  },
  {
    head: 'Personal',
    links: [
      { href: '/individuals', label: 'Overview' },
      { href: '/individuals#pricing-ind', label: 'Free trial' },
      { href: '/individuals#pricing-ind', label: 'Buy lifetime' },
    ],
  },
  {
    head: 'Legal',
    links: [
      { href: '/#privacy', label: 'Privacy' },
      { href: 'mailto:support@posturepal.io', label: 'Contact', external: true },
    ],
  },
];

// Global site footer — rendered as the last element of each marketing page.
const FooterBar = () => (
  <footer style={{ background: 'var(--wash)', borderTop: '1px solid var(--line)', padding: 'clamp(48px, 6vw, 72px) 24px 40px' }}>
    <div className="shell">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '40px' }}>
        <div style={{ minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandMark size={26} />
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink)' }}>PosturePal</span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--faint)', margin: '14px 0 0', maxWidth: '26ch' }}>
            On-device AI that watches your posture — never your privacy.
          </p>
        </div>
        {COLUMNS.map(col => (
          <div key={col.head}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '14px' }}>
              {col.head}
            </div>
            <div style={{ display: 'grid', gap: '10px', justifyItems: 'start' }}>
              {col.links.map(l =>
                l.external ? (
                  <a key={l.label} href={l.href} className="footer-link">{l.label}</a>
                ) : (
                  <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--faint)' }}>© 2026 PosturePal. Made with care for your spine.</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--faint)' }}>Windows &amp; Mac · Linux coming soon</span>
      </div>
    </div>
  </footer>
);

export default FooterBar;
