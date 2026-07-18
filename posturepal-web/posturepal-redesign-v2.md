# PosturePal — Redesign & Rebrand Spec (v2)

> **Purpose of this document.** A complete, buildable design specification for the PosturePal website redesign, derived from a structured design interview with the owner. This is the source of truth for *what the new site should look and feel like* and *why*. It is a design brief, not code — but every token, component, and layout decision here is concrete enough to implement directly.
>
> **Relationship to `redesign-prompt.md`.** That earlier brief covered the B2B-first repositioning and a list of bug/polish fixes (mobile nav, chat-widget collision, etc.). Those functional fixes still stand. This document **supersedes it on visual direction and information architecture** — most importantly, the homepage is now an **equal Teams/Personal split**, not B2B-first.

---

## 1. Decisions locked from the interview

| Topic | Decision |
|---|---|
| **Aesthetic** | Refined neo-brutalist — keep the bold, structured personality, but make it *premium*: thinner borders, softened offset shadows, more whitespace, real hierarchy. Kill the "sticker/poster" feel. |
| **Personality** | Warm & human. Caring, approachable, real. Posture health made human — not clinical, not meme-y. |
| **Top goal** | **Look like a credible, real product.** Every decision is judged against: *"Does this make a stranger trust it enough to buy / book a demo?"* |
| **Color** | Keep green as the brand color, refined to a **deep forest / emerald** core (away from neon lime). Warm light base + a brighter refined green accent. |
| **Theme** | Light default, warm neutrals, with **1–2 dramatic dark (forest) accent sections** for premium contrast. |
| **Typography** | Designer's choice → **Fraunces** (warm editorial serif, display) + **Instrument Sans** (humanist sans, UI/body). See §5. |
| **Shape** | Slightly soft — small radii (8–14px), not razor-sharp, not pill-round. |
| **Motion** | Subtle & premium. Restrained micro-interactions and scroll reveals that feel expensive, never distracting. |
| **Imagery** | Mix of real people at desks + clean product/UI shots + light custom illustration. Use clearly-marked placeholders until real assets exist. |
| **Audience** | **Truly equal split.** Homepage routes cleanly to **Teams** and **Personal**, both equally polished. |
| **References** | Notion / Superlist / Arc (playful-but-premium) + Gumroad / Figma (confident, design-forward edge). |
| **Brand assets** | Keep the **name** "PosturePal". **Modernize the logo mark.** **Reuse** the 3 demo videos. |
| **Proof** | No fabricated proof. Use honest, clearly-labeled placeholders the owner swaps in later. |
| **Non-negotiables** | Drop meme copy · Privacy/on-device is a hero-level selling point · Fix mobile (nav + chat-widget collision + responsive) · Keep it fast & lightweight. |

---

## 2. Brand strategy (the frame everything hangs on)

**Positioning.** PosturePal is a private, on-device posture coach that lives quietly on your laptop and gently keeps you upright through the workday — for individuals who care about their body, and for teams who care about their people.

**Personality axes.**
- Warm, not clinical. (A *pal*, per the name — but a grown-up, credible one.)
- Confident, not loud. (Bold structure, calm color, zero gimmicks.)
- Honest, not hype. (Privacy is real; proof is real or clearly placeholder.)

**Brand promise (one sentence a stranger should grasp in 5 seconds):**
> *"On-device AI that watches your posture, never your privacy, and nudges you back upright — before the ache becomes a habit."*

**North-star test for every screen:** *Would an HR lead evaluating a wellness benefit — and a design-literate individual buyer — both look at this and think "this is a real, trustworthy product"?* If no, it's not done.

---

## 3. Information architecture (equal split)

The homepage is a **neutral, brand-forward router**, not a B2B pitch. It establishes the product and privacy story once, then sends visitors down the right path with equal weight.

```
/                     Landing (router)  — brand + privacy story + two equal paths
├── /teams            Teams / B2B page  — HR / wellness / ops buyer
├── /individuals      Personal / B2C page — solo buyer (migrated current homepage content)
├── /download         Download hub (existing — keep flows, apply new visual skin)
└── /success          Post-purchase (existing — keep, apply skin)
```

