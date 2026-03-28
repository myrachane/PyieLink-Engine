import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4200/api';

export function App() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('port_scanner');
  const [target, setTarget] = useState('127.0.0.1');
  const [task, setTask] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/modules`)
      .then((res) => res.json())
      .then((data) => {
        setModules(data.modules || []);
        if (data.modules?.length && !selectedModule) {
          setSelectedModule(data.modules[0].name);
        }
      });
  }, [selectedModule]);

  async function runTask() {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleName: selectedModule, input: { target } }),
    });

    const createdTask = await res.json();
    setTask(createdTask);

    const interval = setInterval(async () => {
      const stateRes = await fetch(`${API_BASE}/tasks/${createdTask.id}`);
      const state = await stateRes.json();
      setTask(state);

      if (state.status === 'completed' || state.status === 'failed') {
        clearInterval(interval);
      }
    }, 500);
  }

  return (
    <main className="layout">
      <h1>PyieLink Engine</h1>
      <p>Electron desktop shell, Node.js control layer, Python execution modules.</p>

      <section className="panel">
        <label htmlFor="module">Module</label>
        <select id="module" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
          {modules.map((module) => (
            <option key={module.name} value={module.name}>
              {module.category} :: {module.name}
            </option>
          ))}
        </select>

        <label htmlFor="target">Target</label>
        <input id="target" value={target} onChange={(e) => setTarget(e.target.value)} />

        <button type="button" onClick={runTask}>
          Run Task
        </button>
      </section>

      {task && (
        <section className="panel">
          <h2>Task status</h2>
          <pre>{JSON.stringify(task, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
