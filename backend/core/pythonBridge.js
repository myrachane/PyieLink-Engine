const { spawn } = require('child_process')
const path = require('path')

const ROOT = path.join(__dirname, '../../')

// try python3 first, fall back to python
const PY_CMD = (() => {
  try { require('child_process').execSync('python3 --version', { stdio: 'ignore' }); return 'python3' } catch {}
  return 'python'
})()

function run(scriptPath, input, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const abs = path.resolve(ROOT, scriptPath)
    const py  = spawn(PY_CMD, [abs], { env: { ...process.env, PYTHONUNBUFFERED: '1' } })
    let out = '', err = ''

    const timer = setTimeout(() => { py.kill(); reject(new Error(`Timed out after ${timeoutMs}ms`)) }, timeoutMs)

    const payload = JSON.stringify(input)
    py.stdin.write(payload)
    py.stdin.end()

    py.stdout.on('data', d => { out += d.toString() })
    py.stderr.on('data', d => { err += d.toString() })

    py.on('close', code => {
      clearTimeout(timer)
      const trimmed = out.trim()
      if (code !== 0 && !trimmed) return reject(new Error(err.trim() || `Python exited ${code}`))
      try { resolve(JSON.parse(trimmed)) }
      catch { reject(new Error(`Bad JSON from script: ${trimmed.slice(0, 300)}\nstderr: ${err.slice(0,200)}`)) }
    })
    py.on('error', e => { clearTimeout(timer); reject(new Error(`Spawn failed: ${e.message} — is python3 installed?`)) })
  })
}

module.exports = { run }
