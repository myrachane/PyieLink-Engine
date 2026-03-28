import { Router } from 'express';
import { getModuleConfig } from '../modules/registry.js';
import { runPythonModule } from '../core/pythonBridge.js';

export function buildTasksRouter(taskManager, wsHub) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ tasks: taskManager.list() });
  });

  router.get('/:taskId', (req, res) => {
    const task = taskManager.get(req.params.taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  });

  router.post('/', async (req, res) => {
    const { moduleName, input } = req.body ?? {};

    if (!moduleName) {
      res.status(400).json({ error: 'moduleName is required' });
      return;
    }

    const moduleConfig = getModuleConfig(moduleName);
    if (!moduleConfig) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    const task = await taskManager.enqueue(
      async () => {
        const result = await runPythonModule(moduleConfig.scriptPath, input ?? {});
        wsHub.broadcast({ type: 'task.update', payload: { taskId: task.id, status: 'completed', result } });
        return result;
      },
      { moduleName }
    );

    wsHub.broadcast({ type: 'task.update', payload: { taskId: task.id, status: task.status } });
    res.status(202).json(task);
  });

  return router;
}
