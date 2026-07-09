// Single source of truth for the XP → level ladder.
//
// This module is intentionally written as CommonJS so it can be consumed by
// BOTH the Electron main process (`require('./src/shared/levels')`) and the
// webpack/ESM renderer (`import { levelProgress } from '../../shared/levels'`).
// Previously XP_THRESHOLDS was copy-pasted into main.js, Dashboard.jsx and
// Analytics.jsx, which let the level math drift between processes — keep it here.

// Cumulative XP required to reach each level (level N === XP_THRESHOLDS[N-1]).
// Levels 1-10 are the original ladder; 11-15 extend it so heavy users keep
// climbing well past the old 15000 cap before hitting the top tier.
const XP_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000,
  22000, 30000, 42000, 58000, 80000
];

const LEVEL_TITLES = [
  'Shrimp 🦐', 'Minnow 🐟', 'Salmon 🐠', 'Dolphin 🐬', 'Shark 🦈',
  'Whale 🐋', 'Posture Ninja 🥷', 'Spine God 🧘', 'Ergonomic Legend 🏆', 'PosturePal Master 👑',
  'Iron Spine 🛡️', 'Posture Titan 🗿', 'Cosmic Aligner 🌌', 'Immortal Spine ⚡', 'PosturePal Deity 🏛️'
];

// Highest level a user can reach (top of the named ladder).
const MAX_LEVEL = XP_THRESHOLDS.length;

function calculateLevel(totalXP) {
  const xp = Number(totalXP) || 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

// Everything the UI needs to render a progress bar and label, derived purely
// from total XP so the level number, title and bar can never disagree.
//   into  — XP earned within the current level band
//   span  — width of the current band (0 at max level)
//   percent — clamped 0-100 fill for the bar (100 at max level)
function levelProgress(totalXP) {
  const xp = Number(totalXP) || 0;
  const level = calculateLevel(xp);
  const levelIndex = level - 1;
  const isMax = level >= MAX_LEVEL;

  const currentThreshold = XP_THRESHOLDS[levelIndex];
  const nextThreshold = isMax ? currentThreshold : XP_THRESHOLDS[levelIndex + 1];
  const into = xp - currentThreshold;
  const span = isMax ? 0 : nextThreshold - currentThreshold;
  const percent = isMax ? 100 : Math.min(100, Math.max(0, (into / span) * 100));
  const title = LEVEL_TITLES[Math.min(levelIndex, LEVEL_TITLES.length - 1)];

  return { level, title, into, span, percent, currentThreshold, nextThreshold, isMax };
}

module.exports = { XP_THRESHOLDS, LEVEL_TITLES, MAX_LEVEL, calculateLevel, levelProgress };
