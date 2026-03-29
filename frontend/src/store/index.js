import { create } from 'zustand'

const API = () => window.pyielink?.apiBase || 'http://localhost:4000'

export const useStore = create((set, get) => ({
  theme: localStorage.getItem('pyl-theme') || 'dark',
  modules: [],
  tasks: [],
  logs: [],
  activeView: 'dashboard',
  activeModule: null,
  ws: null,
  connected: false,

  setTheme: (t) => {
    localStorage.setItem('pyl-theme', t)
    document.documentElement.setAttribute('data-theme', t)
    set({ theme: t })
  },

  setView: (v, mod = null) => set({ activeView: v, activeModule: mod }),

  fetchModules: async () => {
    try {
      const r = await fetch(`${API()}/api/modules`)
      if (!r.ok) return
      set({ modules: await r.json() })
    } catch {}
  },

  fetchTasks: async () => {
    try {
      const r = await fetch(`${API()}/api/tasks`)
      if (!r.ok) return
      set({ tasks: await r.json() })
    } catch {}
  },

  fetchLogs: async () => {
    try {
      const r = await fetch(`${API()}/api/logs?limit=300`)
      if (!r.ok) return
      set({ logs: await r.json() })
    } catch {}
  },

  runTool: async (moduleId, toolId, payload) => {
    const r = await fetch(`${API()}/api/modules/${moduleId}/${toolId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Request failed')
    return data.taskId
  },

  pollTask: async (taskId) => {
    for (let i = 0; i < 120; i++) {
      await new Promise(res => setTimeout(res, 600))
      const r = await fetch(`${API()}/api/tasks/${taskId}`)
      if (!r.ok) continue
      const task = await r.json()
      if (task.status === 'done' || task.status === 'failed') return task
    }
    throw new Error('Task timed out after 60s')
  },

  connectWS: () => {
    try {
      const ws = new WebSocket(API().replace('http', 'ws'))
      ws.onopen  = () => set({ connected: true })
      ws.onclose = () => { set({ connected: false }); setTimeout(() => get().connectWS(), 4000) }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'log') set(s => ({ logs: [...s.logs.slice(-499), msg.entry] }))
        } catch {}
      }
      set({ ws })
    } catch { setTimeout(() => get().connectWS(), 4000) }
  },

  init: () => {
    const { theme, fetchModules, fetchTasks, fetchLogs, connectWS } = get()
    document.documentElement.setAttribute('data-theme', theme)
    fetchModules(); fetchTasks(); fetchLogs(); connectWS()
  }
}))
