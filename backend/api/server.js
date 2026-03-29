const express = require('express')
const { WebSocketServer } = require('ws')
const http = require('http')
const logger = require('../core/logger')

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const clients = new Set()
wss.on('connection', ws => {
  clients.add(ws)
  ws.on('close', () => clients.delete(ws))
})

function broadcast(data) {
  const msg = JSON.stringify(data)
  clients.forEach(c => { if (c.readyState === 1) c.send(msg) })
}

app.use('/api/modules', require('./routes/modules'))
app.use('/api/tasks',   require('./routes/tasks'))
app.use('/api/logs',    require('./routes/logs'))

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

logger.onLog(entry => broadcast({ type: 'log', entry }))

module.exports = server
