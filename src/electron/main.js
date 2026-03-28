import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import { createBackendServer } from '../backend/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendHandle;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const uiDist = path.resolve(__dirname, '../ui/dist/index.html');
  await win.loadFile(uiDist);
}

app.whenReady().then(async () => {
  const backend = createBackendServer();
  backendHandle = await backend.listen(Number(process.env.PORT || 4200));
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  backendHandle?.server?.close();
  backendHandle?.wss?.close();
});
