# PosturePal

Stop sitting like a shrimp. Your spine will thank you.

PosturePal is a lightweight desktop app that uses your webcam and on-device AI to detect slouching in real-time. Get a popup alert when your posture goes bad. Fix it. Move on. Works offline, no data leaves your device, one-time payment.

**Platforms:** Mac (Intel + M1) | Windows | Linux

**Price:** $17 USD (one-time, lifetime license, 2 devices)

---

## What It Does

- 🎯 **Real-time posture detection** — uses TensorFlow MoveNet (on-device AI) to track your head, shoulders, and screen distance every 500ms
- 🔴 **3-second alert popup** — see yourself in a floating window when bad posture is detected. Fix it. Auto-dismisses when you improve
- 📊 **Session analytics** — daily/weekly/monthly charts showing your posture score trends
- 🏆 **XP + leaderboard** — earn XP for every minute of good posture, level up, compete with friends (anonymously)
- 🔒 **100% offline** — all AI runs locally. Zero webcam footage leaves your device
- 💾 **Persistent calibration** — one 3-second calibration, saved forever. Scoring is relative to YOUR perfect posture, not generic
- 🖥️ **System tray integration** — minimize and forget. Detection runs silently in the background
- ⚙️ **Customizable settings** — adjust alert threshold, delay, cooldown, run on startup

---

## Quick Start

### Download & Install

Get the latest version for your OS:
- **Mac** → [PosturePal.dmg](https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest)
- **Windows** → [PosturePal-Setup.exe](https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest)
- **Linux** → [PosturePal.AppImage](https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest)

### First Launch

1. Open PosturePal
2. Click **Calibrate** and sit up straight for 3 seconds
3. That's it. PosturePal now knows your perfect posture
4. Minimize the app — it hides to your system tray and watches silently

### First Bad Posture

- Slouch for 3+ seconds
- A popup appears showing you live from your webcam
- You see exactly what's wrong (Head down? Shoulders hunching? Too close?)
- Fix it. The popup turns green and auto-dismisses when posture is good

---

## How It Works

### The Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Computer                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Electron Main Process (Node.js)                   │ │
│  │  ├─ Webcam access                                  │ │
│  │  ├─ TensorFlow MoveNet (AI)                        │ │
│  │  ├─ Posture scoring algorithm                      │ │
│  │  ├─ Alert manager (tray, notifications)           │ │
│  │  ├─ Local database (electron-store JSON)          │ │
│  │  └─ IPC bridge (preload.js)                        │ │
│  └────────────────────────────────────────────────────┘ │
│                         △                                │
│         ┌───────────────┼───────────────┐               │
│         │               │               │               │
│    ┌────▼────┐    ┌─────▼─────┐   ┌────▼─────┐         │
│    │ Dashboard    │ Background │   │   Alert  │         │
│    │ (React UI)   │  (Detection)    │ Popup   │         │
│    │ Charts,      │  Runs 24/7      │ Window  │         │
│    │ Leaderboard  │  Even minimized │ (HTML)  │         │
│    └──────────────┘    └───────────┘   └─────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                          │
         │ (IPC messages)           │
         │                          │
    ┌────▼──────────┐          ┌────▼──────────┐
    │ Supabase      │          │ Vercel        │
    │ Leaderboard + │          │ License       │
    │ License DB    │          │ validation    │
    └───────────────┘          └───────────────┘