### 3.1 Landing page (`/`) structure
1. **Header** (shared) — logo · nav · theme is light · single "Get PosturePal" CTA that scrolls to the split.
2. **Hero** — the brand promise + the privacy line, one calm dominant headline, the product visual (a demo video framed as a device/app), and **two equal primary buttons: "For your team" → `/teams` and "For yourself" → `/individuals"**. This is the split — give both paths identical visual weight (side-by-side cards or a balanced two-button row, not one big + one small).
3. **The privacy strip** (dark forest accent section #1) — "Nothing leaves your device." The one thing both audiences must believe. On-device AI, no footage, no cloud, no wearable. This is deliberately a *dark* section for gravity.
4. **How it works** — 3 steps, shared to both audiences (install → it watches posture on-device → it nudges you). Uses one demo video.
5. **The two-path chooser** (restated, richer) — two large cards, "PosturePal for Teams" and "PosturePal for You", each with a 3-bullet value summary and its own CTA. Equal size, equal polish.
6. **Trust row** — honest placeholders (logos / stats / a quote), clearly marked.
7. **Final CTA** (dark forest accent section #2) — "Sit better, starting today." Two CTAs again (Teams / Personal).
8. **Footer** (shared).

> Because the split is equal, resist the temptation to visually favor one path. The homepage's job is orientation and trust, not conversion of a specific persona — the sub-pages convert.

### 3.2 `/teams` and `/individuals`
Each is a full, self-contained landing page with its own hero, proof, pricing, FAQ, and CTA — reusing the shared component/motion system so they read as one product. `/teams` uses buyer/ROI/privacy/rollout language; `/individuals` keeps a warmer, more personal voice (but still *drops the meme lines*). Existing checkout/trial flows live on `/individuals` unchanged in behavior.

---

## 4. Color system

The core move: **replace neon lime (#d4f57a) + high-contrast black borders** with a **deep-forest green system on warm paper**, plus one *refined* bright green as a controlled accent. Green now reads as "health, growth, calm, credible" instead of "highlighter."

### 4.1 Tokens (light theme — default)

```css
:root {
  /* Brand greens */
  --forest:        #16412E;  /* primary brand green — deep, premium, trustworthy */
  --forest-700:    #1E5A3F;  /* hover/darker interactive */
  --emerald:       #2E8B5A;  /* mid green — links, active states, iconography */
  --accent:        #B4E169;  /* refined bright green — the ONE pop color (deeper than old lime) */
  --accent-soft:   #E8F3D2;  /* accent tint — highlight backgrounds, subtle fills */

  /* Warm neutrals (base) */
  --paper:         #FAF7F0;  /* page background — warmer, softer than old cream */
  --paper-2:       #F2ECE0;  /* alt section background for rhythm */
  --card:          #FFFFFF;  /* card surface (or #FFFDF8 for warmth) */
  --ink:           #1A1A16;  /* warm near-black — text & borders (not pure #000) */
  --muted:         #5C574E;  /* secondary text */
  --muted-2:       #8A857A;  /* tertiary / captions */
  --line:          #E4DED2;  /* hairline dividers on light */

  /* Borders & elevation — the "refined brutalist" signature */
  --border-w:      1.5px;              /* thinner than old 2px */
  --border:        1.5px solid var(--ink);
  --border-green:  1.5px solid var(--forest);
  --shadow-sm:     3px 3px 0 rgba(22,65,46,0.9);   /* offset shadow now tinted forest, not black */
  --shadow-md:     5px 5px 0 rgba(22,65,46,0.85);
  --shadow-lg:     8px 8px 0 rgba(22,65,46,0.8);
  --shadow-ambient:0 8px 30px rgba(22,65,46,0.08); /* optional soft blur layered under offset for premium depth */

  /* Radii — slightly soft */
  --r-sm: 8px;    /* buttons, tags, inputs */
  --r-md: 12px;   /* cards */
  --r-lg: 16px;   /* hero panels, feature blocks */
  --r-pill: 999px;/* nav pills, small chips only */

  --max-width: 1160px;
}
```

### 4.2 Tokens (dark accent sections)

Dark sections are **forest-based, not pure black** — this keeps them on-brand and warm rather than cold/techy.

```css
.section-dark {
  --paper:  #0E2C20;   /* deep forest, near-black-green */
  --paper-2:#12352A;
  --card:   #163C2D;
  --ink:    #F3F0E7;   /* warm off-white text */
  --muted:  #B8C4B8;
  --line:   rgba(243,240,231,0.14);
  --border: 1.5px solid rgba(243,240,231,0.85);
  --shadow-sm: 3px 3px 0 rgba(0,0,0,0.4);
  /* accent (#B4E169) stays the same and POPS beautifully on dark forest */
  background: var(--paper);
  color: var(--ink);
}
```

### 4.3 Usage rules
- **Accent (#B4E169) is a spice, not a base.** Use it for: one primary CTA style, active/selected states, a single highlight word in a headline, small accent bars/underlines, checkmarks. Never large flat fills of accent on light (that's what made the old design feel like a sticker).
- **Forest (#16412E) is the workhorse brand color:** primary buttons, headings emphasis, icon strokes, the dark sections.
- **Buttons:**
  - *Primary:* forest fill, off-white text, `--shadow-sm`. On hover, lift + shadow grows.
  - *Accent (high-emphasis, rare):* accent fill, ink text — for the single most important CTA on a page (e.g. hero "Get PosturePal").
  - *Secondary:* transparent, ink text, `--border`. Hover fills `--accent-soft`.
- **Contrast:** verify all text ≥ 4.5:1. Forest on paper = fine. Accent-green is **decorative only** — never body text on light (fails contrast); ink text on accent fills is fine.

---

## 5. Typography

**Chosen pairing (both on Google Fonts, both warm, both continuity-friendly):**

- **Display / headings — `Fraunces`** (variable). A soft, high-personality "old-style" serif with optical sizing and a friendly-but-editorial voice. Delivers the "warm & human + premium" mandate far better than the current Instrument Serif's thin look, and has more gravitas than a generic sans. Use the *Soft* / lower `wonky` feel — dial `opsz` up on large display sizes for elegant thin-thick contrast.
- **Body / UI — `Instrument Sans`** (variable). A clean, slightly warm humanist grotesque. Highly legible at small sizes for pricing tables, FAQs, nav, buttons. Pairs naturally with Fraunces (shared "Instrument"/editorial lineage feel) and keeps the interface calm.
- *(Fallback / lowest-risk option if the owner prefers continuity: keep Instrument Serif + Space Grotesk but apply the same scale and hierarchy rules below. The redesign works either way — the **hierarchy** matters more than the exact faces.)*

```css
--font-display: 'Fraunces', Georgia, serif;
--font-sans:    'Instrument Sans', system-ui, sans-serif;
```

### 5.1 Type scale (fluid, desktop → mobile via clamp)

| Token | Use | Size (clamp) | Font | Weight | Tracking |
|---|---|---|---|---|---|
| `display` | Hero H1 | `clamp(2.75rem, 6vw, 5rem)` | Fraunces | 400–500 | -0.02em |
| `h1` | Page title | `clamp(2.25rem, 4.5vw, 3.5rem)` | Fraunces | 400 | -0.02em |
| `h2` | Section heading | `clamp(1.75rem, 3vw, 2.5rem)` | Fraunces | 400 | -0.015em |
| `h3` | Card / sub | `clamp(1.15rem, 2vw, 1.4rem)` | Instrument Sans | 600 | -0.01em |
| `body-lg` | Hero subcopy | `1.15rem` | Instrument Sans | 400 | 0 |
| `body` | Default | `1rem` | Instrument Sans | 400 | 0 |
| `small` | Captions / legal | `0.85rem` | Instrument Sans | 500 | 0.01em |
| `eyebrow` | Tag/label above headings | `0.8rem` UPPERCASE | Instrument Sans | 600 | 0.12em |

**Rules:**
- Headings use Fraunces; UI text (buttons, nav, labels, tables) uses Instrument Sans — never headings-serif in buttons.
- One accent-color highlighted word or a hand-drawn accent underline is allowed per major heading, max. Use sparingly.
- Line length capped ~68ch for body. Line-height 1.6 body, 1.05–1.15 display.

---

## 6. Shape, border & elevation — the "refined brutalist" signature

This is the heart of moving from *gimmicky* → *premium* while **keeping the brand's bold DNA**:

| Property | Old (gimmicky) | New (refined) |
|---|---|---|
| Border width | 2px solid pure black everywhere | **1.5px** warm ink `#1A1A16` (or forest on green elements) |
| Corner radius | 0px hard | **8–14px** soft |
| Shadow | Hard `Npx Npx 0 #000` black, heavy | Offset shadow **tinted forest** `rgba(22,65,46,…)`, slightly lighter, optionally layered with a faint ambient blur for depth |
| Where borders appear | On *everything* (every card, tag, stat) | **Selective** — hero panels, primary cards, buttons. Secondary elements use hairline `--line` dividers or subtle shadow only. Not every element gets the full border+shadow treatment. |
| Hover | Big 3px jump on every card | Restrained 2px lift, shadow grows one step, 150ms ease |

