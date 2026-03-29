const router = require('express').Router()
const taskManager = require('../../core/taskManager')

router.get('/', (req, res) => res.json(taskManager.getAll()))
router.get('/:id', (req, res) => {
  const task = taskManager.get(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})
router.delete('/:id', (req, res) => {
  taskManager.remove(req.params.id)
  res.json({ ok: true })
})

module.exports = router