```

### The Three Signals

PosturePal monitors three independent posture metrics:

1. **Head Position**
   - Forward/backward tilt (goblin lean)
   - Down/up tilt (chin to chest)
   - Left/right tilt (level head)

2. **Shoulder Slouch**
   - Vertical distance between shoulders and ears
   - When slouching, shoulders rise toward ears

3. **Screen Distance**
   - Face size relative to frame width
   - Eye distance relative to shoulder width
   - Combined to avoid false positives

All measurements are **normalized by shoulder width**, so distance from camera doesn't matter. You sit 2 feet back or 3 feet back — the score stays consistent.

### Calibration

Click **Calibrate** while sitting in perfect posture for 3 seconds. PosturePal records your baseline position for all three signals. Every subsequent score is a deviation from that baseline.

Baseline is saved locally and persists forever (or until you recalibrate).

### XP & Levels

- **1 XP per minute** of good posture (score ≥ 60)
- **Bonus 25 XP** when you fix your posture after an alert
- **10 levels** with increasing thresholds
- Leaderboard syncs to Supabase, visible to all users (anonymously)

---

## Privacy & Security

✅ **Webcam footage never leaves your computer**
- TensorFlow MoveNet runs locally via TensorFlow.js
- Only pose keypoints (17 pixel coordinates) are extracted
- Keypoints are scored locally
- Nothing gets uploaded

✅ **No account needed**
- License key is validated offline after first activation
- XP uploads anonymously (username is auto-generated)
- Settings stored locally on your disk

✅ **Code-signed and notarized**
- macOS builds are notarized (no Gatekeeper warnings)
- Windows builds are signed
- Linux runs as unsigned AppImage (standard)

---

## Technical Stack

### Desktop App
- **Framework:** Electron
- **UI:** React + JavaScript (no TypeScript)
- **Styling:** CSS modules (neobrutalist design)
- **AI:** TensorFlow.js + MoveNet Lightning
- **Local DB:** electron-store (JSON)
- **Bundler:** Webpack
- **Packaging:** electron-builder

### Website & Backend
- **Framework:** Next.js 14
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Payments:** Razorpay
- **Email:** Resend

### Monitoring
- **Updates:** electron-updater (GitHub Releases)
- **CI/CD:** GitHub Actions

---

## File Structure

```
posturepal/                          ← Electron app
├── main.js                          ← Electron main process
├── preload.js                       ← IPC bridge
├── webpack.config.js                ← Bundler config
├── electron-builder.yml             ← Packaging config
├── package.json
├── src/
│   └── renderer/
│       ├── index.html               ← App shell
│       ├── index.jsx                ← React entry
│       ├── alert.html               ← Alert popup UI
│       ├── background.js            ← Background detection loop
│       ├── App.jsx                  ← Main app component
│       ├── screens/
│       │   ├── Dashboard.jsx        ← Live posture view
│       │   ├── Analytics.jsx        ← Charts & history
│       │   ├── Leaderboard.jsx      ← Rankings
│       │   ├── Settings.jsx         ← Preferences
│       │   └── License.jsx          ← License gate
│       └── hooks/
│           ├── useWebcam.js         ← Camera access
│           ├── usePoseDetector.js   ← MoveNet loading
│           ├── usePostureScore.js   ← Scoring algorithm
│           ├── useDetectionLoop.js  ← Detection heartbeat
│           └── useAlertManager.js   ← Alert debounce

posturepal-web/                      ← Website & backend
├── app/
│   ├── page.js                      ← Landing page
│   ├── globals.css                  ← Design system
│   └── api/
│       ├── razorpay-webhook/        ← Payment handler
│       └── validate-license/        ← License check
├── package.json
└── .env.local                       ← API keys (not in repo)

.github/
└── workflows/
    └── release.yml                  ← CI/CD pipeline
```

---

## Development

### Prerequisites
- Node.js 20+
- npm or yarn
- (macOS only) Xcode Command Line Tools for native builds

### Setup

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/posturepal.git
cd posturepal
npm install

# Start in development mode
npm start
# Opens Electron window with hot reload
# Press Ctrl+R to reload the renderer
# Close and reopen window to reload main process

# Build for distribution (requires platform-specific tools)
npm run dist:mac      # macOS .dmg (requires macOS)
npm run dist:win      # Windows .exe (requires Windows or wine)
npm run dist:linux    # Linux .AppImage (cross-platform)
npm run dist:all      # All three platforms (requires all OSes or Docker)
```

### Environment Variables

For local development (optional — license check is skipped in dev):

```bash
# .env.local (not in repo)
NODE_ENV=development
```

For the website and payment webhook setup, see `posturepal-web/.env.local.example`.

### Testing Checklist

Before tagging a release:

