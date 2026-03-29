const router = require('express').Router()
const logger = require('../../core/logger')

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 100
  res.json(logger.recent(limit))
})

module.exports = router
