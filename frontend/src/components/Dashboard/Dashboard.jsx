import React, { useEffect, useMemo } from 'react'
import { useStore } from '../../store'

/* ── Mini bar sparkline ──────────────────────────────────────────────────── */
function Spark({ data = [], color, h = 36, w = 72 }) {
  const max = Math.max(...data, 1)
  const bw  = w / data.length - 1.5
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink:0 }}>
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * h)
        return <rect key={i} x={i*(w/data.length)} y={h-bh} width={Math.max(2,bw)} height={bh} fill={color} opacity={0.12 + (i/data.length)*0.75} rx="2"/>
      })}
    </svg>
  )
}

/* ── Area chart ─────────────────────────────────────────────────────────── */
function AreaChart({ data = [], color = 'var(--accent)' }) {
  const W = 500, H = 100
  if (data.length < 2) return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <text x={W/2} y={H/2+5} textAnchor="middle" fill="var(--text-hint)" fontSize="12" fontFamily="Geist Mono,monospace">No task data yet</text>
    </svg>
  )
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [
    (i / (data.length-1)) * W,
    H - 8 - ((v/max) * (H-18))
  ])
  const line = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#ag)"/>
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.length > 0 && <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3.5" fill={color}/>}
    </svg>
  )
}

/* ── Donut ───────────────────────────────────────────────────────────────── */
function Donut({ slices = [], size = 88 }) {
  const total = slices.reduce((a,s) => a+s.value, 0) || 1
  const r = 36, cx = 46, cy = 46, sw = 9
  let angle = -90
  const arcs = slices.map(s => {
    const pct = s.value / total
    const a1  = (angle * Math.PI) / 180
    const a2  = ((angle + pct * 360) * Math.PI) / 180
    const x1  = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1)
    const x2  = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2)
    const d   = `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${pct>.5?1:0},1 ${x2.toFixed(2)},${y2.toFixed(2)}`
    angle += pct * 360
    return { ...s, d }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 92 92">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-hover)" strokeWidth={sw}/>
      {arcs.map((a, i) => <path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round"/>)}
    </svg>
  )
}

const STATUS_DOT = { done:'var(--green)', failed:'var(--red)', running:'var(--yellow)', pending:'var(--text-muted)' }
const MOD_COLORS = ['#6366f1','#22c55e','#3b82f6','#f97316','#ec4899','#eab308','#14b8a6']

export default function Dashboard() {
  const { modules, tasks, logs, fetchTasks, setView } = useStore()

  useEffect(() => { fetchTasks(); const t = setInterval(fetchTasks, 5000); return () => clearInterval(t) }, [])

  const done    = tasks.filter(t => t.status === 'done').length
  const failed  = tasks.filter(t => t.status === 'failed').length
  const running = tasks.filter(t => t.status === 'running').length
  const toolCount = modules.reduce((a,m) => a+(m.tools?.length||0), 0)

  const activityData = useMemo(() => {
    const b = Array(12).fill(0); const now = Date.now()
    tasks.forEach(t => { const age = (now - new Date(t.createdAt)) / 3600000; const i = Math.floor(Math.min(age, 11.99)); if (i>=0 && i<12) b[11-i]++ })
    return b
  }, [tasks])

  const donutData = useMemo(() =>
    modules.slice(0,7).map((m, i) => ({ label: m.name, value: m.tools?.length||1, color: MOD_COLORS[i%MOD_COLORS.length] }))
  , [modules])

  const recentTasks = tasks.slice(0, 10)

  const STATS = [
    { key:'modules',   label:'Modules',   value: modules.length, sub:`${toolCount} tools available`,  color:'var(--accent)',  spark:[2,3,4,3,5,4,modules.length] },
    { key:'done',      label:'Completed', value: done,           sub:'tasks succeeded',                color:'var(--green)',   spark:[0,1,1,2,2,3,done] },
    { key:'running',   label:'Running',   value: running,        sub:'active right now',               color:'var(--yellow)',  spark:[0,0,1,0,1,1,running], pulse: running>0 },
    { key:'errors',    label:'Errors',    value: failed,         sub:'tasks failed',                   color:'var(--red)',     spark:[0,0,1,0,0,1,failed] },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg-root)' }}>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <span style={{ fontWeight:700, fontSize:16 }}>Dashboard</span>
          <span style={{ marginLeft:10, fontSize:12, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>
            {new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
          </span>
        </div>
        <div style={{ marginLeft:'auto' }}>
          <button className="btn-primary" onClick={() => setView('modules')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Run tool
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {STATS.map((s, i) => (
            <div key={s.key} className="card" style={{ padding:'18px 20px', animation:`fadeUp 0.3s ease ${i*0.06}s both` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:32, fontWeight:700, color:s.color, fontFamily:'Geist Mono,monospace', lineHeight:1, display:'flex', alignItems:'center', gap:8 }}>
                    {s.value}
                    {s.pulse && s.value > 0 && <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, display:'inline-block', animation:'pulse 1s ease infinite' }}/>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.sub}</div>
                </div>
                <Spark data={s.spark} color={s.color}/>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14 }}>
          {/* Area */}
          <div className="card" style={{ padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>Task activity</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Last 12 hours</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>
                <span style={{ width:10, height:2, background:'var(--accent)', display:'inline-block', borderRadius:1 }}/>
                tasks
              </div>
            </div>
            <AreaChart data={activityData}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, borderTop:'1px solid var(--bg-border)', paddingTop:8 }}>
              {['12h ago','9h','6h','3h','Now'].map(t => (
                <span key={t} style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className="card" style={{ padding:'20px 20px' }}>
            <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Modules</div>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <Donut slices={donutData.length ? donutData : [{ label:'—', value:1, color:'var(--bg-hover)' }]}/>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                {donutData.map(m => (
                  <div key={m.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 }}/>
                    <span style={{ fontSize:11.5, color:'var(--text-secondary)', flex:1 }}>{m.label}</span>
                    <span style={{ fontSize:11, color:m.color, fontFamily:'Geist Mono,monospace' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {/* Recent tasks */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid var(--bg-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:600, fontSize:14 }}>Recent tasks</span>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{tasks.length} total</span>
            </div>
            {recentTasks.length === 0 ? (
              <div style={{ padding:'28px 18px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No tasks yet</div>
            ) : recentTasks.map((t, i) => {
              const elapsed = t.finishedAt ? ((new Date(t.finishedAt) - new Date(t.createdAt)) / 1000).toFixed(1)+'s' : '—'
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 18px', borderBottom: i < recentTasks.length-1 ? '1px solid var(--bg-border)' : 'none', cursor:'default' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div style={{ width:7, height:7, borderRadius:'50%', background:STATUS_DOT[t.status], flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontSize:13, color:'var(--text-primary)' }}>{t.moduleId}</span>
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}> / {t.toolId}</span>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{elapsed}</span>
                </div>
              )
            })}
          </div>

          {/* Module grid */}
          <div className="card" style={{ padding:'16px 18px' }}>
            <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Available modules</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {modules.map((mod, i) => (
                <div key={mod.id} onClick={() => setView('modules')} style={{
                  padding:'11px 13px', borderRadius:8, cursor:'pointer',
                  background:'var(--bg-surface)', border:'1px solid var(--bg-border)',
                  transition:'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--bg-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--bg-border)'; e.currentTarget.style.background='var(--bg-surface)' }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: MOD_COLORS[i%MOD_COLORS.length], flexShrink:0 }}/>
                    <span style={{ fontWeight:600, fontSize:12.5, color:'var(--text-primary)' }}>{mod.name}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{mod.tools?.length} tools</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