**Key principle:** the offset-shadow "brutalist block" look becomes a **deliberate accent for hero/primary moments**, not the uniform texture of the entire page. Most of the page breathes with whitespace and hairlines; the bold block treatment is reserved for the elements that should command attention (primary CTA cards, the two path cards, pricing). This variety is what separates "premium editorial" from "sticker sheet."

---

## 7. Spacing, grid & layout rhythm

```css
--space: 4px base scale → 4,8,12,16,24,32,48,64,96,128
--section-pad: clamp(64px, 10vw, 128px) 24px;   /* more generous than old 100px */
--container: 1160px;  --container-narrow: 760px (for text-heavy blocks);
```

- **12-column grid**, 24px gutters, generous outer margins.
- **Break the "every section = eyebrow + heading + grid-3 of cards" monotony** (a named flaw in the old site). Rotate through layout archetypes:
  1. Centered statement (hero, final CTA).
  2. Asymmetric 5/7 split (text left, product visual right — and alternate sides down the page).
  3. Full-bleed dark forest band (privacy, final CTA).
  4. Two equal cards (the Teams/Personal split).
  5. Stat/number row (thin, horizontal, hairline-separated — not boxed cards).
  6. Editorial big-quote testimonial (single large pull-quote, not a marquee of small boxes).
