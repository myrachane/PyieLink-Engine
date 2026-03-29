import React, { useState } from 'react'
import { useStore } from '../../store'

const MOD_COLOR = { network:'#6366f1', web:'#22c55e', packet:'#f97316', intelligence:'#ec4899', crypto:'#8b5cf6', vulnerability:'#ef4444', ptp:'#3b82f6' }

export default function Settings() {
  const { modules, fetchModules, theme, setTheme, connected } = useStore()
  const [busy, setBusy] = useState(false)
  const toolCount = modules.reduce((a,m) => a+(m.tools?.length||0), 0)

  const reload = async () => { setBusy(true); await fetchModules(); setTimeout(() => setBusy(false), 600) }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Left nav */}
      <div style={{ width:200, flexShrink:0, background:'var(--bg-base)', borderRight:'1px solid var(--bg-border)', padding:'14px 0' }}>
        <div style={{ padding:'0 14px 12px', borderBottom:'1px solid var(--bg-border)', marginBottom:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Settings</div>
        </div>
        {['General','Modules','About'].map((s,i) => (
          <div key={s} style={{
            padding:'8px 16px', fontSize:13, cursor:'pointer',
            color: i===0 ? 'var(--accent)' : 'var(--text-secondary)',
            background: i===0 ? 'var(--accent-subtle)' : 'transparent',
            borderLeft: i===0 ? '2px solid var(--accent)' : '2px solid transparent',
            fontWeight: i===0 ? 600 : 400,
          }}
            onMouseEnter={e => { if(i!==0){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text-primary)'} }}
            onMouseLeave={e => { if(i!==0){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-secondary)'} }}
          >{s}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'28px 36px', background:'var(--bg-root)' }}>
        <div style={{ maxWidth:600 }}>

          <Section label="Appearance">
            <Row label="Theme" desc="Toggle between dark and light interface">
              <div style={{ display:'flex', gap:6 }}>
                {['dark','light'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{
                    padding:'7px 16px', borderRadius:7, fontSize:13, fontWeight:500,
                    background: theme===t ? 'var(--accent)' : 'var(--bg-hover)',
                    color: theme===t ? '#fff' : 'var(--text-secondary)',
                    border:`1px solid ${theme===t ? 'var(--accent)' : 'var(--bg-border)'}`,
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </Row>
          </Section>

          <Section label="System">
            {[
              { label:'API endpoint', desc:'Express backend address', val:'http://localhost:4000', live:true },
              { label:'WebSocket',    desc:'Real-time log stream',    val:'ws://localhost:4000', live:connected },
              { label:'Python',       desc:'Script interpreter',       val:'python3' },
              { label:'Electron',     desc:'Desktop shell',            val:'v27+' },
            ].map(r => (
              <Row key={r.label} label={r.label} desc={r.desc}>
                <div style={{
                  padding:'5px 12px', borderRadius:6, fontSize:12, fontFamily:'Geist Mono,monospace',
                  background: r.live ? 'var(--green-subtle)' : 'var(--bg-surface)',
                  border:`1px solid ${r.live ? 'rgba(34,197,94,0.2)' : 'var(--bg-border)'}`,
                  color: r.live ? 'var(--green)' : 'var(--text-secondary)',
                  display:'flex', alignItems:'center', gap:7
                }}>
                  {r.live !== undefined && <div style={{ width:6, height:6, borderRadius:'50%', background: r.live?'var(--green)':'var(--red)', animation: r.live?'pulse 2s ease infinite':undefined }}/>}
                  {r.val}
                </div>
              </Row>
            ))}
          </Section>

          <Section label="Modules" action={
            <button onClick={reload} className="btn-ghost" style={{ padding:'4px 12px', fontSize:11, display:'flex', alignItems:'center', gap:5 }}>
              {busy && <div style={{ width:10, height:10, borderRadius:'50%', border:'1.5px solid transparent', borderTopColor:'var(--accent)', animation:'spin 0.6s linear infinite' }}/>}
              {busy ? 'Reloading…' : 'Reload'}
            </button>
          }>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {modules.map(mod => (
                <div key={mod.id} style={{ padding:'12px 14px', borderRadius:8, background:'var(--bg-surface)', border:'1px solid var(--bg-border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: MOD_COLOR[mod.id]||'var(--accent)', flexShrink:0 }}/>
                    <span style={{ fontWeight:600, fontSize:13 }}>{mod.name}</span>
                  </div>
                  <div style={{ fontSize:10.5, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace', marginTop:2 }}>{mod.id}</div>
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:5 }}>{mod.tools?.length} tools</div>
                </div>
              ))}
            </div>
          </Section>

          <Section label="About">
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)', borderRadius:10, padding:'20px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <div style={{ width:44, height:44, borderRadius:11, background:'var(--accent-subtle)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="8" r="2.5" fill="var(--accent)"/>
                    <circle cx="7" cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
                    <circle cx="21" cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
                    <line x1="14" y1="10.5" x2="14" y2="13" stroke="var(--accent)" strokeWidth="1.2"/>
                    <line x1="12.5" y1="14.5" x2="8.5" y2="18" stroke="var(--accent)" strokeWidth="1.2"/>
                    <line x1="15.5" y1="14.5" x2="19.5" y2="18" stroke="var(--accent)" strokeWidth="1.2"/>
                    <circle cx="14" cy="14" r="1.5" fill="var(--accent)" opacity="0.5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>PyieLink Engine</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace', marginTop:2 }}>v1.0.0 · {modules.length} modules · {toolCount} tools</div>
                </div>
              </div>
              {[
                ['Stack',        'Node.js · React · Electron · Python'],
                ['Architecture', 'Control layer (Node) → Execution layer (Python)'],
                ['Protocol',     'PyieLink Transfer Protocol (PTP)'],
                ['Crypto',       'AES-256-GCM · SHA-256 · BLAKE2'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:16, padding:'8px 0', borderTop:'1px solid var(--bg-border)', fontSize:13 }}>
                  <span style={{ color:'var(--text-muted)', fontFamily:'Geist Mono,monospace', fontSize:12, width:110, flexShrink:0 }}>{k}</span>
                  <span style={{ color:'var(--text-secondary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ label, children, action }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'Geist Mono,monospace', whiteSpace:'nowrap' }}>{label}</span>
        <div style={{ flex:1, height:1, background:'var(--bg-border)' }}/>
        {action}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>{children}</div>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--bg-border)', gap:16 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:500 }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )
}
