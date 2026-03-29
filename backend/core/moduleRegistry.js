const fs   = require('fs')
const path = require('path')

const MODULES_DIR = path.join(__dirname, '../modules')
const registry    = new Map()

function loadModules() {
  const dirs = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name)

  for (const dir of dirs) {
    try {
      const modPath = path.join(MODULES_DIR, dir, 'index.js')
      delete require.cache[require.resolve(modPath)]        // allow hot reload
      const mod = require(modPath)
      registry.set(mod.id, mod)
      console.log(`[registry] ✓ ${mod.id} (${mod.tools.length} tools)`)
    } catch (e) {
      console.error(`[registry] ✗ ${dir}:`, e.message)
    }
  }
  console.log(`[registry] ${registry.size} modules loaded`)
}

function getAll()            { return [...registry.values()] }
function getTool(mId, tId)   { return registry.get(mId)?.tools.find(t => t.id === tId) || null }

function validate(tool, body) {
  for (const [key, rule] of Object.entries(tool.schema || {})) {
    const val = body[key]
    if (rule.required && (val === undefined || val === null || val === '')) {
      return { ok: false, error: `Missing required field: "${key}" (${rule.label || key})` }
    }
  }
  return { ok: true }
}

module.exports = { loadModules, getAll, getTool, validate }
