const { contextBridge, ipcRenderer } = require('electron');

// Esponi l'API per il renderer (pulsanti)
contextBridge.exposeInMainWorld('ipcRender', {
  send: (channel, data) => ipcRenderer.send(channel, data),
});