```
Mac:
  ☐ App opens from .dmg, installs to /Applications
  ☐ Camera permission dialog shows
  ☐ Calibration works, score updates live
  ☐ Slouch for 3 seconds, alert popup appears
  ☐ Webapp shows live posture + keypoint dots
  ☐ Tray icon shows score color (red/amber/green)
  ☐ Settings persist after restart
  ☐ Analytics screen loads, shows charts
  ☐ Leaderboard syncs to Supabase

Windows:
  ☐ Installer runs, app in Program Files
  ☐ Desktop shortcut works
  ☐ Posture detection & alerts work
  ☐ Tray icon visible in system tray

Linux:
  ☐ AppImage is executable
  ☐ Posture detection works
  ☐ Tray icon visible (if AppIndicator available)
```

---

## Building & Releasing

### Automatic (GitHub Actions)

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions automatically builds for Mac, Windows, Linux
# Artifacts uploaded to GitHub Releases
# Users get auto-update notification
```

### Manual Build

```bash
# Build desktop app
npm run build

# Generate installers (one platform at a time)
npm run dist:mac
# Output: release/PosturePal-1.0.0.dmg, release/PosturePal-1.0.0.zip

npm run dist:win
# Output: release/PosturePal-Setup-1.0.0.exe

npm run dist:linux
# Output: release/PosturePal-1.0.0.AppImage
```

### Code Signing (macOS & Windows)

**macOS:**
- Requires Apple Developer account ($99/year)
- Set environment variables (see GitHub Actions workflow)
- electron-builder notarizes automatically

**Windows:**
- Code signing is optional but recommended
- Unsigned builds show a SmartScreen warning but install fine

---

## Known Limitations & Future Work

### Current Limitations
- ⚠️ Requires decent lighting (desk lamp is fine, dark rooms will fail)
- ⚠️ Webcam stream opens on first app launch (required for pose detection)
- ⚠️ License key tied to device (max 2 activations per key)
- ⚠️ No cloud sync — sessions stored locally only

### Planned Features
- ☐ Cloud sync (backup sessions to user account)
- ☐ Browser extension (detect posture while browsing, no app needed)
- ☐ Mobile app (iOS/Android)
- ☐ Team dashboard (manager can see team's average posture)
- ☐ Slack integration (posture alerts in Slack)
- ☐ Bluetooth posture sensor support
- ☐ Configurable alert sounds

---

## Troubleshooting

### "Webcam not detected"
- Check System Preferences → Security & Privacy → Camera
- Ensure PosturePal has camera access
- Try another camera app (Photo Booth on Mac) to verify hardware works
- Restart the app

### "Score stays at —"
- Ensure your face and shoulders are visible in the camera
- Lighting should be adequate (facing a light source helps)
- Click **Calibrate** again
- Check console for errors: View → Toggle Developer Tools

### "Alert popup doesn't appear"
- Check Settings — alert threshold may be set too high (try 50)
- Alert delay should be 3–10 seconds
- Ensure Detection is not paused (check tray icon)
- Try slouching more dramatically

### "License key won't validate"
- Check your internet connection (validation happens once)
- Ensure you typed the key correctly (format: XXXX-XXXX-XXXX-XXXX)
- Check email spam folder for license key
- Contact support with your order email

### "App crashes on startup"
- Open Developer Tools: View → Toggle Developer Tools
- Screenshot the error message
- Check `~/Library/Logs/PosturePal/` for logs (Mac) or similar on Windows/Linux
- File an issue on GitHub with the error

---

---

## License

PosturePal desktop app: Proprietary (paid license required to run)

Source code: Licensed for internal use and contributions only. See LICENSE file.

---

## Support

- 🌐 Website: [posturepal.io](https://posturepal-sigma.vercel.app/)

---

## Credits

**Built by:** [Maan Teckwani]

**AI Model:** TensorFlow MoveNet (Google)

**Design Inspiration:** Neobrutalist design systems

**Icons:** Emojis + custom SVG

---

## Changelog

### v1.0.0 (Initial Release)
- ✅ Real-time posture detection
- ✅ Alert popup system
- ✅ Session analytics with charts
- ✅ XP + leaderboard
- ✅ System tray integration
- ✅ Cross-platform (Mac, Windows, Linux)
- ✅ Auto-updater via GitHub Releases
- ✅ Razorpay payments + license keys

---

**Your spine will thank you. Get PosturePal for $17 at [posturepal](https://posturepal-sigma.vercel.app/)**

Stop sitting like a shrimp.