- **Whitespace is a premium signal.** When in doubt, add vertical breathing room, especially around the hero and CTAs.

---

## 8. Component redesign specs

### 8.1 Header (fixes old clutter + redundant wordmark)
- **Left:** modernized logo mark + "PosturePal" wordmark **once** (remove the duplicated tagline-next-to-logo). If the logo image already contains the wordmark, show only the mark + a text wordmark, not both wordmarks.
- **Center/left nav:** minimal — `How it works · Teams · Personal · Pricing`. On sub-pages, nav reflects that page's sections + a cross-link ("For Teams" / "For You").
- **Right:** one primary CTA ("Get PosturePal"). Optional secondary text link ("Download").
- **Bar:** ~64px, `--paper` with a hairline bottom border that appears only on scroll; subtle backdrop blur when scrolled. Sticky.
- **Mobile:** real hamburger → **slide-down / slide-over panel** containing all nav links + both CTAs. *(Fixes the hard blocker: old `.nav-links` was `display:none` with no replacement.)*

### 8.2 Buttons — see §4.3. Three tiers: primary (forest), accent (rare, hero), secondary (outline). Consistent 150ms hover-lift + shadow-grow, and an `:active` press (translate down, shadow collapses) — keep this satisfying brutalist press, just gentler.

### 8.3 Cards
- Surface `--card`, radius `--r-md`, `--border` **only** on primary/interactive cards; secondary info uses `--line` hairline or ambient shadow.
- Padding 24–32px. Hover: 2px lift + shadow one step up (interactive cards only — static content cards don't move).

### 8.4 Tags / eyebrows
- Replace the heavy bordered `neo-tag` with a lighter **pill**: `--accent-soft` background, forest text, `--r-pill`, no heavy border — or an underline-style eyebrow (uppercase, tracked, small, with a short accent bar). Use eyebrows to label sections without another boxed element.

### 8.5 Pricing
- **Individuals:** the Rs. 299 lifetime + 21-day trial cards — restyled premium, one "most popular" card elevated with the accent treatment. Keep INR + real checkout.
- **Teams:** seat-based framing — a simple, honest per-seat / "talk to us" card (no fake payment backend). Clearly a *lead-capture / book-a-demo* flow, not a wired checkout, unless a real seats backend is added.

### 8.6 Testimonials / proof
- Move from the small-box marquee to **editorial pull-quotes** (large, warm, human) + an honest logo/stat strip. **All placeholders clearly labeled** (`<!-- PLACEHOLDER: real customer -->`) — never fabricate names, counts, or logos.

### 8.7 FAQ
- Clean accordion, hairline dividers, generous padding, smooth height/rotate-chevron animation, clear hover state on the whole row.

### 8.8 Footer
- Calm, structured, `--paper-2` or dark forest. Columns: Product · Teams · Personal · Legal. **Fix the broken anchor links** — footer links must resolve within the correct page now that content is split across `/`, `/teams`, `/individuals`.

### 8.9 Chat widget
- Fix the Heyo bubble collision: reposition / z-index / safe-area padding so it never overlaps section tags or nav, especially on mobile. Consider hiding on the smallest breakpoints if it still collides.

---

## 9. Motion system (subtle & premium)

- **Library:** Framer Motion (already in use). Extract a small, shared preset set — don't hand-roll per element.
- **Presets:**
  - `reveal` — fade + 16px rise, 500ms, `easeOut`, triggers once in view.
  - `stagger` — children reveal 60–80ms apart (use for card groups / the two path cards / stat rows — fixes "cards all appear at once").
  - `hover-lift` — 2px translate + shadow step, 150ms.
  - `press` — the brutalist press, gentle.
- **One or two scroll-linked touches** (`useScroll`/`useTransform`): subtle parallax/scale on the hero product visual, and maybe the dark privacy band sliding in. Tasteful, not gimmicky.
- **Fix the rotating-text crossfade** properly (the old "How it works" hard cut): solve the clipping that caused the vertical animation to be removed — animate Y with `overflow:hidden` masking rather than reverting to opacity-only.
- **Respect `prefers-reduced-motion`** — disable transforms, keep opacity.
- **Global easing standard:** one easing curve for entrances (`cubic-bezier(0.22, 1, 0.36, 1)`), applied consistently.

---

## 10. Imagery & illustration direction

- **Real people at desks** — warm, natural, candid lifestyle photography (good posture, real workspaces, diverse people). Reinforces "human." *Placeholder now; owner supplies later.*
- **Clean product/UI shots** — the posture score, slouch alert, and progress views, framed in a subtle device/browser frame with the offset-shadow treatment. Proves it's real. Reuse the 3 existing demo videos as the primary product proof (framed, autoplay-muted-loop, with a soft device bezel).
- **Light custom illustration** — a *small* set of on-brand spot illustrations for abstract concepts (posture spine, focus, "nothing leaves your device" privacy shield). Keep them warm, simple, forest+accent palette. Don't over-illustrate — it can undercut credibility if cartoonish.
- **Consistency:** every image gets the same rounded-corner + optional offset-frame treatment so photos, UI, and illustration feel like one system.
- **Mark all placeholders explicitly** in code so the owner can swap real assets without hunting.

---

## 11. Logo refresh (modernize the mark)

Scope: **modernize the mark**, keep it recognizable, don't rename.
- Recolor to the new **forest green** (drop any lime).
- Simplify to a clean, scalable **icon + wordmark lockup**: a simple posture-inspired mark (e.g. an upright figure / spine curve / an upward check-arc suggesting "sit up") paired with "PosturePal" in Instrument Sans (or a lightly customized wordmark).
- Deliverables: horizontal lockup, icon-only (favicon / app), and a reversed/light version for dark forest sections.
- **Fix the header redundancy**: the logo lockup should not be duplicated by a second wordmark + tagline in the header.
- *(This spec defines direction; actual logo artwork is a separate design task — flag for the owner whether to commission it or generate a first-pass mark.)*

---

## 12. Copy & tone guidelines

- **Drop the meme lines** ("hitting auto accept on Claude", "FIX YOUR POSTURE!"). Keep confidence, lose the shtick.
- **Warm & human voice:** speak to a person, plainly, with a little care and wit — never corporate-sterile, never jokey-cringe. Think "a smart friend who happens to have built a real product."
- **Lead with privacy** on the homepage and both sub-pages — it's the trust unlock: *"On-device AI. Your camera feed never leaves your laptop. No cloud, no footage, no wearable."*
- **Teams voice:** outcome language — fewer ergonomic complaints, better focus in deep-work blocks, a low-cost/high-visibility wellness benefit, privacy-safe for IT. No invented compliance claims (no HIPAA/SOC2/ISO unless真 true).
- **Personal voice:** warmer, first-person benefit — *"Your back will thank you."* Still no memes.
- **Example rewrites:**
  - Hero H1: ~~"FIX YOUR POSTURE!"~~ → **"Sit like you mean it."** (with sub: "A private posture coach that lives on your laptop and nudges you upright — before the ache sets in.")
  - Privacy: → **"Nothing leaves your device. Not a frame."**
  - Teams CTA: → **"Bring PosturePal to your team."**

---

## 13. Accessibility & performance

- **Contrast:** all text ≥ 4.5:1 (3:1 for large display). Accent green is decorative only.
- **Focus states:** visible focus ring (2px forest/accent) on all interactive elements.
- **Keyboard:** mobile menu, FAQ accordion, and both hero CTAs fully keyboard-operable.
- **Reduced motion:** honored globally.
- **Performance (non-negotiable "keep it fast & lightweight"):**
  - Self-host / `next/font` the two fonts (avoid render-blocking Google `@import`); subset weights actually used.
  - Videos: `preload="metadata"`, poster images, lazy-load below the fold, muted-inline-loop.
  - Ship shared components + a token file — no per-element inline-style bloat (the old architecture). One CSS variable system, reusable primitives (`SectionHeading`, `Card`, `Badge`, `Button`, `Reveal`, `Stagger`).
  - No heavy new dependencies.

---

## 14. Implementation notes (for whoever builds it)

- **Follow `AGENTS.md`:** this project runs a Next.js version with breaking changes vs. common training data. **Read `node_modules/next/dist/docs/` for current routing/metadata/font conventions before writing pages, `metadata` exports, or `next/font` usage.** Do not assume older App Router idioms.
- **Token migration:** replace the `:root` block in `app/globals.css` with §4's tokens. Old `--accent: #d4f57a` → new `--accent: #B4E169`; old `--cream` → `--paper`; add forest/emerald, radii, tinted shadows. Update `.neo-card`/`.neo-btn`/`.neo-tag` to the refined specs (thinner border, radius, tinted shadow, selective usage).
- **Refactor:** extract shared primitives and motion presets *before* building the three pages, so all pages inherit the system (this also fixes the old "inline-style-everything" flaw).
- **Routing:** homepage `/` becomes the router landing; move current B2B `B2BPage` content into `/teams`; ensure `/individuals` keeps the real trial/checkout flow (`RazorpayButton`, `TrialButton`, modals) with unchanged API behavior. Keep `/download` and `/success` working; re-skin only.
- **Per-page metadata:** move the single global `<title>` into per-route `metadata` (Landing / Teams / Individuals each with distinct title/description/OG).
- **Do not** fabricate customer logos, review counts, or certifications. Use labeled placeholders.
- **Do not** wire a fake team payment flow — Teams pricing is lead-capture/demo only unless a real seats backend is agreed.

---

## 15. QA / "done" checklist

- [ ] Renders correctly at **375px, 768px, 1440px** (hero, both path cards, nav, pricing, footer).
- [ ] Mobile hamburger menu works (all links + both CTAs, keyboard + touch).
- [ ] Chat-widget never collides with content/nav on any breakpoint.
- [ ] No neon-lime remains; forest/accent/paper system applied everywhere; dark sections are forest-based.
- [ ] Borders are 1.5px, radii soft, shadows forest-tinted, offset-block treatment used *selectively* not uniformly.
- [ ] Fraunces + Instrument Sans loaded via `next/font`, subset, no layout shift.
- [ ] Motion: staggered card reveals, one scroll-linked hero touch, rotating text fixed, `prefers-reduced-motion` honored.
- [ ] All proof is real or clearly-labeled placeholder — nothing fabricated.
- [ ] Every interactive element has deliberate hover + focus + press states.
- [ ] Per-page metadata set; footer/anchor links resolve within the correct page.
- [ ] Lighthouse: fast load, no render-blocking fonts, videos lazy/poster'd.

---

## 16. Open items to confirm with the owner

1. **Logo artwork:** commission a proper mark, or should I generate a first-pass modernized mark to iterate on?
2. **Fonts:** approve **Fraunces + Instrument Sans**, or keep continuity with Instrument Serif + Space Grotesk (hierarchy rules apply either way)?
3. **Teams conversion:** is the team CTA a **Calendly-style "book a demo"**, or a **lightweight email/company lead-capture form**? (No real seats backend assumed.)
4. **Real proof:** any genuine testimonials, pilot companies, or usage numbers to feature now — or all placeholder for launch?
5. **Green accent exact hex:** `#B4E169` proposed — approve, or tune warmer/cooler?
6. **Dark sections:** confirm forest-based dark (recommended) vs. neutral charcoal for the accent bands.

---

*End of spec. Next step on approval: implement §14 (token migration + shared primitives) first, then build `/`, `/teams`, `/individuals` against this system, then run the §15 QA pass.*
