# PosturePal — Interview Preparation Guide

> **Cross-Platform Desktop Application** — a Windows/macOS/Linux app that uses your webcam and on-device AI (TensorFlow MoveNet) to detect slouching in real time, alerts you with a floating popup, and is monetized with a Razorpay + Supabase licensing/DRM system. Website: **posturepal.in**

This document assumes **zero prior knowledge**. It explains every technology, the (genuinely non-trivial) multi-process Electron architecture, the posture-scoring math, the payment/DRM system, and the interview questions and traps you'll face. This is your most technically diverse project — desktop, real-time ML, cryptography, payments, CI/CD — so it gives the widest attack surface for questions. Read it fully; revisit §9–§11 before interviews.

---

## Table of Contents
1. [The 30-second pitch](#1-the-30-second-pitch)
2. [What problem does it solve?](#2-what-problem-does-it-solve)
3. [The technology stack — explained from scratch](#3-the-technology-stack--explained-from-scratch)
4. [The architecture — three processes, one brain](#4-the-architecture--three-processes-one-brain)
5. [The detection pipeline & scoring math](#5-the-detection-pipeline--scoring-math)
6. [The billing & DRM subsystem](#6-the-billing--drm-subsystem)
7. [Build, release & auto-update (CI/CD)](#7-build-release--auto-update-cicd)
8. [How I built it, and where I got stuck](#8-how-i-built-it-and-where-i-got-stuck)
9. [Resume claims vs. the real code](#9-resume-claims-vs-the-real-code)
10. [Core interview questions & model answers](#10-core-interview-questions--model-answers)
11. [Trap scenarios](#11-trap-scenarios)
12. [One-line rapid-fire cheat sheet](#12-one-line-rapid-fire-cheat-sheet)

---

## 1. The 30-second pitch

> "PosturePal is a cross-platform desktop app built on Electron. It runs a TensorFlow MoveNet pose-detection model **on-device** — the webcam never leaves your machine — in a hidden background window every 500 ms. The UI is completely decoupled from that inference loop: they're separate Electron processes that talk over asynchronous IPC, so the model never blocks the render thread. It scores your posture against a personal calibration baseline across five independent signals with hysteresis to avoid false alarms, and pops a floating always-on-top alert when you slouch. It's a paid product: a Node.js + Next.js backend on Vercel handles Razorpay payments, verifies HMAC-signed webhooks, issues machine-bound license keys stored in Supabase Postgres, and the desktop app validates licenses with a 24-hour offline grace period. Cross-platform installers are built and auto-updated via electron-builder + electron-updater through GitHub Actions."

Every clause is a zoom-in target. This pitch alone demonstrates breadth.

---

## 2. What problem does it solve?

People slouch at their desks for hours and don't notice until their neck and back hurt. PosturePal is an ambient, always-on "posture coach": it watches (locally, privately), and the moment your posture degrades for a few seconds, it interrupts you with a small popup so you correct it. Gamification (XP, levels, an anonymous leaderboard) makes the habit stick.

**The three product pillars that map to the three resume bullets:**
1. **Real-time, non-blocking on-device inference** (the hard engineering).
2. **A secure paid-licensing/DRM system** (the monetization + crypto).
3. **Cross-platform packaging + auto-update + offline resilience** (the distribution).

---

## 3. The technology stack — explained from scratch

### Electron
A framework for building **desktop apps with web technology** (HTML/CSS/JS). Under the hood every Electron app is really **two kinds of process**:
- **The Main process** — one per app. It's a **Node.js** environment with full OS access: create windows, system tray, file system, native dialogs, auto-update. It has *no UI itself*; it manages windows and OS integration. In PosturePal this is `main.js`.
- **Renderer processes** — one per window. Each is essentially a **Chromium browser tab**: it runs your HTML/JS/React and can use browser APIs (`getUserMedia` for the webcam, WebGL for the GPU) but is sandboxed from the OS.

> **Why Electron?** One JavaScript/React codebase ships to Windows, macOS, and Linux, and it gives access to browser-grade ML (TensorFlow.js + WebGL) *and* Node/OS integration in the same app. The trade-off is bundle size and memory (you're shipping Chromium).

### IPC (Inter-Process Communication)
Because Main and Renderer are **separate OS processes**, they can't call each other's functions directly — they pass **messages**. Electron's IPC:
- `ipcRenderer.invoke('channel', data)` → `ipcMain.handle('channel', handler)` — a request/response (returns a Promise).
- `ipcRenderer.send(...)` → `ipcMain.on(...)` and `webContents.send(...)` — fire-and-forget events.
This message-passing boundary is *the* central architectural fact of the app (see §4).

### Context isolation + preload + contextBridge (the security model)
Letting a web page touch Node.js directly is dangerous (a malicious script could read your files). The secure pattern PosturePal uses:
- `contextIsolation: true`, `nodeIntegration: false` — the renderer **cannot** access Node or Electron internals.
- A **preload script** (`preload.js`) runs in a privileged context before the page loads and uses **`contextBridge.exposeInMainWorld('api', {...})`** to expose *only* a hand-picked, safe set of functions (e.g. `window.api.getData`, `window.api.showAlert`) to the page. The renderer can call `window.api.*`, but nothing else. This is the **principle of least privilege** applied to IPC — a strong security talking point.

### TensorFlow.js + MoveNet (the AI)
- **TensorFlow.js (`@tensorflow/tfjs`)** — runs ML models in JavaScript. With the **WebGL backend** (`@tensorflow/tfjs-backend-webgl`) it executes on the **GPU** for real-time speed.
- **MoveNet** — Google's fast **pose-estimation** model. Given an image, it returns **17 keypoints** (nose, eyes, ears, shoulders, etc.) as x/y pixel coordinates with confidence. PosturePal uses the **SINGLEPOSE_LIGHTNING** variant — the fastest, lightest one (192×192 input), because we only track one person and need low latency, not maximum accuracy.
- **Crucial privacy point:** the model runs *locally*. Only 17 coordinates are ever computed, and they're scored on-device. No video, no image, nothing leaves the machine.

### electron-store
A tiny library that persists JSON to a local file (with an in-memory-like `get`/`set` API). PosturePal's **local database**: settings, session history, XP, calibration baseline, license/trial state. It's the "offline-first cache."

### electron-builder & electron-updater
- **electron-builder** — packages the app into platform installers: `.dmg` (macOS), NSIS `.exe` (Windows), `.AppImage`/`.deb` (Linux). Config in `electron-builder.yml`.
- **electron-updater** — auto-update: on launch (and every 4 hours) the app checks a GitHub Releases feed, and if a newer version exists it downloads and installs it. Uses the metadata electron-builder publishes.

### Webpack + Babel
- **Webpack** bundles the renderer React code (multiple `.jsx` files + node modules) into `dist/bundle.js` the browser can load.
- **Babel** transpiles modern JS/JSX (React) into browser-compatible JS. `dotenv-webpack` injects env vars (Supabase keys) into the bundle at build time.

### The website/backend stack
- **Next.js 14/15 (App Router)** on **Vercel** — the marketing site *and* the API. **API Route Handlers** (`app/api/*/route.js`) are serverless functions handling payments and license validation.
- **Razorpay** — the payment gateway (popular in India; the app is priced in INR / ₹). Provides checkout, orders, webhooks, and signature schemes.
- **Supabase** — a hosted **PostgreSQL** database with a JS client. Stores `licenses`, `trials`, `customers`, and the `leaderboard`. The desktop app talks to it directly (with the anon key) for the leaderboard; the server uses the **service key** for privileged writes.
- **Node.js `crypto`** — the standard-library cryptography module used for HMAC signatures, timing-safe comparison, and ID generation.
- **Resend** — transactional email (sends license keys). 

### `canvas` (node-canvas)
Used in the **main process** to *draw* the tray icon dynamically — a colored dot (green/amber/red) with the current score number rendered onto it as a PNG. That's why the build installs Cairo/Pango on macOS CI.

---

## 4. The architecture — three processes, one brain

This is the single most important thing to be able to draw. PosturePal runs **three renderer windows** coordinated by **one main process**:

```
                       ┌─────────────────────────────────────────────┐
                       │        MAIN PROCESS  (main.js, Node.js)      │
                       │  • owns electron-store (the DB)              │
                       │  • system tray (colored score dot)          │
                       │  • license/trial validation (calls website) │
                       │  • auto-updater                             │
                       │  • the IPC hub — routes messages between     │
                       │    all windows                              │
                       └───▲───────────▲──────────────▲──────────────┘
                    IPC    │           │              │   IPC
             ┌─────────────┘           │              └──────────────┐
             │                         │                             │
   ┌─────────┴─────────┐   ┌───────────┴───────────┐    ┌───────────┴──────────┐
   │  MAIN WINDOW      │   │  BACKGROUND WINDOW    │    │  ALERT WINDOW        │
   │  (Dashboard, React│   │  (hidden, 1×1 px)     │    │  (frameless, always- │
   │   UI, charts,     │   │  • webcam stream      │    │   on-top popup)      │
   │   leaderboard)    │   │  • MoveNet inference  │    │  • shows you slouching│
   │  draws skeleton   │   │    every 500 ms       │    │  • auto-dismisses on  │
   │  from keypoints   │   │  • scoring + XP + Slack│    │    good posture       │
   └───────────────────┘   │    leaderboard sync   │    └──────────────────────┘
                           └───────────────────────┘
```

**Why three windows?** This is the answer to the #1 resume bullet — *"decouples the UI from a continuous MoveNet loop via asynchronous IPC, sustaining real-time inference without blocking the render thread."*

- The **detection has to run 24/7**, even when the dashboard is minimized to the tray. So it lives in its own **hidden 1×1 background window** that's always alive.
- If the model ran in the **main window's** renderer, then (a) heavy GPU inference would compete with the UI's rendering/animations, and (b) closing/minimizing the dashboard would stop detection. Decoupling fixes both.
- The background window computes the score and keypoints and **sends them over IPC** — through the main process — to the main window, which just *draws* them. The Dashboard never loads TensorFlow at all (see the huge memory win in §8).

**The data flow for one detection tick:**
```
background window: capture frame → MoveNet → keypoints → score
      │  window.api.sendScore({score, signals})     window.api.sendKeypoints({keypoints})
      ▼
main process (ipcMain): update tray icon/menu; forward to main window
      │  webContents.send('score:update' / 'keypoints:update')
      ▼
main window: Dashboard shows score; PoseDetectorContext draws the skeleton overlay
```

Note the main process is a **pure message router + OS-integration layer**; the *heavy compute* is in a renderer (which has GPU/WebGL). This is the correct Electron design and worth stating explicitly, because the README's simplified diagram makes it look like TensorFlow runs in the main process — it does **not**; it runs in the hidden background *renderer*, which is exactly why it doesn't block anything.

---

## 5. The detection pipeline & scoring math

You should be able to explain how "an image becomes a posture score." (`src/renderer/background.js`.)

### Step 1 — Capture
`navigator.mediaDevices.getUserMedia` opens the webcam at 640×480, 15 fps (MoveNet only needs 192×192, so this keeps GPU/VRAM cost low). A `setInterval` fires every **500 ms** (2 Hz) — plenty for posture, and light on CPU/GPU.

### Step 2 — Inference
`detector.estimatePoses(video, { maxPoses: 1 })` returns the 17 keypoints for the single detected person.

### Step 3 — Normalize into ratios (the key idea)
Raw pixel coordinates are useless on their own — if you lean closer to the camera, everything gets bigger. So every measurement is **divided by shoulder width**, making it **scale-invariant**: sitting 2 ft or 3 ft back produces the same numbers. `calculateRatios()` computes things like:
- `headForwardRatio` — horizontal offset of the ear-midpoint vs. shoulder-midpoint ÷ shoulder width (detects "goblin lean" forward).
- `noseToShoulderRatio` — vertical nose-to-shoulder distance ÷ shoulder width (detects chin-to-chest / head-down).
- `neckRatio` — ear-to-shoulder vertical gap ÷ shoulder width (detects shoulder slouch/hunching).
- `earTiltDelta`, `shoulderTiltDelta` — left/right tilt.
- `faceToFrameRatio`, `distanceRatioB` — two independent screen-distance estimates, combined to avoid false "too close" positives.

### Step 4 — Calibration baseline
On first run you sit up straight and **calibrate** for 3 seconds. That records *your* personal baseline ratios (stored in electron-store). Every later score is a **deviation from your baseline**, not a generic ideal — so scoring is personalized.

### Step 5 — Five independent signals with thresholds
Each frame produces five boolean "raw bad" flags by comparing current ratios to baseline against tuned deltas (e.g. head-forward bad if it deviates > 0.09, head-down if > 0.10, shoulders if neck-drop > 0.125): **headForward, headDown, headTilt, shoulders, distance.**

### Step 6 — Hysteresis (anti-false-alarm) 
A single noisy frame shouldn't fire an alert. Each signal keeps a rolling window of the last **5** frames and only flips to "bad" if **≥ 3 of 5** were bad (`pushSignal`). This is **hysteresis** — it prevents flickering between good/bad on borderline posture.

### Step 7 — Weighted, smoothed score
Each signal yields a 0–100 sub-score; the overall raw score is a weighted sum (headDown 25%, shoulders 25%, headForward 20%, distance 20%, headTilt 10%). Then it's **smoothed** over the last 8 scores (a moving average) so the displayed number doesn't jitter.

### Step 8 — Alert state machine
- If **any** signal is red continuously for `alertDelay` seconds (default ~3–5 s, tracked by accumulating `badMs += 500`), fire the alert popup — then enter a **cooldown** so it doesn't nag repeatedly.
- While the alert is showing, once posture is **all-good for 3 continuous seconds**, hide the popup and award a **+20 XP recovery bonus**.

### Step 9 — Analytics, XP & leaderboard
Every 30 s a data point (score + which signals failed) is recorded into the current session; every completed **minute** awards XP scaled by average score, with a **streak bonus** for sustained good posture. Sessions are saved to electron-store every 60 s; the Supabase leaderboard syncs every 2 minutes (and on quit). Level math lives in a **shared module** (`src/shared/levels.js`) imported by *both* main and renderer so they can never disagree on thresholds.

---

## 6. The billing & DRM subsystem

This maps to resume bullet #2: *"secure billing and DRM subsystem with Razorpay and Supabase, using Node.js Crypto to enforce machine-bound device registration, parse asynchronous payment webhooks, and validate HMAC-signed license tokens."* Here's exactly what's real and where each piece lives.

### The payment flow (server: Next.js API routes on Vercel)
1. **`/api/create-order`** — the website asks Razorpay to create an **order** for the amount (₹, validated ≥ 100 paise) with the customer's name/email in `notes`. Returns an `order_id` to the browser, which opens Razorpay Checkout.
2. **`/api/verify-payment`** — after checkout, the browser posts back `order_id`, `payment_id`, `signature`. The server recomputes `HMAC_SHA256(order_id | payment_id, RAZORPAY_KEY_SECRET)` and compares it to Razorpay's signature using **`crypto.timingSafeEqual`** (constant-time compare to prevent timing attacks). This proves the payment is genuine and not forged by the client.
3. **`/api/razorpay-webhook`** — Razorpay *also* calls this server-to-server (**asynchronous webhook**) on `payment.captured`. The server verifies the **`x-razorpay-signature`** header by recomputing `HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)`. On a valid `payment.captured`, it **generates a license key**, inserts it into the Supabase `licenses` table (idempotently — it checks `payment_id` first so a duplicate webhook doesn't issue two keys), marks the customer paid, and links any matching trial for silent upgrade.
4. **`/api/generate-license`** — issues the license key (random `XXXX-XXXX-XXXX-XXXX` segments via `crypto.randomBytes`) and a short-lived **HMAC-signed session token** (`base64(payload).HMAC_SHA256(payload, secret)`, 2-hour expiry) for the success page.

### The licensing/DRM flow (desktop: `main.js`)
- **Machine binding:** on first launch the app generates a persistent **`machineId` = `crypto.randomUUID()`** stored locally. Trials and licenses are bound to it server-side: a **paid license allows max 2 devices** (`device_count` incremented on each activation, rejected at ≥ 2), and a **free trial is one-per-device** (the server rejects a trial key already consumed on a different `machine_id`, and rejects a device that already used any trial).
- **Validation:** `license:validate` / `trial:validate` IPC handlers POST to the website (`/api/validate-license`, `/api/validate-trial-key`). Success unlocks monitoring (`startMonitoring()` creates the background window).
- **Offline-first with a 24-hour grace period:** trials re-validate on launch (`trial:revalidate`). If the server is unreachable, the app falls back to the **cached** expiry — but only if it was validated within the last **24 hours** (`OFFLINE_GRACE_MS`). Beyond that, it locks. This is the "offline-first cache with a 24-hour grace period" from bullet #3.
- **Silent trial→paid upgrade:** if you buy while on a trial, the webhook links `converted_license_key` to your trial row; the app's next revalidation sees it and upgrades itself to paid with no re-entry.
- **Camera gating:** if there's no active access (no license, no live trial), the main process installs a permission handler that **denies `media`** — the webcam literally can't be opened until you're licensed.

> **Precise honesty note for interviews:** the *license key itself* is a random string validated by a **server database lookup**, not an offline-verifiable cryptographic token. The **HMAC-signed token** in the code is the **session token** (post-purchase) and the **Razorpay webhook/payment signatures** — those are the genuine HMAC pieces. So "validate HMAC-signed license tokens" is best described as "HMAC-verified payment webhooks and a signed session token," which is exactly what the code does. See §9.

---

## 7. Build, release & auto-update (CI/CD)

Maps to resume bullet #3.
- **`electron-builder.yml`** defines targets: macOS `.dmg` (x64 + arm64), Windows NSIS installer, Linux `.AppImage` + `.deb`, and the GitHub Releases **publish** target (`owner: Maan-Teckwani, repo: posturepal-releases`).
- **GitHub Actions (`.github/workflows/release.yml`)** — on pushing a `v*` tag, two jobs run in parallel: `build-win` (windows-latest) and `build-mac` (macos-latest, which `brew install`s Cairo/Pango for node-canvas). Each runs `npm run build` (webpack) then `electron-builder --publish always`, uploading installers + update metadata to GitHub Releases. Supabase keys are injected from **GitHub Secrets** at build time.
- **electron-updater** — the shipped app checks GitHub Releases on launch + every 4 hours, notifies the renderer when an update is available, downloads on demand, and installs on quit.
- **Honest platform nuance:** auto-update is currently **Windows-only in code** (`setupAutoUpdater` returns early on non-win32) because macOS auto-update requires a code-signed/notarized build, and the app currently ships **unsigned** on macOS (users right-click→Open the first time). This is a deliberate, documented trade-off, not an oversight.

---

## 8. How I built it, and where I got stuck

Real, code-grounded stories — each is a strong "tell me about a hard bug" answer.

**Gotcha #1 — Alerts stopped firing after the app sat in the tray (Chromium timer throttling).** The detection `setInterval(500ms)` lives in a **hidden** window. Chromium aggressively **throttles timers in background/hidden windows** — after 5 minutes hidden it can clamp a 500 ms interval to *once per minute*. So posture alerts were arriving a minute late. **Fix:** set `backgroundThrottling: false` on the background window so its timers keep firing at full rate. (Documented right in `createBackgroundWindow`.) *This is my favorite Electron-internals war story.*

**Gotcha #2 — 250 MB of wasted memory (duplicate model).** Originally the Dashboard also loaded TensorFlow.js to draw the skeleton, meaning **two** copies of the model + two WebGL contexts. **Fix:** a **single-pipeline** design — only the background window runs the model; the Dashboard subscribes to keypoints over IPC via `PoseDetectorContext` and just *draws* them. Saved ~250 MB and a second GPU context. (Documented in `PoseDetectorContext.jsx`.)

**Gotcha #3 — Jittery false alerts.** Raw per-frame detection flickered good/bad on borderline posture and fired spurious alerts. **Fix:** two layers of stabilization — **per-signal hysteresis** (3-of-5 frames must be bad) *and* an **8-frame moving average** on the displayed score.

**Gotcha #4 — Distance from camera broke scoring.** Leaning in made every pixel measurement bigger and tripped thresholds. **Fix:** normalize every ratio by **shoulder width** → scale invariance.

**Gotcha #5 — macOS camera permission never prompted.** On macOS, `getUserMedia` alone doesn't trigger the system permission dialog for a packaged app. **Fix:** explicitly call `systemPreferences.askForMediaAccess('camera')`, and provide a "open System Settings" deep link for when the user needs to flip it manually. Windows/Linux handle it implicitly.

**Gotcha #6 — Offline boot got stuck on "Loading AI model…" forever.** MoveNet weights are fetched from `tfhub.dev` on first load; if the machine was offline at launch, it hung permanently even after reconnecting. **Fix:** a retry loop that, when `navigator.onLine` is false, *waits on the `online` event* (sub-second reconnect → detection) instead of failing. Same retry pattern guards the webcam stream.

**Gotcha #7 — XP/leaderboard lost on quit.** Closing the app could exit before the final session and XP were flushed to Supabase. **Fix:** a **quit handshake** — `before-quit` calls `preventDefault()`, tells the background window to flush session + leaderboard, and waits for a `quit:ready` acknowledgement (with a 5 s safety fallback so it can never hang forever).

**Gotcha #8 — XP counter could drift.** If an `addXP` call was missed (crash mid-session), the cumulative counter fell behind reality. **Fix:** `reconcileXP` recomputes the total from the authoritative session records (`max(stored, sum(sessions))`) so the counter self-heals and dashboard/analytics/leaderboard always agree.

**Gotcha #9 — Duplicate leaderboard rows on rename.** The leaderboard is keyed on username; a plain upsert after a rename created a second row. **Fix:** remember the previously-registered username locally and rename that row in place before upserting — one consistent writer.

---

## 9. Resume claims vs. the real code

Your PosturePal bullets are **the most accurate of the three projects** — the architecture claim is genuinely implemented. Two phrases just need precise framing.

### Bullet #1 — *"decouples the UI from a continuous MoveNet loop via asynchronous IPC… without blocking the render thread."*
✅ **Fully accurate and well-implemented.** Detection runs in a dedicated hidden renderer; the UI subscribes to results over async IPC; the Dashboard never runs inference. Say it with total confidence. (One clarification if pressed: the loop runs in a **hidden renderer process**, not the main process — that's *better* than the README's simplified diagram suggests, because the renderer has the GPU/WebGL.)

### Bullet #2 — *"using Node.js Crypto to enforce machine-bound device registration, parse asynchronous payment webhooks, and validate HMAC-signed license tokens."*
✅ Node.js `crypto`: **yes** (`randomUUID`, `randomBytes`, `createHmac`, `timingSafeEqual`).
✅ Machine-bound device registration: **yes** (per-device `machineId`; 2-device license cap; one-trial-per-device).
✅ Parse asynchronous payment webhooks: **yes** (`/api/razorpay-webhook` with HMAC-verified `x-razorpay-signature`, idempotent).
⚠️ *"validate HMAC-signed license tokens"* — **frame precisely.** The **HMAC-signed** artifacts are the **Razorpay payment/webhook signatures** and the **post-purchase session token**. The **license key** is a random string validated by a **Supabase lookup** (device-count enforced), not an offline-verifiable signed token.
**How to answer:**
> "The HMAC verification is on the Razorpay side — I verify the webhook's `x-razorpay-signature` and the checkout signature with `crypto.createHmac` and a timing-safe compare — and I issue an HMAC-signed session token after purchase. The license *key* itself is a random key checked against Supabase with device-count enforcement, so activation is a server-validated lookup rather than a self-contained signed token. If I wanted fully offline cryptographic validation, I'd sign the license payload (machine id + entitlement) and verify the signature in-app."
That's honest, precise, and shows you understand the difference between a **signed token** and a **server-validated key**.

### Bullet #3 — *"electron-updater CI/CD and an offline-first cache (electron-store) with a 24-hour grace period; launched to 500+ organic viewers."*
✅ electron-updater + GitHub Actions CI/CD: **yes** (with the honest nuance that auto-update is Windows-only in code today; mac needs signing).
✅ electron-store offline cache + **24-hour grace period**: **yes**, exactly (`OFFLINE_GRACE_MS = 24h`).
◽ "500+ organic viewers" is a marketing metric — not something in the code; be ready to explain where it came from (launch traffic to posturepal.in), but you can't "prove" it from the repo, which is fine.

**Net:** be fully confident on bullet #1 and most of #2/#3; use the precise framing above for "HMAC-signed license tokens" and "Windows-only auto-update."

---

## 10. Core interview questions & model answers

**Q: Walk me through Electron's process model and how PosturePal uses it.**
→ Main process (Node, OS access, no UI) + renderer processes (Chromium, sandboxed). PosturePal has one main + three renderers (dashboard, hidden background detector, alert popup). They communicate via IPC routed through the main process. Detection lives in the hidden renderer so it survives minimizing and doesn't block the UI.

**Q: How do you keep inference from freezing the UI?**
→ It runs in a *separate process* (the hidden background window), not the UI's. Results flow to the UI as async IPC messages, which React renders. There's no shared thread to block — the OS schedules the two renderers independently.

**Q: Why does detection run every 500 ms and not every frame?**
→ Posture changes slowly; 2 Hz is responsive enough and keeps GPU/CPU cost minimal. Full frame-rate inference would waste battery for no UX benefit.

**Q: How do you avoid false alarms?**
→ Three mechanisms: normalize by shoulder width (scale invariance), per-signal hysteresis (3-of-5 frames), and an 8-frame score moving average. Plus an `alertDelay` so a signal must stay bad for a few seconds, and a cooldown so it doesn't nag.

**Q: How is the app secure given it's a web page with camera access?**
→ `contextIsolation: true`, `nodeIntegration: false`, and a preload `contextBridge` that exposes only a whitelisted `window.api`. The renderer can't reach Node/OS directly — least privilege. Camera is also gated behind license/trial: `media` permission is denied until access is active.

**Q: How does the payment → license flow work end to end?**
→ create-order → Razorpay checkout → verify-payment (HMAC + timing-safe compare) → asynchronous razorpay-webhook (HMAC-verified, idempotent) issues a key into Supabase → desktop validates the key (device-count enforced) → unlock. (Narrate §6.)

**Q: How does it work offline?**
→ electron-store caches license/trial state and the calibration baseline; the model weights cache after first load; and there's a 24-hour offline grace window on trial revalidation. Detection itself is 100% local, so posture tracking never needs the network.

**Q: Why on-device inference instead of a cloud API?**
→ Privacy (webcam frames never leave the device — a core selling point), latency (no round-trip for a 2 Hz loop), and cost (no per-inference server bill). The trade-off is a bigger install and using the user's GPU.

---

## 11. Trap scenarios

**"If it's a paid app but runs locally, what stops someone cracking the license check?"**
→ "Honestly, a determined attacker can patch any client-side check in a local Electron app — the JS is on their disk. My defenses raise the cost, not make it impossible: server-side validation with device-count limits, machine-bound trials, HMAC-verified payments so you can't forge a *purchase*, and the camera gated behind active access. True anti-piracy for desktop needs native obfuscation or a server-dependent core feature, which for a $17 utility isn't worth the UX cost. I optimized for honest-user friction-free experience, not DRM maximalism."

**"Your webhook could be called twice. Do you issue two licenses?"**
→ "No — it's idempotent. Before issuing, the handler looks up the `payment_id` in `licenses`; if a key already exists it returns `already_processed`. Same guard in generate-license. Razorpay retries are safe."

**"A user spoofs the `x-razorpay-signature` header."**
→ "They can't produce a valid one without the webhook secret. I recompute `HMAC_SHA256(rawBody, secret)` and reject on mismatch. Critically I hash the **raw** body text, not a re-serialized object, because re-serialization would change bytes and break the signature."

**"Why `timingSafeEqual` instead of `===`?"**
→ "String `===` short-circuits on the first differing character, leaking timing information an attacker could use to guess a signature byte-by-byte. `crypto.timingSafeEqual` compares in constant time. It's defense against timing side-channels."

**"Two people share one license key."**
→ "The license caps at 2 device activations — `device_count` increments per machine and the server rejects the third. Each device is identified by a persisted `machineId`. It's not unbeatable (someone could reset their store), but it stops casual sharing."

**"MoveNet mis-detects in bad lighting and fires random alerts."**
→ "Two guards: MoveNet returns per-keypoint confidence and I require the needed keypoints to be present (`calculateRatios` returns null otherwise → score null, no alert), and hysteresis means a few bad frames can't trigger an alert. Persistent bad lighting degrades gracefully to 'no score' rather than false alerts. It's a documented limitation — the app needs decent lighting."

**"What happens to detection when the laptop sleeps or the user switches cameras?"**
→ "On camera change the main process broadcasts `camera:changed`; the background + alert windows drop the old stream and re-acquire the new device (with an `OverconstrainedError` fallback to default constraints). On resume, the retry loops re-acquire the webcam and reload the model if needed."

**"Electron is a memory hog. Justify it."**
→ "Fair — shipping Chromium costs ~150–200 MB baseline. I chose it for one cross-platform codebase *and* browser-grade ML (TF.js + WebGL) *and* Node/OS integration in one app, which no other single stack gives cleanly. I clawed back the biggest cost — the duplicate model — by running a single inference pipeline (saved ~250 MB). A native app per platform would be lighter but 3× the work."

**"How do you test real-time CV without a person in front of the camera in CI?"**
→ "The scoring is pure functions over keypoint arrays (`calculateRatios`, `scorePosture`), so they're unit-testable with synthetic keypoints — no camera needed. The camera/model/IPC layers are integration-tested manually against the release checklist in the README. Separating the math from the I/O is what makes it testable."

---

## 12. One-line rapid-fire cheat sheet

- **What is it?** Cross-platform Electron desktop app; on-device MoveNet posture detection + paid licensing.
- **Process model?** 1 main (Node/OS) + 3 renderers (dashboard, hidden background detector, alert popup); talk via IPC.
- **Key architecture win?** Inference runs in a **hidden renderer**, results stream to the UI over async IPC → UI never blocks; detection survives minimizing.
- **AI?** TensorFlow.js + MoveNet SINGLEPOSE_LIGHTNING, WebGL/GPU, every 500 ms, **fully on-device** (privacy).
- **Scoring?** Ratios normalized by shoulder width → deltas from personal calibration → 5 signals → **hysteresis (3/5)** + **8-frame smoothing** → weighted 0–100.
- **Security model?** `contextIsolation` + `nodeIntegration:false` + preload `contextBridge` = least-privilege IPC.
- **Payments?** Razorpay; server verifies HMAC webhook + checkout signature with `crypto` + `timingSafeEqual`; idempotent license issuance.
- **DRM?** Machine-bound (`crypto.randomUUID`), 2-device license cap, one-trial-per-device, **24-hour offline grace**.
- **Storage?** electron-store (settings, sessions, XP, calibration, license) — offline-first.
- **Distribution?** electron-builder (dmg/nsis/AppImage) + electron-updater + GitHub Actions on `v*` tags.
- **Backend?** Next.js API routes on Vercel + Supabase Postgres (licenses/trials/customers/leaderboard).
- **Honest nuances?** "HMAC-signed" = payment/webhook signatures + session token (license key is a server-validated random key); auto-update is Windows-only today (mac unsigned).
- **Best war story?** `backgroundThrottling:false` — Chromium was throttling the hidden window's timer and delaying alerts by up to a minute.

---

*Grounded in the actual source: `main.js`, `preload.js`, `src/renderer/background.js`, `src/renderer/contexts/PoseDetectorContext.jsx`, `src/renderer/leaderboardSync.js`, `electron-builder.yml`, `.github/workflows/release.yml`, and `posturepal-web/app/api/*` (create-order, verify-payment, razorpay-webhook, generate-license, validate-license, validate-trial-key). Where the resume says "HMAC-signed license tokens" and "auto-update," §9 gives you the precise, honest framing.*
