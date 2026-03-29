import React, { useEffect } from 'react'
import { useStore } from './store'
import Dashboard    from './components/Dashboard/Dashboard'
import ModuleRunner from './components/ModuleRunner/ModuleRunner'
import LogConsole   from './components/LogConsole/LogConsole'
import Settings     from './components/Settings/Settings'

const VIEWS = { dashboard: Dashboard, modules: ModuleRunner, logs: LogConsole, settings: Settings }

/* ─── SVG Logo ─────────────────────────────────────────────────────────────── */
const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="var(--accent)" opacity="0.12"/>
    <circle cx="14" cy="8"  r="2.5" fill="var(--accent)"/>
    <circle cx="7"  cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
    <circle cx="21" cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
    <line x1="14" y1="10.5" x2="14" y2="13" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.5"/>
    <line x1="12.5" y1="14.5" x2="8.5"  y2="18" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.4"/>
    <line x1="15.5" y1="14.5" x2="19.5" y2="18" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.4"/>
    <circle cx="14" cy="14" r="1.5" fill="var(--accent)" opacity="0.5"/>
  </svg>
)

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const I = {
  dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  modules:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  logs:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  settings:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  moon:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
}

const NAV = [
  { section: 'Main',   items: [{ id:'dashboard', label:'Dashboard' }, { id:'modules', label:'Module Runner' }] },
  { section: 'Tools',  items: [{ id:'logs', label:'Log Console' }] },
  { section: 'System', items: [{ id:'settings', label:'Settings' }] },
]

export default function App() {
  const { activeView, setView, init, theme, setTheme, tasks, logs, modules, connected } = useStore()
  const View    = VIEWS[activeView] || Dashboard
  const running = tasks.filter(t => t.status === 'running').length
  const errors  = logs.filter(l => l.level === 'error').length

  useEffect(() => { init() }, [])

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', background:'var(--bg-root)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--bg-border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Brand */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--bg-border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <Logo/>
            <div>
              <div className="brand-name">Pyie<span>Link</span></div>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace', marginTop:1, letterSpacing:'0.05em' }}>Engine v1.0</div>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {NAV.map(group => (
            <div key={group.section} style={{ marginBottom:6 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text-hint)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 10px 4px' }}>
                {group.section}
              </div>
              {group.items.map(item => {
                const active = activeView === item.id
                const badge  = (item.id==='modules' && running > 0) ? running
                             : (item.id==='logs'    && errors  > 0) ? errors : 0
                return (
                  <button key={item.id} onClick={() => setView(item.id)} style={{
                    display:'flex', alignItems:'center', gap:9, width:'100%',
                    padding:'8px 10px', borderRadius:8, marginBottom:1,
                    background: active ? 'var(--accent-subtle)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 400, fontSize:13,
                    textAlign:'left',
                  }}
                    onMouseEnter={e => { if(!active){ e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)' }}}
                    onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}}
                  >
                    <span style={{ opacity: active ? 1 : 0.65 }}>{I[item.id]}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {badge > 0 && (
                      <span style={{
                        minWidth:18, height:18, borderRadius:9, fontSize:10, fontWeight:700,
                        background: item.id==='logs' ? 'var(--red)' : 'var(--yellow)',
                        color: item.id==='logs' ? '#fff' : '#000',
                        display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px'
                      }}>{badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — theme toggle + status */}
        <div style={{ padding:'12px 12px', borderTop:'1px solid var(--bg-border)' }}>
          {/* Theme toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Theme</span>
            <button onClick={() => setTheme(theme==='dark' ? 'light' : 'dark')} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'5px 10px', borderRadius:7, fontSize:12,
              background:'var(--bg-hover)', color:'var(--text-secondary)',
              border:'1px solid var(--bg-border)'
            }}>
              {theme === 'dark' ? I.sun : I.moon}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Connection status */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background: connected ? 'var(--green)' : 'var(--red)', flexShrink:0 }}/>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>
              {connected ? `${modules.length} modules · :4000` : 'disconnected'}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <View />
      </main>
    </div>
  )
}
