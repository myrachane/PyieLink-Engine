# PyieLink Engine

A minimal, scalable desktop security engine with:

- **Electron** desktop runtime
- **React UI** (display + controls only)
- **Node.js backend** as the single control layer
- **Python modules** as stateless execution workers (stdin JSON in, stdout JSON out)

## Architecture

```text
React UI (src/ui)
   |
   | HTTP / WS
   v
Node Control Layer (src/backend)
   - module registry
   - REST API
   - optional WebSocket updates
   - async task manager
   - JSONL logger
   |
   | child_process + stdin/stdout JSON
   v
Python Execution Layer (src/python)
   - one script per module
   - stateless execution only
```

## Core backend capabilities

- **Dynamic module system** via module registry (`src/backend/modules/registry.js`)
- **REST API**:
  - `GET /api/health`
  - `GET /api/modules`
  - `POST /api/modules/:moduleName/run`
  - `GET /api/tasks`
  - `GET /api/tasks/:taskId`
  - `POST /api/tasks`
- **WebSocket** endpoint at `/ws` for task updates
- **Async task manager** with status tracking (`queued`, `running`, `completed`, `failed`)
- **Logging system** writing JSON lines to `src/backend/logs/app.log`

## Modules included

- **Network**: `port_scanner`, `banner_grabber`, `dns_enum`
- **Web**: `http_scanner`, `dir_bruteforce`, `cors_checker`
- **Packet**: `packet_sniffer`, `packet_crafter`
- **Intelligence**: `whois_lookup`, `ip_info`
- **Crypto**: `aes_encryptor`, `hashing_tool`
- **Vulnerability**: `header_analyzer`, `port_risk_analyzer`
- **Custom**: `chunk_protocol`

## PTP `chunk_protocol` flow

`chunk -> AES encrypt(simulated) -> randomize -> send/simulate -> reassemble -> verify`

The `chunk_protocol` script demonstrates the full pipeline and returns hash verification status in JSON.

## Run

```bash
npm install
npm run build:ui
npm start
```

During local backend-only development:

```bash
npm run backend
```

For UI development:

```bash
npm run ui
```

## Python execution contract

Each Python module must:

1. Read JSON input from `stdin`
2. Emit JSON output to `stdout`
3. Avoid non-JSON logs/prints
4. Stay stateless
