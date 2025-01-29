const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = 'https://web.messanger.bpup.israiken.it';

let mainWindow;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    frame: false,
    resizable: true,
    title: 'BPUP Messenger',
    icon: path.join(__dirname, 'images', 'bpup_logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Sicurezza abilitata
      contextIsolation: true, // Abilita  per sicurezza
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
      .custom-titlebar > div {
        display: flex;
        align-items: center;
        justify-content: end;
        width: auto;
      }
      .custom-titlebar .title {
        flex-grow: 1;
        text-align: left;
        font-family: 'Courier',monospace; /* Cambia il font del testo a sinistra */
      }
      .custom-titlebar button {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px 10px; /* Uniforma il padding su tutti i pulsanti */
        -webkit-app-region: no-drag; /* Esclude i pulsanti dalla regione trascinabile */
        width: 40px; /* Imposta una larghezza fissa per tutti i pulsanti */
        height: 30px; /* Imposta un'altezza fissa */
        display: flex;
        justify-content: center;
        align-items: center;
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
                           '<button id="minimize"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h12v2H6z"/></svg></button>' +
                           '<button id="maximize"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14h18V5H3zm16 12H5V7h14v10z"/></svg></button>' +
                           '<button id="close"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="6 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="arcs"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
                           '</div>';
      document.body.prepend(titlebar); // Prepend la barra al body della pagina
      document.body.classList.add('content');
  `);

    // Aggiungi gli event listeners ai pulsanti tramite IPC
    mainWindow.webContents.executeJavaScript(`
      document.getElementById('minimize').addEventListener('click', () => {
        window.ipcRender.send('window:minimize');
      });

      document.getElementById('maximize').addEventListener('click', () => {
        window.ipcRender.send('window:maximize');
      });

      document.getElementById('close').addEventListener('click', () => {
        window.ipcRender.send('window:close');
      });
    `);

  });
  
  // Gestione eventi IPC
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize(); // Riduci a icona la finestra
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      // Se la finestra è massimizzata, riducila
      mainWindow.restore();
    } else {
      // Se la finestra non è massimizzata, massimizzala
      mainWindow.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow.close(); // Chiudi la finestra
  });

}
app.whenReady().then(createWindow);