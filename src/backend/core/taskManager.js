import { v4 as uuidv4 } from 'uuid';
import { log } from './logger.js';

export class TaskManager {
  constructor() {
    this.tasks = new Map();
  }

  list() {
    return [...this.tasks.values()];
  }

  get(taskId) {
    return this.tasks.get(taskId) ?? null;
  }

  async enqueue(executor, context = {}) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      context,
      result: null,
      error: null,
    };

    this.tasks.set(taskId, task);
    log('info', 'task.created', { taskId, context });

    queueMicrotask(async () => {
      task.status = 'running';
      task.updatedAt = new Date().toISOString();
      log('info', 'task.started', { taskId });

      try {
        const result = await executor();
        task.status = 'completed';
        task.result = result;
        task.updatedAt = new Date().toISOString();
        log('info', 'task.completed', { taskId });
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : String(error);
        task.updatedAt = new Date().toISOString();
        log('error', 'task.failed', { taskId, error: task.error });
      }
    });

    return task;
  }
}
