# PosturePal Web — B2B-First Redesign Brief

## Context
PosturePal is a desktop app (Windows/Mac) that uses the webcam + on-device AI to detect slouching and nudge users back into good posture. The current site (`app/page.js`, `app/globals.css`) is a single neo-brutalist landing page (thick black borders, hard drop shadows, `--accent` lime green `#d4f57a`, cream `#f5f0e8` background, Space Grotesk + Instrument Serif fonts) built entirely for individual (B2C) buyers: Rs. 299 lifetime license, 21-day free trial, casual copy ("FIX YOUR POSTURE!").

**New direction:** reposition the site so **B2B (companies/HR/wellness teams buying seats for employees) is the primary funnel**, while individuals remain fully served on a separate page. Keep the existing brand system (colors, fonts, neo-brutalist shadows, the three demo videos, the logo) — this is a layout/copy/motion upgrade, not a rebrand.

## What's live today (for reference, do not treat as ground truth for the audit — re-verify against current code before changing)
- `app/page.js` — single page, everything inline-styled, `PRICE = 299` hardcoded, sections: Hero → Benefits (3 stat cards) → Ticker → Feature demos (3 video rows) → How it works → Testimonials (marquee) → Comparison table → Pricing (trial + lifetime cards) → FAQ → CTA footer.
- `app/globals.css` — design tokens (`--black`, `--white`, `--cream`, `--accent`, `--muted`, shadow variables), `.neo-card`, `.neo-btn`, `.neo-tag` primitives, a `@media (max-width: 768px)` block.
- `app/download/page.js` + `app/_components/DownloadHub.js` — OS-detecting download hub with tabs.
- Videos: `/demo-posture-score.mp4`, `/demo-slouch-alerts.mp4`, `/demo-progress.mp4` — reuse these, do not regenerate.
- Payments: Razorpay checkout modal + license generation flow (`/api/create-order`, `/api/verify-payment`, `/api/generate-license`), free trial flow (`/api/create-trial`).

## Audit findings (fix these)

1. **No mobile navigation at all.** `.nav-links` is `display: none !important` under 768px with no hamburger/menu replacement — mobile visitors (majority of traffic) have zero way to jump to sections or find pricing/FAQ. This is a hard blocker, not a nice-to-have.
2. **Third-party chat widget collides with content.** The Heyo chat bubble (bottom-left) overlaps the "THE PROBLEM" section tag on mobile. Needs a safe-area/z-index/positioning fix, or move the widget, or hide it on small screens where it collides.
3. **Everything is one undifferentiated audience.** Casual, meme-y copy ("FIX YOUR POSTURE!", "back to hitting auto accept on Claude") is fine for a solo dev/individual buyer but reads as unserious to an HR/wellness/ops buyer evaluating a company-wide tool. There is currently no B2B path, no seats/volume pricing, no procurement-friendly language (security/privacy, admin rollout, invoicing), no case study or ROI framing.
4. **Header is doing too much / feels cluttered.** Logo image already contains the wordmark "PosturePal" as an icon-with-text lockup, and then the text "PostururePal" + tagline is repeated again next to it — redundant. Combined with 5 nav links + 2 CTA buttons, the header is visually busy for a 64px bar.
5. **Inline-style-everything architecture makes "smoother, more premium" hard to iterate on.** Every visual property is a one-off inline `style={{...}}` object; there's no shared spacing scale, no reusable motion presets beyond the one `Reveal` wrapper, and hover/press states are duplicated per component. This makes animations inconsistent (some elements have hover lift, most don't) and will make future polish slower.
6. **Animations are present but shallow.** Only fade/slide-up on scroll-into-view plus a couple of hover lifts exist. There's no scroll-linked motion, no staggered reveal within a group, no easing consistency pass, no page-load choreography, and the rotating text in "How it works" has a jarring hard cut (opacity-only crossfade with no vertical motion, per a code comment that says a Y-animation was removed to "fix clipping" — worth solving properly rather than removing).
7. **Flat visual hierarchy across sections.** Every section uses the same card/tag/heading pattern (`neo-tag` + big heading + `grid-3` of `neo-card`s) — Benefits, How-it-works, and Comparison all look structurally identical from a distance. For a "premium" feel, sections need more visual variety (asymmetric layouts, a hero-level product visual, more whitespace rhythm) without breaking the neo-brutalist language.
8. **Pricing is INR-only and singular.** Fine for individuals, but a B2B page needs seat-based framing (e.g., "for teams," per-seat/annual quotes, "Contact sales" or a lightweight self-serve seat calculator) distinct from the Rs. 299 lifetime consumer SKU.
9. **No social proof beyond individual testimonials.** For B2B credibility you'll want company logos (if any pilot customers exist), a "why companies care" ROI angle (sick days, RSI/ergonomic injury claims, remote-work wellness benefits, insurance/health-cover cost angle), and a distinct testimonial set framed as "what teams say" rather than individual quotes about back pain.
10. **No dedicated individual-consumer page exists** — today's homepage *is* the individual page. Moving B2B to the homepage means the current homepage content needs to be relocated to a new `/individuals` (or `/personal`) route, reachable from the header, without breaking the existing checkout/trial flows.
11. **Metadata/SEO is generic.** `app/layout.js` has one static `<title>`/description for the whole site; once there are two audiences and two+ routes, each page needs its own title/description/OG tags reflecting B2B vs B2C intent.
12. **Footer nav duplicates the anchor-link problem** — footer links point to homepage anchor IDs (`#benefits`, `#pricing-card`, etc.) which will break once those sections move to `/individuals` and the homepage becomes B2B content.

