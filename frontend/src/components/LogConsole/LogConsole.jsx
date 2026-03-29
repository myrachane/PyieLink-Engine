import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'

const L = {
  info:  { color:'var(--blue)',   bg:'var(--blue-subtle)',   label:'INFO' },
  warn:  { color:'var(--yellow)', bg:'var(--yellow-subtle)', label:'WARN' },
  error: { color:'var(--red)',    bg:'var(--red-subtle)',    label:'ERR ' },
  debug: { color:'var(--text-muted)', bg:'transparent',     label:'DBG ' },
}

export default function LogConsole() {
  const { logs, fetchLogs } = useStore()
  const [search,  setSearch]  = useState('')
  const [level,   setLevel]   = useState('all')
  const [paused,  setPaused]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { fetchLogs() }, [])
  useEffect(() => { if (!paused && bottomRef.current) bottomRef.current.scrollIntoView({ behavior:'smooth' }) }, [logs, paused])

  const filtered = logs.filter(l => {
    if (level !== 'all' && l.level !== level) return false
    if (search && !l.message?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const counts = logs.reduce((a,l) => { a[l.level] = (a[l.level]||0)+1; return a }, {})

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      {/* Topbar */}
      <div className="topbar" style={{ gap:8 }}>
        <span style={{ fontWeight:700, fontSize:15, marginRight:8 }}>Log Console</span>

        {['all','info','warn','error','debug'].map(l => {
          const meta = L[l], cnt = l==='all' ? logs.length : (counts[l]||0)
          return (
            <button key={l} onClick={() => setLevel(l)} style={{
              padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600,
              fontFamily:'Geist Mono,monospace', letterSpacing:'0.04em',
              background: level===l ? (l==='all' ? 'var(--bg-hover)' : meta?.bg) : 'transparent',
              color: level===l ? (l==='all' ? 'var(--text-primary)' : meta?.color) : 'var(--text-muted)',
              border:`1px solid ${level===l ? (l==='all' ? 'var(--bg-border-h)' : 'transparent') : 'transparent'}`,
            }}>
              {l==='all' ? 'All' : l.charAt(0).toUpperCase()+l.slice(1)}
              {cnt > 0 && <span style={{ marginLeft:5, opacity:0.7 }}>({cnt})</span>}
            </button>
          )
        })}

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width:180, marginLeft:6 }}/>

        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={() => setPaused(p => !p)} className={paused ? 'btn-primary' : 'btn-ghost'} style={{ padding:'5px 12px', fontSize:12 }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={fetchLogs} className="btn-ghost" style={{ padding:'5px 12px', fontSize:12 }}>Refresh</button>
        </div>
      </div>

      {/* Log list */}
      <div style={{ flex:1, overflowY:'auto', background:'var(--bg-root)', fontFamily:'Geist Mono,monospace', fontSize:12 }}>
        {filtered.length === 0 && (
          <div style={{ padding:'48px 24px', textAlign:'center', color:'var(--text-muted)' }}>
            {search ? `No logs match "${search}"` : 'No log entries yet'}
          </div>
        )}
        {filtered.map((log, i) => {
          const meta = L[log.level] || L.info
          const ts   = log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour12:false }) : '--:--:--'
          return (
            <div key={i} style={{ display:'flex', lineHeight:1.65, padding:'2px 0', cursor:'default' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-surface)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ color:'var(--text-muted)', padding:'0 14px', flexShrink:0, fontSize:11, userSelect:'none' }}>{ts}</span>
              <span style={{ color:meta.color, fontWeight:600, width:38, flexShrink:0, fontSize:11 }}>{meta.label}</span>
              <span style={{ color:'var(--text-secondary)', flex:1, paddingRight:16, wordBreak:'break-all' }}>
                {log.message}
                {log.taskId && <span style={{ color:'var(--text-muted)', marginLeft:8 }}>[{log.taskId.slice(0,8)}]</span>}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Status bar */}
      <div style={{ height:26, background:'var(--bg-base)', borderTop:'1px solid var(--bg-border)', display:'flex', alignItems:'center', padding:'0 16px', gap:20, fontSize:11, fontFamily:'Geist Mono,monospace', color:'var(--text-muted)', flexShrink:0 }}>
        <span><span style={{ color: paused ? 'var(--yellow)' : 'var(--green)' }}>●</span> {paused ? 'paused' : 'live'}</span>
        <span>{filtered.length}/{logs.length} entries</span>
        {counts.error > 0 && <span style={{ color:'var(--red)' }}>✕ {counts.error} errors</span>}
        {counts.warn  > 0 && <span style={{ color:'var(--yellow)' }}>⚠ {counts.warn} warnings</span>}
      </div>
    </div>
  )
}
