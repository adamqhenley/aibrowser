import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('aibrowser', {
  navigate: (url) => ipcRenderer.invoke('page:navigate', url),
  back: () => ipcRenderer.invoke('page:go-back'),
  forward: () => ipcRenderer.invoke('page:go-forward'),
  reload: () => ipcRenderer.invoke('page:reload'),
  snapshot: () => ipcRenderer.invoke('page:snapshot'),
  transform: (prompt) => ipcRenderer.invoke('page:transform', prompt),
  restore: () => ipcRenderer.invoke('page:restore'),
  configureProvider: (configuration) => ipcRenderer.invoke('provider:configure', configuration),
  onLocation: (listener) => ipcRenderer.on('page:location', (_event, value) => listener(value))
});
