const { app } = require('electron');
const path = require('path');
const url = 'https://web.messanger.bpup.israiken.it';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    titleBarStyle: 'hiddenInset',
    frame: false,
    title: 'BPUP Messenger',
    icon: path.join(__dirname, 'images', 'bpup_logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload file per sicurezza
      nodeIntegration: false,
      contextIsolation: true, // Abilita contextIsolation per sicurezza
    },
  });

  // Carica la pagina web esterna
  mainWindow.loadURL(url);

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      body { margin: 0; overflow: hidden; }
      .custom-titlebar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 30px;
        background: #354966;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        font-family: 'Arial', sans-serif;
        -webkit-app-region: drag; /* Rende la barra trascinabile */
      }
      .custom-titlebar .title {
        flex-grow: 1;
        text-align: left;
        font-family: 'Oswald', serif; /* Cambia il font del testo a sinistra */
      }
      .custom-titlebar button {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px 10px;
        -webkit-app-region: no-drag; /* Esclude i pulsanti dalla regione trascinabile */
      }
      .custom-titlebar button:hover { background: rgba(255, 255, 255, 0.2); }
      .content {
        margin-top: 30px; /* Aggiunge un margine superiore per evitare la sovrapposizione */
      }
    `);

    // Aggiungi la barra personalizzata e i pulsanti tramite JavaScript
    mainWindow.webContents.executeJavaScript(`
      const titlebar = document.createElement('div');
      titlebar.classList.add('custom-titlebar');
      titlebar.innerHTML = '<span class="title">BPUP Messenger</span>' +
                           '<div>' +
                           '<button id="minimize-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h12v2H6z"/></svg></button>' +
                           '<button id="maximize-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14h18V5H3zm16 12H5V7h14v10z"/></svg></button>' +
                           '<button id="close-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 18L18 6M6 6l12 12"/></svg></button>' +
                           '</div>';
      document.body.prepend(titlebar); // Prepend la barra al body della pagina
      document.body.classList.add('content');
    `);

    // Aggiungi gli event listeners per i pulsanti
    mainWindow.webContents.executeJavaScript(`
      const { ipcRenderer } = require('electron');

      // Aggiungi gli event listener per i pulsanti
      document.getElementById('minimize-btn').addEventListener('click', () => {
        ipcRenderer.send('window-minimize');
      });

      document.getElementById('maximize-btn').addEventListener('click', () => {
        ipcRenderer.send('window-maximize');
      });

      document.getElementById('close-btn').addEventListener('click', () => {
        ipcRenderer.send('window-close');
      });
    `);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gestisci le richieste per i pulsanti tramite ipcMain
const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('window-minimize', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  currentWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  currentWindow.close();
});