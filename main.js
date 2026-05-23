const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, session } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createCanvas } = require('canvas');
const { autoUpdater } = require('electron-updater');

const store = new Store({
  defaults: {
    settings: {
      threshold: 60,
      alertDelay: 3,
      cooldown: 30,
      runOnStartup: false
    },
    sessions: [],
    xp: { total: 0, level: 1 },
    licenseKey: null
  }
});

// Base URL of the deployed PosturePal website (handles license validation).
const LICENSE_API_URL = 'https://www.posturepal.in';

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => console.log('Checking for updates...'));

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update:available', info);
  });

  autoUpdater.on('update-not-available', () => console.log('App is up to date.'));

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) mainWindow.webContents.send('update:progress', Math.round(progress.percent));
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update:ready');
  });

  autoUpdater.on('error', (err) => console.error('Auto-updater error:', err.message));

  setTimeout(() => autoUpdater.checkForUpdates(), 5000);
  setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
}

ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
ipcMain.handle('update:install', () => autoUpdater.quitAndInstall());

let alertWindow = null;
let backgroundWindow = null;
let mainWindow = null;
let tray = null;
let isPaused = false;
let lastScore = null;
let lastSignals = null;
let quitHandshakeDone = false;

function createTrayIcon(score) {
  const c = createCanvas(22, 22);
  const ctx = c.getContext('2d');

  let color = '#888888'; // gray = not calibrated
  if (score !== null) {
    if (score >= 70) color = '#22c55e';      // green
    else if (score >= 50) color = '#f59e0b'; // amber
    else color = '#ef4444';                  // red
  }

  ctx.beginPath();
  ctx.arc(11, 11, 9, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (score !== null) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score), 11, 11);
  }

  return nativeImage.createFromBuffer(c.toBuffer('image/png'));
}

function updateTrayMenu(score, signals, paused) {
  if (!tray) return;

  tray.setImage(createTrayIcon(paused ? null : score));

  const scoreLabel = score === null
    ? 'Not calibrated'
    : `Score: ${score}  ${score >= 70 ? '🟢 Good' : score >= 40 ? '🟡 Fair' : '🔴 Poor'}`;

  const menu = Menu.buildFromTemplate([
    { label: 'PosturePal', enabled: false },
    { label: paused ? '⏸ Detection paused' : scoreLabel, enabled: false },
    { type: 'separator' },
    {
      label: 'Open PosturePal',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: paused ? '▶ Resume Detection' : '⏸ Pause Detection',
      click: () => toggleDetection()
    },
    { type: 'separator' },
    {
      label: 'Quit PosturePal',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(menu);
}

function createTray() {
  tray = new Tray(createTrayIcon(null));
  tray.setToolTip('PosturePal — Click to open');

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  updateTrayMenu(null, null, isPaused);
}

function toggleDetection() {
  isPaused = !isPaused;
  if (backgroundWindow && !backgroundWindow.isDestroyed()) {
    backgroundWindow.webContents.send('detection:toggle', isPaused);
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('detection:toggle', isPaused);
  }
  updateTrayMenu(lastScore, lastSignals, isPaused);
}

function createBackgroundWindow() {
  backgroundWindow = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  backgroundWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'background.html'));
}

function startMonitoring() {
  session.defaultSession.setPermissionRequestHandler(null);
  if (!backgroundWindow || backgroundWindow.isDestroyed()) {
    createBackgroundWindow();
  }
}

function createAlertWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  alertWindow = new BrowserWindow({
    width: 320,
    height: 200,
    x: width - 320 - 20,
    y: height - 200 - 20,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  alertWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'alert.html'));
  alertWindow.hide();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      const hasShownTip = store.get('hasShownTrayTip', false);
      if (!hasShownTip && tray && process.platform === 'win32') {
        tray.displayBalloon({
          title: 'PosturePal is still running',
          content: 'Detection continues in the background. Right-click the tray icon to quit.'
        });
        store.set('hasShownTrayTip', true);
      }
    }
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  if (!gotTheLock) return;

  const settings = store.get('settings');
  app.setLoginItemSettings({
    openAtLogin: settings.runOnStartup || false,
    openAsHidden: true
  });
  if (store.get('calibrationVersion') !== 2) {
    store.delete('calibration');
    store.set('calibrationVersion', 2);
  }

  if (!store.get('licenseKey')) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') return callback(false);
      callback(true);
    });
  }

  createWindow();
  createAlertWindow();
  createTray();
  setupAutoUpdater();

  // Monitoring only runs once this device has an activated license
  if (store.get('licenseKey')) {
    createBackgroundWindow();
  }

  app.on('activate', function () {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createAlertWindow();
      if (store.get('licenseKey')) {
        createBackgroundWindow();
      }
    }
  });
});

