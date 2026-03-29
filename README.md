# PyieLink Engine

(In Development)
will add more scripts and more functions it this basic 
(used Ai For Frontend 🙂 so dont hope much)
Modular networking & security framework with an Electron desktop app.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.9+ | https://python.org |
| pip | latest | bundled with Python |

---

## Quick start (3 steps)

### 1 — Install Python dependencies

```bash
pip install cryptography
```

> The `cryptography` package powers AES-GCM in the crypto and PTP modules.
> All other Python scripts use only the standard library.

### 2 — Install Node.js dependencies

```bash
# Root (Electron + backend)
npm install

# Frontend (React + Vite)
cd frontend && npm install && cd ..
```

### 3 — Run in development mode

```bash
npm run dev
```

This starts three processes concurrently:
- **Backend** — Express API on `http://localhost:4000`
- **Frontend** — Vite dev server on `http://localhost:5173`
- **Electron** — Desktop shell (waits for Vite to be ready)

---

## Project structure

```
pyielink-engine/
├── electron/           Electron main + preload
├── frontend/           React UI (Vite)
│   └── src/
│       ├── components/ Dashboard, ModuleRunner, LogConsole, Settings
│       ├── store/      Zustand global state
│       └── themes/     CSS variables (dark/light)
├── backend/            Node.js control layer
│   ├── api/            Express server + routes
│   ├── core/           pythonBridge, moduleRegistry, taskManager, logger
│   └── modules/        Module manifests (one folder per module)
├── scripts/            Python execution layer (stateless)
│   ├── network/        port_scanner, banner_grabber, dns_enum
│   ├── web/            http_scanner, dir_bruteforce, cors_checker
│   ├── packet/         packet_sniffer, packet_crafter
│   ├── intelligence/   whois_lookup, ip_info
│   ├── crypto/         aes_encryptor, hashing_tool
│   ├── vulnerability/  header_analyzer, port_risk_analyzer
│   └── ptp/            chunk_protocol (PyieLink Transfer Protocol)
└── config/             Module config (future use)
```

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/modules` | All modules + tool schemas |
| POST | `/api/modules/:moduleId/:toolId` | Run a tool → returns `{ taskId }` |
| GET | `/api/tasks` | All tasks (newest first) |
| GET | `/api/tasks/:id` | Single task status + result |
| DELETE | `/api/tasks/:id` | Remove a task |
| GET | `/api/logs?limit=100` | Recent log entries |
| WS | `ws://localhost:4000` | Live log + task stream |

### Running a tool via curl

```bash
curl -X POST http://localhost:4000/api/modules/network/port_scanner \
  -H 'Content-Type: application/json' \
  -d '{"target":"scanme.nmap.org","ports":"1-1024","timeout":2}'

# Returns: { "taskId": "uuid" }

# Poll result:
curl http://localhost:4000/api/tasks/<taskId>
```

---

## Adding a custom module

1. Create `backend/modules/your_module/index.js` with this shape:

```js
module.exports = {
  id: 'your_module',
  name: 'Your Module',
  tools: [
    {
      id: 'your_tool',
      name: 'Your Tool',
      script: 'scripts/your_module/your_tool.py',
      schema: {
        target: { type: 'string', required: true, label: 'Target' }
      }
    }
  ]
}
```

2. Create `scripts/your_module/your_tool.py`:

```python
import sys, json

def run(data):
    # data is the validated JSON input
    return { 'status': 'ok', 'result': 'your output' }

if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    print(json.dumps(run(data)))
```

3. Restart the backend. The module auto-loads — no other changes needed.

**Python script rules (never break these):**
- Read input from `sys.stdin` only
- Write output to `stdout` as a single JSON object
- Never use `print()` for anything except the final result
- No persistent state — every call is stateless
- Return `{ "status": "error", "error": "..." }` on failure

---

## PyieLink Transfer Protocol (PTP)

The `ptp/chunk_protocol` tool implements a custom file transfer protocol:

| Action | Input | Output |
|--------|-------|--------|
| `chunk` | `data_b64`, `key_hex`, `chunk_size`, `randomize` | `chunks[]`, `original_hash` |
| `reassemble` | `chunks[]`, `key_hex`, `original_hash` | `data_b64`, `verified` |
| `simulate` | `data_b64`, `chunk_size` | delivery stats + per-packet log |

Flow: **chunk → encrypt (AES-GCM) → shuffle + inject dummies → send → strip dummies → sort → decrypt → reassemble → verify SHA-256**

---

## Build desktop app

```bash
npm run build
```

Output goes to `dist/`. Electron Builder produces:
- macOS: `.dmg`
- Windows: `.exe` (NSIS installer)
- Linux: `.AppImage`

---

## Notes

- **Packet sniffer / crafter** require root/admin privileges (raw sockets)
- **AES encryptor** and **PTP** require `pip install cryptography`
- `ip_info` uses the free `ip-api.com` endpoint (no key needed, rate-limited)
- All other scripts use Python stdlib only