## What to build

### 1. Information architecture
- **`/` (new homepage) = B2B landing page.** Primary CTA funnel is "Book a demo" / "Get PosturePal for your team" (choose whichever fits — a Calendly-style link or a lead-capture form; do not build real backend integrations beyond what's needed to collect an email/company — ask before adding new external services).
- **`/individuals`** (or `/personal`) = the current consumer page, content migrated over close to as-is (same videos, same trial/lifetime purchase flow, same FAQ), just cleaned up per the polish items below.
- **Header nav** (on both pages): logo | primary nav | **"For Individuals"** link (visible on the B2B homepage) or **"For Business"** link (visible on the individuals page) | CTA button(s). Add a real mobile menu (hamburger → slide-down or slide-over panel) that includes all nav links + both CTAs. This is not optional — fix finding #1 as part of this work.
- Update `app/layout.js` to move page-specific `<title>`/`description` into per-route metadata (Next.js `export const metadata` in each `page.js`, or `generateMetadata`) rather than one global title.

### 2. B2B homepage copy (new)
Write full new copy for the homepage hero, problem section, solution section, proof section, pricing/CTA section, and FAQ, targeted at a buyer persona such as an HR lead, People Ops manager, office manager, or wellness/benefits coordinator at a company with a remote/hybrid or desk-heavy workforce. The copy must:
- **Open with the business pain point**, not the product: e.g. bad posture → chronic pain → lower focus/productivity → increased sick leave, ergonomic injury claims, and attrition risk for desk-based teams — reframe "slouching" as a quantifiable workplace wellness/productivity problem, not just a personal ache.
- **State the solution in one sentence a busy exec would understand**: on-device, privacy-safe posture AI that runs quietly on every employee's laptop and nudges them in real time — no hardware, no wearables, no footage leaving the device (this addresses IT/privacy objections up front, which matters a lot for B2B).
- **State the impact in outcome language**: fewer ergonomic complaints/claims, better focus during deep work blocks, a low-cost/high-visibility addition to a wellness benefits package, measurable posture-improvement trends the company can point to (e.g., via aggregate, anonymized team-level reporting — only propose this if it's plausible product-wise; flag clearly as a suggested feature vs. shipped feature).
- **Make the primary CTA unmistakable**: hero should have one dominant action (e.g., "Get a team demo" / "Bring PosturePal to your team") with a secondary, lower-emphasis link to the individual/consumer page and/or a "See pricing for teams" anchor.
- Preserve the existing offline/privacy/no-subscription-for-individuals facts as truthful building blocks — do not invent regulatory claims (HIPAA, ISO, SOC2, etc.) unless the user confirms PosturePal actually holds them.
- Keep tone confident and slightly bold (matching the existing neo-brutalist personality) but drop the meme-tier lines (e.g., "hitting auto accept on Claude") from the B2B page — that stays on `/individuals` only, if kept at all.

### 3. Visual/motion polish (applies to both pages)
- Keep the color tokens, fonts, and neo-brutalist border/shadow language exactly as-is (`--black`, `--white`, `--cream`, `--accent`, `--muted`, `--border`, `--shadow-*`). Keep the three existing demo videos and the logo asset — reuse them; do not request new video assets.
- Extract repeated inline styles into either CSS classes/utilities or small shared components (e.g., a `SectionHeading`, `StatCard`, `Badge`) so future spacing/animation changes are consistent site-wide instead of hand-edited per element. This is a refactor in service of polish, not a rewrite of the whole app.
- Introduce a small set of consistent Framer Motion presets (the existing `Reveal` component is a good base) and apply staggered children reveals within card grids (`grid-3` groups) instead of only per-section fade-ins, so groups of cards/features feel choreographed rather than uniform.
- Add subtle scroll-linked motion in 1–2 hero-adjacent spots (e.g., parallax or scale on the hero product visual/video) using `useScroll`/`useTransform` from Framer Motion — tasteful, not gimmicky.
- Fix the rotating-text crossfade in "How it works" (or its B2B-page equivalent) properly: solve the clipping issue that caused the vertical animation to be removed, rather than leaving it as a flat opacity-only fade.
- Increase visual variety between sections so they don't all read as "tag + heading + `grid-3` of cards" — vary layout rhythm (e.g., asymmetric two-column feature rows are already used in "Feature demos"; extend that pattern's variety elsewhere, add more whitespace/breathing room at "premium" sections like the hero and final CTA).
- Ensure every interactive element (buttons, cards, nav links, FAQ rows) has a deliberate, consistent hover/press state — right now only some elements (`.neo-card`, `.neo-btn`) get hover treatment.
- Fix the chat-widget collision on mobile (finding #2) — reposition, z-index, or add safe padding so it never overlaps section content or nav.

### 4. Individuals page (`/individuals`)
- Migrate the current homepage content here largely unchanged (hero, benefits, feature demos, how-it-works, testimonials, comparison, pricing, FAQ, CTA footer, trial/purchase flows) — this page keeps its consumer, slightly playful tone.
- Apply the same visual/motion polish pass described above so both pages feel like one cohesive, upgraded product, not two different eras of design.
- Update internal anchor links/footer so they point within `/individuals` correctly, and add a "For Business" link back to `/`.

### 5. Technical constraints / guardrails for whoever implements this
- Do not change the payment/license/trial API routes' behavior — only relocate/reuse the existing `RazorpayButton`, `TrialButton`, and modal components as needed on `/individuals` (and, only if truly relevant, a lighter-weight lead-capture CTA on the B2B page — do not wire a fake payment flow for "teams" unless a real seats/pricing backend is discussed first).
- Do not fabricate B2B customer logos, review counts, or compliance certifications. If real ones exist, ask before publishing marketing claims; otherwise use honest placeholders clearly marked for the user to fill in (e.g., a labeled comment/config the user can swap real data into) rather than presenting invented names as real customers.
- Preserve existing routes (`/download`, `/success`) and their functionality untouched unless a link needs updating because of the new `/individuals` route.
- Follow `AGENTS.md`: this project is on a Next.js version with breaking changes from what most training data assumes — check `node_modules/next/dist/docs/` for current routing/metadata conventions before writing new pages or metadata exports.
- Keep the whole thing responsive: verify the new mobile nav, B2B hero, and individuals page all render correctly at mobile (375px), tablet (768px), and desktop (1440px) widths before calling this done.

## Suggested delivery order
1. Ship the mobile nav fix and chat-widget collision fix first (these are bugs, independent of the B2B pivot).
2. Extract shared style/motion primitives (Section heading, Badge, Card, stagger-reveal wrapper) from the existing homepage so both new pages can reuse them.
3. Move current homepage → `/individuals`, update internal links/footer, apply polish pass.
4. Build the new B2B homepage at `/` with new copy, hero, proof, and CTA sections using the shared primitives.
5. Wire up header/footer cross-linking ("For Individuals" / "For Business") on both pages.
6. Full responsive + animation QA pass across both pages.
