import { Router } from 'express';
import { moduleRegistry, getModuleConfig } from '../modules/registry.js';
import { runPythonModule } from '../core/pythonBridge.js';
import { log } from '../core/logger.js';

export function buildModulesRouter() {
  const router = Router();

  router.get('/', (_req, res) => {
    const modules = Object.entries(moduleRegistry).map(([name, config]) => ({
      name,
      category: config.category,
    }));

    res.json({ modules });
  });

  router.post('/:moduleName/run', async (req, res) => {
    const { moduleName } = req.params;
    const moduleConfig = getModuleConfig(moduleName);

    if (!moduleConfig) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    try {
      const output = await runPythonModule(moduleConfig.scriptPath, req.body ?? {});
      log('info', 'module.executed', { moduleName });
      res.json({ module: moduleName, output });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log('error', 'module.failed', { moduleName, error: message });
      res.status(500).json({ error: message });
    }
  });

  return router;
}
