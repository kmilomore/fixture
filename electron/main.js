const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let nextProcess;
const PORT = 3422; // Puerto fijo para la app de escritorio

function waitForServer(url, retries = 30, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve();
        else if (n > 0) setTimeout(() => attempt(n - 1), delay);
        else reject(new Error('Server not ready'));
      }).on('error', () => {
        if (n > 0) setTimeout(() => attempt(n - 1), delay);
        else reject(new Error('Server not ready'));
      });
    };
    attempt(retries);
  });
}

function startNextServer() {
  const isPackaged = app.isPackaged;
  
  // En producción, Next.js será buildado y se sirve con `next start`
  const serverScript = isPackaged
    ? path.join(process.resourcesPath, 'app', 'node_modules', '.bin', 'next')
    : path.join(__dirname, 'node_modules', '.bin', 'next');

  const appDir = isPackaged
    ? path.join(process.resourcesPath, 'app')
    : __dirname;

  const cmd = process.platform === 'win32' ? `${serverScript}.cmd` : serverScript;

  nextProcess = spawn(cmd, ['start', '--port', PORT], {
    cwd: appDir,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DATABASE_URL: `file:${path.join(app.getPath('userData'), 'fixture.db')}`,
      PORT: PORT.toString(),
    },
    shell: true,
  });

  nextProcess.stdout.on('data', (data) => console.log('[Next]', data.toString()));
  nextProcess.stderr.on('data', (data) => console.error('[Next Error]', data.toString()));

  return waitForServer(`http://127.0.0.1:${PORT}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Fixture Pro',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Icono (se agrega más adelante)
    // icon: path.join(__dirname, 'public', 'icon.png'),
    backgroundColor: '#f8fafc',
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  // Abrir links externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Quitar menú nativo en producción
  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  try {
    // Mostrar splash o ventana de carga
    mainWindow = new BrowserWindow({
      width: 400,
      height: 250,
      frame: false,
      resizable: false,
      backgroundColor: '#0f172a',
      webPreferences: { nodeIntegration: false },
    });
    mainWindow.loadURL(`data:text/html,
      <html>
        <body style="margin:0;background:#0f172a;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
          <div style="font-size:48px;margin-bottom:16px">🏆</div>
          <h1 style="margin:0;font-size:24px;font-weight:700">Fixture Pro</h1>
          <p style="color:#94a3b8;margin-top:8px;font-size:14px">Iniciando sistema...</p>
        </body>
      </html>
    `);

    await startNextServer();

    mainWindow.close();
    createWindow();

  } catch (err) {
    console.error('Error iniciando servidor:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (nextProcess) nextProcess.kill();
});
