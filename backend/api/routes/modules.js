const router      = require('express').Router()
const registry    = require('../../core/moduleRegistry')
const taskManager = require('../../core/taskManager')
const bridge      = require('../../core/pythonBridge')
const logger      = require('../../core/logger')

router.get('/', (req, res) => res.json(registry.getAll()))

router.post('/:moduleId/:toolId', async (req, res) => {
  const { moduleId, toolId } = req.params
  const tool = registry.getTool(moduleId, toolId)
  if (!tool) return res.status(404).json({ error: `Tool "${moduleId}/${toolId}" not found` })

  // Coerce + apply defaults before validation
  const payload = {}
  for (const [key, rule] of Object.entries(tool.schema || {})) {
    let val = req.body[key]
    if (val === undefined || val === null || val === '') {
      if (rule.default !== undefined) val = rule.default
      else if (!rule.required) continue
    }
    if (rule.type === 'number') val = Number(val)
    if (rule.type === 'boolean') val = val === true || val === 'true'
    payload[key] = val
  }

  const v = registry.validate(tool, payload)
  if (!v.ok) return res.status(400).json({ error: v.error })

  const task = taskManager.create({ moduleId, toolId, payload })
  res.json({ taskId: task.id })

  ;(async () => {
    try {
      taskManager.setRunning(task.id)
      logger.info(`▶ ${moduleId}/${toolId}`, { taskId: task.id })
      const result = await bridge.run(tool.script, payload)
      taskManager.setDone(task.id, result)
      logger.info(`✓ ${moduleId}/${toolId}`, { taskId: task.id })
    } catch (err) {
      taskManager.setFailed(task.id, err.message)
      logger.error(`✗ ${moduleId}/${toolId}: ${err.message}`, { taskId: task.id })
    }
  })()
})

module.exports = router