app.on('before-quit', (e) => {
  app.isQuitting = true;
  if (mainWindow) mainWindow.removeAllListeners('close');
  if (backgroundWindow) backgroundWindow.removeAllListeners('close');

  if (quitHandshakeDone) return;

  // Give the background window a chance to flush the session and push the
  // latest XP to the Supabase leaderboard before the app actually exits.
  if (backgroundWindow && !backgroundWindow.isDestroyed()) {
    e.preventDefault();
    backgroundWindow.webContents.send('app:quitting');
    setTimeout(() => {
      quitHandshakeDone = true;
      app.quit();
    }, 5000); // safety fallback if the renderer never reports back
  }
});

ipcMain.handle('quit:ready', () => {
  if (quitHandshakeDone) return;
  quitHandshakeDone = true;
  app.quit();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for electron-store
ipcMain.handle('store:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store:getAll', () => {
  return store.store;
});

// IPC handlers for alert window
ipcMain.handle('alert:show', (event, data) => {
  if (alertWindow) {
    alertWindow.show();
    alertWindow.webContents.send('alert:data', data);
  }
});

ipcMain.handle('alert:hide', () => {
  if (alertWindow) {
    alertWindow.hide();
  }
});

// IPC handlers for background scoring
ipcMain.handle('score:update', (event, data) => {
  lastScore = data.score;
  lastSignals = data.signals;
  updateTrayMenu(lastScore, lastSignals, isPaused);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('score:update', data);
  }
});

ipcMain.handle('calibration:updated', (event, baseline) => {
  if (backgroundWindow && !backgroundWindow.isDestroyed()) {
    backgroundWindow.webContents.send('calibration:updated', baseline);
  }
});

ipcMain.handle('detection:toggle', () => {
  toggleDetection();
});

// Broadcast camera changes so the background detector and the alert window
// drop their current stream and re-acquire the newly selected device.
ipcMain.handle('camera:changed', (_, cameraId) => {
  if (backgroundWindow && !backgroundWindow.isDestroyed()) {
    backgroundWindow.webContents.send('camera:changed', cameraId);
  }
  if (alertWindow && !alertWindow.isDestroyed()) {
    alertWindow.webContents.send('camera:changed', cameraId);
  }
});

ipcMain.handle('app:setLoginItem', (event, enabled) => {
  app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: true });
  store.set('settings.runOnStartup', enabled);
});

// Session and XP Analytics
ipcMain.handle('session:save', (_, session) => {
  const sessions = store.get('sessions', []);
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session; // update existing
  } else {
    sessions.push(session);            // add new
  }
  // Keep only last 90 days of sessions
  const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const trimmed = sessions.filter(s => s.startTime > cutoff);
  store.set('sessions', trimmed);
  return true;
});

ipcMain.handle('session:getAll', () => store.get('sessions', []));

const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];

function calculateLevel(totalXP) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

// Total XP actually recorded across every saved session. Sessions are the
// reliable, persisted source of truth — this is what Detailed Metrics shows.
function sumSessionXP() {
  return store.get('sessions', []).reduce((t, s) => t + (s.xpEarned || 0), 0);
}

// Reconciles the cumulative XP counter against the session data so it can
// never fall behind the XP that has actually been earned. This self-heals the
// counter if an addXP call was ever missed (app crash mid-session, etc.), so
// the dashboard, analytics and leaderboard always agree with Detailed Metrics.
function reconcileXP(extra = 0) {
  const stored = store.get('xp', { total: 0, level: 1 });
  const total = Math.max(stored.total || 0, sumSessionXP()) + extra;
  const xp = { total, level: calculateLevel(total) };
  if (xp.total !== stored.total || xp.level !== stored.level) {
    store.set('xp', xp);
  }
  return xp;
}

ipcMain.handle('xp:get', () => reconcileXP(0));

ipcMain.handle('xp:add', (_, amount) => {
  const xp = reconcileXP(amount || 0);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('xp:updated', xp);
  }
  return xp;
});

ipcMain.handle('license:validate', async (_, key) => {
  try {
    const res = await fetch(`${LICENSE_API_URL}/api/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = await res.json();
    if (data.valid) {
      store.set('licenseKey', key);
      startMonitoring();
    }
    return data;
  } catch (err) {
    return { valid: false, message: 'Could not connect. Check your internet connection and try again.' };
  }
});
