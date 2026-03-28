import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { TaskManager } from './core/taskManager.js';
import { WsHub } from './core/wsHub.js';
import { buildModulesRouter } from './routes/modules.js';
import { buildTasksRouter } from './routes/tasks.js';
import { log } from './core/logger.js';

export function createBackendServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  const taskManager = new TaskManager();
  const wsHub = new WsHub();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'PyieLink Engine' });
  });

  app.use('/api/modules', buildModulesRouter());
  app.use('/api/tasks', buildTasksRouter(taskManager, wsHub));

  wss.on('connection', (ws) => {
    wsHub.register(ws);
    ws.send(JSON.stringify({ type: 'session.ready' }));
  });

  return {
    listen(port = 4200) {
      return new Promise((resolve) => {
        server.listen(port, () => {
          log('info', 'backend.started', { port });
          resolve({ app, server, wss, taskManager, wsHub });
        });
      });
    },
  };
}

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const port = Number(process.env.PORT || 4200);
  const backend = createBackendServer();
  backend.listen(port);
}
