'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from './motion';

const NAV_LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/teams', label: 'Teams' },
  { href: '/individuals', label: 'Personal' },
  { href: '/individuals#pricing-ind', label: 'Pricing' },
];

// Modernized mark — upright figure / spine curve in a forest rounded square.
export const BrandMark = ({ size = 30 }) => (
  <span
    aria-hidden="true"
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.3),
      background: 'var(--forest)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5.5" r="2.5" fill="var(--accent)" />
      <path
        d="M12 9.5 C 15 11.5, 15 14.5, 12 16.5 C 10 18, 10 19.5, 12 21"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

// Global sticky header — same nav on every marketing page.
const SiteHeader = () => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // On the home page, Next's Link to "/" is a no-op — scroll to top instead.
  const handleBrandClick = (e) => {
    close();
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="site-header-inner">
          <Link href="/" className="brand" onClick={handleBrandClick} aria-label="PosturePal home">
            <BrandMark />
            <span className="brand-name">PosturePal</span>
          </Link>

          <nav className="nav-links" aria-label="Main">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </nav>

          <div className="nav-cta-row">
            <Link href="/#split" className="btn btn-forest btn--sm">Get PosturePal</Link>
          </div>

          <button
            className={`nav-burger${open ? ' open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <React.Fragment key="mobile-menu">
            <motion.div
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />
            <motion.div
              className="mobile-menu"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } }, hidden: {} }}
              >
                {NAV_LINKS.map(l => (
                  <motion.div key={l.href} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                    <Link href={l.href} className="mobile-menu-item" onClick={close}>{l.label}</Link>
                  </motion.div>
                ))}
                <motion.div className="mobile-menu-ctas" variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                  <Link href="/teams" className="btn btn-ghost" style={{ flex: 1, minWidth: '140px' }} onClick={close}>
                    For your team
                  </Link>
                  <Link href="/individuals" className="btn btn-forest" style={{ flex: 1, minWidth: '140px' }} onClick={close}>
                    For yourself
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
