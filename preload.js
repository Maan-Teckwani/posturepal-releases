const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getData: (key) => ipcRenderer.invoke('store:get', key),
  setData: (key, value) => ipcRenderer.invoke('store:set', key, value),
  getAllData: () => ipcRenderer.invoke('store:getAll'),
  showAlert: (data) => ipcRenderer.invoke('alert:show', data),
  hideAlert: () => ipcRenderer.invoke('alert:hide'),
  onAlertData: (callback) => ipcRenderer.on('alert:data', (event, data) => callback(data)),
  sendScore: (data) => ipcRenderer.invoke('score:update', data),
  onScoreUpdate: (callback) => ipcRenderer.on('score:update', (_, data) => callback(data)),
  onCalibrationUpdated: (callback) => ipcRenderer.on('calibration:updated', (_, data) => callback(data)),
  notifyCalibration: (baseline) => ipcRenderer.invoke('calibration:updated', baseline),
  setLoginItem: (enabled) => ipcRenderer.invoke('app:setLoginItem', enabled),
  pauseDetection: () => ipcRenderer.invoke('detection:toggle'),
  onDetectionToggle: (callback) => ipcRenderer.on('detection:toggle', (_, isPaused) => callback(isPaused)),
  saveSession: (session) => ipcRenderer.invoke('session:save', session),
  onAppQuitting: (callback) => ipcRenderer.on('app:quitting', (_, data) => callback(data)),
  getSessions: () => ipcRenderer.invoke('session:getAll'),
  getXP: () => ipcRenderer.invoke('xp:get'),
  addXP: (amount) => ipcRenderer.invoke('xp:add', amount),
  validateLicense: (key) => ipcRenderer.invoke('license:validate', key),
  getLicense: () => ipcRenderer.invoke('store:get', 'licenseKey')
});
