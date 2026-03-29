const listeners = []
const buffer = []
const MAX = 1000

function emit(level, message, meta = {}) {
  const entry = { level, message, ...meta, timestamp: new Date().toISOString() }
  buffer.push(entry)
  if (buffer.length > MAX) buffer.shift()
  listeners.forEach(fn => fn(entry))
}

const info  = (msg, meta) => emit('info',  msg, meta)
const warn  = (msg, meta) => emit('warn',  msg, meta)
const error = (msg, meta) => emit('error', msg, meta)
const debug = (msg, meta) => emit('debug', msg, meta)

function onLog(fn) { listeners.push(fn) }
function recent(n = 100) { return buffer.slice(-n) }

module.exports = { info, warn, error, debug, onLog, recent }
