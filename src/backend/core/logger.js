import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.resolve('src/backend/logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function log(level, event, meta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    meta,
  };

  fs.appendFileSync(LOG_FILE, `${JSON.stringify(payload)}\n`, 'utf8');
}
