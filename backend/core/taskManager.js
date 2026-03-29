const { v4: uuidv4 } = require('uuid')

const tasks = new Map()
const MAX_TASKS = 500

function create({ moduleId, toolId }) {
  const task = {
    id: uuidv4(),
    moduleId,
    toolId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    result: null,
    error: null
  }
  tasks.set(task.id, task)
  if (tasks.size > MAX_TASKS) {
    const oldest = [...tasks.keys()][0]
    tasks.delete(oldest)
  }
  return task
}

function get(id) { return tasks.get(id) || null }
function getAll() { return [...tasks.values()].reverse() }
function remove(id) { tasks.delete(id) }

function setRunning(id) {
  const t = tasks.get(id)
  if (t) { t.status = 'running'; t.startedAt = new Date().toISOString() }
}

function setDone(id, result) {
  const t = tasks.get(id)
  if (t) { t.status = 'done'; t.result = result; t.finishedAt = new Date().toISOString() }
}

function setFailed(id, error) {
  const t = tasks.get(id)
  if (t) { t.status = 'failed'; t.error = error; t.finishedAt = new Date().toISOString() }
}

module.exports = { create, get, getAll, remove, setRunning, setDone, setFailed }
