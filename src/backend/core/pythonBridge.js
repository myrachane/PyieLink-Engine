import { spawn } from 'node:child_process';

export async function runPythonModule(scriptPath, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', reject);

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed (${code}): ${stderr || 'no error output'}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch {
        reject(new Error('Python script produced invalid JSON output'));
      }
    });

    proc.stdin.write(JSON.stringify(input ?? {}));
    proc.stdin.end();
  });
}
