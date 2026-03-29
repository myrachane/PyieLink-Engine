import React, { useState } from 'react'
import { useStore } from '../../store'

/* ── Module accent colours ─────────────────────────────────────────────── */
const MOD_COLOR = {
  network: '#6366f1', web: '#22c55e', packet: '#f97316',
  intelligence: '#ec4899', crypto: '#8b5cf6',
  vulnerability: '#ef4444', ptp: '#3b82f6',
}

/* ── Module documentation ─────────────────────────────────────────────── */
const DOCS = {
  network: {
    desc: 'Scan hosts, grab service banners, and enumerate DNS records.',
    tools: {
      port_scanner:   { desc:'TCP connect scan across a port range. Identifies open ports and maps service names.', example:'target: 192.168.1.1 | ports: 22,80,443 | timeout: 2' },
      banner_grabber: { desc:'Connects to a specific port and reads the raw service banner (HTTP, SSH, SMTP…).', example:'target: 192.168.1.1 | port: 80' },
      dns_enum:       { desc:'Resolves DNS records for a domain. Supports A, MX, NS, TXT or ALL.', example:'domain: example.com | record_type: ALL' },
    }
  },
  web: {
    desc: 'HTTP-level scanning — inspect headers, brute-force paths, check CORS misconfigs.',
    tools: {
      http_scanner:   { desc:'Fetches a URL and returns status code, response headers, and a body preview.', example:'url: https://example.com' },
      dir_bruteforce: { desc:'Iterates a wordlist against a base URL to find hidden paths.', example:'url: https://example.com | wordlist: admin,login,api,backup' },
      cors_checker:   { desc:'Sends a cross-origin request with a spoofed Origin header and checks whether the server reflects it.', example:'url: https://example.com | origin: https://evil.com' },
    }
  },
  packet: {
    desc: 'Raw packet capture and crafting. Requires root/administrator privileges.',
    tools: {
      packet_sniffer: { desc:'Captures live network packets on an interface. Returns src/dst IPs, ports, and protocol info.', example:'interface: eth0 | count: 10 | filter: tcp' },
      packet_crafter: { desc:'Sends a crafted TCP/UDP/ICMP packet to a target. Useful for testing firewall rules.', example:'target: 192.168.1.1 | port: 80 | protocol: tcp' },
    }
  },
  intelligence: {
    desc: 'Open-source intelligence — WHOIS and IP geolocation lookups.',
    tools: {
      whois_lookup: { desc:'Queries IANA WHOIS for registration data on a domain or IP.', example:'target: example.com' },
      ip_info:      { desc:'Returns geolocation, ISP, ASN, and timezone for an IP via ip-api.com.', example:'ip: 8.8.8.8' },
    }
  },
  crypto: {
    desc: 'Symmetric encryption and hashing primitives.',
    tools: {
      aes_encryptor: { desc:'AES-256-GCM or AES-CBC encrypt/decrypt. Key must be a 32-byte hex string.', example:'action: encrypt | data: hello world | key: 000102...1e1f (32 bytes hex) | mode: gcm' },
      hashing_tool:  { desc:'Produces a hash digest using SHA-256, SHA-512, MD5, BLAKE2, or other stdlib algorithms.', example:'data: hello world | algorithm: sha256' },
    }
  },
  vulnerability: {
    desc: 'Analyse headers and ports for common security misconfigurations.',
    tools: {
      header_analyzer:   { desc:'Fetches security-relevant HTTP response headers and scores them. Flags missing HSTS, CSP, X-Frame-Options, etc.', example:'url: https://example.com' },
      port_risk_analyzer: { desc:'Rates the risk of an open-port list against a built-in CVE/service database.', example:'ports: 22,80,443,3306,6379' },
    }
  },
  ptp: {
    desc: 'PyieLink Transfer Protocol — chunk, encrypt, shuffle, simulate and reassemble files.',
    tools: {
      chunk_protocol: { desc:'Three actions: chunk (split + encrypt + shuffle), reassemble (decrypt + verify SHA-256), simulate (drop/delay simulation).', example:'action: chunk | data_b64: <base64> | key_hex: <32 byte hex> | chunk_size: 512 | randomize: true' },
    }
  },
}

/* ── Structured output renderers ─────────────────────────────────────── */
function ResultView({ moduleId, toolId, result }) {
  if (!result) return null
  if (result.error || result.status === 'error') return <ErrorResult msg={result.error || result.message}/>
  try {
    const R = RENDERERS[`${moduleId}/${toolId}`]
    return R ? <R data={result}/> : <GenericResult data={result}/>
  } catch { return <GenericResult data={result}/> }
}

function ErrorResult({ msg }) {
  return (
    <div style={{ padding:'14px 16px', borderRadius:8, background:'var(--red-subtle)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--red)', fontFamily:'Geist Mono,monospace', fontSize:12.5 }}>
      <div style={{ fontWeight:600, marginBottom:4 }}>⚠ Error</div>
      {msg}
    </div>
  )
}

function GenericResult({ data }) {
  return (
    <pre style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)', borderRadius:8, padding:'14px 16px', fontSize:12, fontFamily:'Geist Mono,monospace', lineHeight:1.7, overflowX:'auto', maxHeight:440, overflowY:'auto', color:'var(--text-secondary)', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

/* Individual renderers */
function PortScannerResult({ data }) {
  return (
    <Card title={`Port scan — ${data.target}`} badge={`${data.open_ports?.length || 0} open / ${data.scanned} scanned`} badgeType={data.open_ports?.length ? 'yellow' : 'green'}>
      {data.open_ports?.length === 0 && <EmptyState msg="No open ports found in range"/>}
      {data.open_ports?.map(p => (
        <Row key={p.port}>
          <span style={{ fontFamily:'Geist Mono,monospace', fontWeight:600, color:'var(--accent)', minWidth:56 }}>{p.port}</span>
          <span className="badge badge-accent">OPEN</span>
          <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.service}</span>
        </Row>
      ))}
    </Card>
  )
}

function BannerResult({ data }) {
  return (
    <Card title={`Banner — ${data.target}:${data.port}`}>
      {data.banner
        ? <pre style={{ fontFamily:'Geist Mono,monospace', fontSize:12, color:'var(--text-secondary)', whiteSpace:'pre-wrap', wordBreak:'break-all', padding:'6px 0' }}>{data.banner}</pre>
        : <EmptyState msg="No banner received"/>
      }
    </Card>
  )
}

function DnsResult({ data }) {
  return (
    <Card title={`DNS — ${data.domain}`}>
      {Object.entries(data.records || {}).map(([type, records]) => (
        <div key={type} style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, fontFamily:'Geist Mono,monospace' }}>{type}</div>
          {Array.isArray(records)
            ? records.length === 0 ? <span style={{ color:'var(--text-muted)', fontSize:12 }}>none</span>
              : records.map((r,i) => <Row key={i}><span style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5, color:'var(--text-secondary)' }}>{typeof r === 'string' ? r : JSON.stringify(r)}</span></Row>)
            : records?.error
              ? <span style={{ color:'var(--red)', fontSize:12 }}>{records.error}</span>
              : <Row><span style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5, color:'var(--text-secondary)' }}>{JSON.stringify(records)}</span></Row>
          }
        </div>
      ))}
    </Card>
  )
}

function HttpResult({ data }) {
  const statusOk = data.http_status < 400
  return (
    <Card title={`HTTP — ${data.url}`} badge={String(data.http_status)} badgeType={statusOk ? 'green' : 'red'}>
      <Section label="Headers">
        {Object.entries(data.headers||{}).slice(0,20).map(([k,v]) => (
          <Row key={k}>
            <span style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-muted)', minWidth:200 }}>{k}</span>
            <span style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-secondary)', wordBreak:'break-all' }}>{v}</span>
          </Row>
        ))}
      </Section>
      {data.body_preview && (
        <Section label="Body preview">
          <pre style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-muted)', whiteSpace:'pre-wrap', wordBreak:'break-all', maxHeight:120, overflow:'auto' }}>{data.body_preview}</pre>
        </Section>
      )}
    </Card>
  )
}

function DirBruteResult({ data }) {
  return (
    <Card title={`Dir bruteforce — ${data.base_url}`} badge={`${data.found?.length || 0} found / ${data.checked} checked`} badgeType={data.found?.length ? 'yellow' : 'muted'}>
      {data.found?.length === 0 && <EmptyState msg="No paths found"/>}
      {data.found?.map((f, i) => (
        <Row key={i}>
          <span className={`badge badge-${f.status < 400 ? 'green' : 'yellow'}`}>{f.status}</span>
          <span style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5, color:'var(--text-secondary)' }}>{f.path}</span>
        </Row>
      ))}
    </Card>
  )
}

function CorsResult({ data }) {
  return (
    <Card title={`CORS — ${data.url}`} badge={data.vulnerable ? 'VULNERABLE' : 'SAFE'} badgeType={data.vulnerable ? 'red' : 'green'}>
      {data.issues?.length > 0 && (
        <Section label="Issues found">
          {data.issues.map((iss, i) => (
            <Row key={i}><span style={{ color:'var(--red)', fontSize:13 }}>⚠ {iss}</span></Row>
          ))}
        </Section>
      )}
      <Section label="CORS headers">
        {Object.keys(data.cors_headers||{}).length === 0
          ? <span style={{ color:'var(--text-muted)', fontSize:12 }}>No CORS headers present</span>
          : Object.entries(data.cors_headers).map(([k,v]) => (
            <Row key={k}>
              <span style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-muted)', minWidth:220 }}>{k}</span>
              <span style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-secondary)' }}>{v}</span>
            </Row>
          ))
        }
      </Section>
    </Card>
  )
}

function HashResult({ data }) {
  return (
    <Card title={`Hash — ${data.algorithm?.toUpperCase()}`}>
      <div style={{ fontFamily:'Geist Mono,monospace', fontSize:13, color:'var(--accent)', wordBreak:'break-all', padding:'6px 0' }}>{data.hash}</div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>Input: {data.input_len} bytes · Algorithm: {data.algorithm}</div>
    </Card>
  )
}

function AesResult({ data }) {
  return (
    <Card title={`AES ${data.action} — ${data.mode?.toUpperCase()}`} badge={data.action?.toUpperCase()} badgeType="accent">
      <div style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5, color:'var(--text-secondary)', wordBreak:'break-all', padding:'6px 0' }}>{data.result}</div>
    </Card>
  )
}

function HeaderAnalyzerResult({ data }) {
  const scoreColor = data.score >= 80 ? 'var(--green)' : data.score >= 50 ? 'var(--yellow)' : 'var(--red)'
  return (
    <Card title={`Header analysis — ${data.url}`} badge={`Score ${data.score}/100`} badgeType={data.score>=80?'green':data.score>=50?'yellow':'red'}>
      {data.exposed_headers && Object.keys(data.exposed_headers).length > 0 && (
        <Section label="Exposed server info">
          {Object.entries(data.exposed_headers).map(([k,v]) => (
            <Row key={k}><span style={{ color:'var(--yellow)', fontSize:12 }}>⚠ {k}: {v}</span></Row>
          ))}
        </Section>
      )}
      <Section label="Security headers">
        {data.findings?.map((f, i) => (
          <Row key={i}>
            <span className={`badge badge-${f.present ? 'green' : f.risk==='high'?'red':f.risk==='medium'?'yellow':'muted'}`} style={{ minWidth:52 }}>
              {f.present ? 'OK' : f.risk?.toUpperCase()}
            </span>
            <span style={{ fontFamily:'Geist Mono,monospace', fontSize:12, color: f.present ? 'var(--text-secondary)' : 'var(--text-primary)', flex:1 }}>{f.header}</span>
            {!f.present && <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{f.desc}</span>}
          </Row>
        ))}
      </Section>
    </Card>
  )
}

function PortRiskResult({ data }) {
  const riskOrder = { critical:0, high:1, medium:2, low:3 }
  const riskColor = { critical:'var(--red)', high:'#f97316', medium:'var(--yellow)', low:'var(--green)' }
  const riskBadge = { critical:'red', high:'red', medium:'yellow', low:'green' }
  return (
    <Card title="Port risk analysis" badge={`Overall: ${data.overall_risk?.toUpperCase()}`} badgeType={riskBadge[data.overall_risk]||'muted'}>
      <Section label="Summary">
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {Object.entries(data.summary||{}).map(([k,v]) => v > 0 && (
            <div key={k} className={`badge badge-${riskBadge[k]||'muted'}`}>{k}: {v}</div>
          ))}
        </div>
      </Section>
      <Section label="Findings">
        {data.findings?.map((f, i) => (
          <Row key={i}>
            <span className={`badge badge-${riskBadge[f.risk]||'muted'}`} style={{ minWidth:72 }}>{f.risk?.toUpperCase()}</span>
            <span style={{ fontFamily:'Geist Mono,monospace', fontWeight:600, fontSize:12.5, color:riskColor[f.risk], minWidth:48 }}>{f.port}</span>
            <span style={{ fontSize:12.5, color:'var(--text-secondary)', minWidth:100 }}>{f.service}</span>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{f.note}</span>
          </Row>
        ))}
      </Section>
      {data.unknown_ports?.length > 0 && (
        <Section label="Unknown ports">
          <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{data.unknown_ports.join(', ')}</div>
        </Section>
      )}
    </Card>
  )
}

function IpInfoResult({ data }) {
  const info = data.info || {}
  const fields = [['Country',info.country],['Region',info.regionName],['City',info.city],['ISP',info.isp],['Org',info.org],['AS',info.as],['Timezone',info.timezone],['Lat/Lon',info.lat && `${info.lat}, ${info.lon}`]]
  return (
    <Card title={`IP info — ${data.ip}`}>
      {fields.filter(([,v])=>v).map(([k,v]) => (
        <Row key={k}>
          <span style={{ fontSize:12, color:'var(--text-muted)', minWidth:90 }}>{k}</span>
          <span style={{ fontSize:13, color:'var(--text-primary)' }}>{v}</span>
        </Row>
      ))}
    </Card>
  )
}

function WhoisResult({ data }) {
  const important = ['domain_name','registrar','creation_date','expiration_date','name_server','registrant_country','status']
  const parsed = data.parsed || {}
  const shown  = important.filter(k => parsed[k])
  return (
    <Card title={`Whois — ${data.target}`}>
      {shown.map(k => (
        <Row key={k}>
          <span style={{ fontSize:12, color:'var(--text-muted)', minWidth:140, fontFamily:'Geist Mono,monospace' }}>{k}</span>
          <span style={{ fontSize:12.5, color:'var(--text-primary)', wordBreak:'break-all' }}>{parsed[k]}</span>
        </Row>
      ))}
      {shown.length === 0 && data.raw && (
        <pre style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--text-secondary)', whiteSpace:'pre-wrap', maxHeight:280, overflow:'auto' }}>{data.raw}</pre>
      )}
    </Card>
  )
}

function PtpResult({ data }) {
  return (
    <Card title={`PTP — ${data.action}`} badge={data.action?.toUpperCase()} badgeType="blue">
      {data.action === 'chunk' && (
        <>
          <Section label="Stats">
            {[['Total chunks',data.total_chunks],['Dummy chunks',data.dummy_chunks],['Encrypted',String(data.encrypted)],['Original hash',data.original_hash?.slice(0,20)+'…']].map(([k,v]) => v && (
              <Row key={k}><span style={{ color:'var(--text-muted)', minWidth:130 }}>{k}</span><span style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5 }}>{v}</span></Row>
            ))}
          </Section>
          <Section label="First 3 chunks">
            {data.chunks?.slice(0,3).map((c,i) => (
              <Row key={i}><span className={`badge ${c.dummy?'badge-muted':'badge-blue'}`}>{c.dummy?'DUMMY':`SEQ ${c.seq}`}</span><span style={{ fontFamily:'Geist Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>{c.size} bytes</span></Row>
            ))}
          </Section>
        </>
      )}
      {data.action === 'reassemble' && (
        <Section label="Result">
          {[['Hash match',String(data.hash_match)],['Result hash',data.result_hash?.slice(0,24)+'…'],['Size',data.size+' bytes']].map(([k,v]) => v && (
            <Row key={k}><span style={{ color:'var(--text-muted)', minWidth:110 }}>{k}</span><span style={{ fontFamily:'Geist Mono,monospace', fontSize:12.5, color: k==='Hash match' ? (data.hash_match?'var(--green)':'var(--red)') : 'inherit' }}>{v}</span></Row>
          ))}
        </Section>
      )}
      {data.action === 'simulate' && (
        <Section label="Simulation">
          {[['Total',data.total],['Dropped',data.dropped],['Delivery rate',data.delivery_rate+'%']].map(([k,v]) => (
            <Row key={k}><span style={{ color:'var(--text-muted)', minWidth:120 }}>{k}</span><span style={{ fontFamily:'Geist Mono,monospace', fontSize:13, color: k==='Delivery rate' ? (data.delivery_rate>90?'var(--green)':'var(--yellow)') : 'inherit' }}>{v}</span></Row>
          ))}
        </Section>
      )}
    </Card>
  )
}

/* renderer map */
const RENDERERS = {
  'network/port_scanner':            PortScannerResult,
  'network/banner_grabber':          BannerResult,
  'network/dns_enum':                DnsResult,
  'web/http_scanner':                HttpResult,
  'web/dir_bruteforce':              DirBruteResult,
  'web/cors_checker':                CorsResult,
  'crypto/hashing_tool':             HashResult,
  'crypto/aes_encryptor':            AesResult,
  'vulnerability/header_analyzer':   HeaderAnalyzerResult,
  'vulnerability/port_risk_analyzer':PortRiskResult,
  'intelligence/ip_info':            IpInfoResult,
  'intelligence/whois_lookup':       WhoisResult,
  'ptp/chunk_protocol':              PtpResult,
}

/* ── Primitive layout helpers ──────────────────────────────────────────── */
function Card({ title, badge, badgeType = 'accent', children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)', borderRadius:10, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--bg-border)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontWeight:600, fontSize:13, flex:1 }}>{title}</span>
        {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
      </div>
      <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:4 }}>{children}</div>
    </div>
  )
}
function Section({ label, children }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{label}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>{children}</div>
    </div>
  )
}
function Row({ children }) {
  return <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0', borderBottom:'1px solid var(--bg-border)', fontSize:13 }}>{children}</div>
}
function EmptyState({ msg }) {
  return <div style={{ padding:'12px 0', color:'var(--text-muted)', fontSize:13, textAlign:'center' }}>{msg}</div>
}

/* ── Spinner ────────────────────────────────────────────────────────────── */
function Spinner({ color = 'var(--accent)' }) {
  return <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid transparent`, borderTopColor: color, animation:'spin 0.6s linear infinite', flexShrink:0 }}/>
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function ModuleRunner() {
  const { modules, runTool, pollTask } = useStore()
  const [selMod,  setSelMod]  = useState(null)
  const [selTool, setSelTool] = useState(null)
  const [form,    setForm]    = useState({})
  const [status,  setStatus]  = useState(null)   // null | 'running' | 'done' | 'failed'
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const [history, setHistory] = useState([])
  const [showDoc, setShowDoc] = useState(true)

  const accent = selMod ? (MOD_COLOR[selMod.id] || 'var(--accent)') : 'var(--accent)'
  const doc     = selMod ? DOCS[selMod.id] : null
  const toolDoc = selTool ? doc?.tools?.[selTool.id] : null

  const pickMod = (mod) => { setSelMod(mod); setSelTool(null); setForm({}); setResult(null); setStatus(null); setElapsed(null) }
  const pickTool = (tool) => {
    setSelTool(tool); setResult(null); setStatus(null); setElapsed(null)
    const d = {}
    Object.entries(tool.schema||{}).forEach(([k,v]) => { if (v.default !== undefined) d[k] = String(v.default) })
    setForm(d)
  }

  const handleRun = async () => {
    if (!selTool || loading) return
    setLoading(true); setResult(null); setStatus('running'); setElapsed(null)
    const t0 = Date.now()
    try {
      const payload = {}
      Object.entries(selTool.schema||{}).forEach(([k, rule]) => {
        const raw = form[k]
        if (raw !== undefined && raw !== '') payload[k] = rule.type === 'number' ? Number(raw) : raw
      })
      const taskId = await runTool(selMod.id, selTool.id, payload)
      const task   = await pollTask(taskId)
      const el     = ((Date.now() - t0) / 1000).toFixed(2)
      setStatus(task.status); setElapsed(el)
      setResult(task.status === 'done' ? task.result : { error: task.error })
      setHistory(h => [{ tool: selTool.name, mod: selMod.name, status: task.status, elapsed: el, ts: new Date().toLocaleTimeString() }, ...h.slice(0, 9)])
    } catch (e) {
      setStatus('failed'); setResult({ error: e.message }); setElapsed(((Date.now()-t0)/1000).toFixed(2))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* ── Pane 1: Module list ── */}
      <div style={{ width:180, flexShrink:0, background:'var(--bg-base)', borderRight:'1px solid var(--bg-border)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid var(--bg-border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Modules</div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'6px 8px' }}>
          {modules.map(mod => {
            const c = MOD_COLOR[mod.id]||'var(--accent)', active = selMod?.id===mod.id
            return (
              <button key={mod.id} onClick={() => pickMod(mod)} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%',
                padding:'8px 10px', borderRadius:7, marginBottom:1,
                background: active ? `${c}12` : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, fontSize:13, textAlign:'left',
                borderLeft: active ? `2px solid ${c}` : '2px solid transparent',
              }}
                onMouseEnter={e => { if(!active){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text-primary)'} }}
                onMouseLeave={e => { if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-secondary)'} }}
              >
                <div style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0, opacity: active?1:0.5 }}/>
                <span style={{ flex:1 }}>{mod.name}</span>
                <span style={{ fontSize:10, color: active?c:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{mod.tools?.length}</span>
              </button>
            )
          })}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ borderTop:'1px solid var(--bg-border)', padding:'8px 8px 10px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 8px 5px' }}>History</div>
            {history.slice(0,5).map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', fontSize:11, color:'var(--text-muted)' }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background: r.status==='done'?'var(--green)':'var(--red)', flexShrink:0 }}/>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'Geist Mono,monospace', fontSize:10.5 }}>{r.tool}</span>
                <span style={{ fontFamily:'Geist Mono,monospace', fontSize:10 }}>{r.elapsed}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pane 2: Tool list ── */}
      <div style={{ width:185, flexShrink:0, background:'var(--bg-surface)', borderRight:'1px solid var(--bg-border)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid var(--bg-border)', display:'flex', alignItems:'center', gap:7 }}>
          {selMod && <div style={{ width:6, height:6, borderRadius:'50%', background:accent, flexShrink:0 }}/>}
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {selMod ? selMod.name : 'Tools'}
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'6px 8px' }}>
          {!selMod && (
            <div style={{ padding:'20px 12px', textAlign:'center', color:'var(--text-muted)', fontSize:11, fontFamily:'Geist Mono,monospace' }}>← select a module</div>
          )}
          {selMod?.tools.map(tool => {
            const active = selTool?.id === tool.id
            return (
              <button key={tool.id} onClick={() => pickTool(tool)} style={{
                display:'flex', alignItems:'center', gap:7, width:'100%',
                padding:'8px 10px', borderRadius:7, marginBottom:1,
                background: active ? `${accent}12` : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, fontSize:13, textAlign:'left',
                borderLeft: active ? `2px solid ${accent}` : '2px solid transparent',
              }}
                onMouseEnter={e => { if(!active){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text-primary)'} }}
                onMouseLeave={e => { if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-secondary)'} }}
              >
                <span style={{ fontSize:11, color: active?accent:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>#</span>
                {tool.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Pane 3: Form + Result ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg-root)' }}>
        {/* Top bar */}
        <div className="topbar">
          {selTool ? (
            <>
              <span style={{ fontFamily:'Geist Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>#</span>
              <span style={{ fontWeight:700, fontSize:14 }}>{selTool.name}</span>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>{selMod?.id}/{selTool.id}</span>
              {status && (
                <span className={`badge badge-${status==='done'?'green':status==='running'?'yellow':'red'}`} style={{ marginLeft:4 }}>
                  {status==='running' && <Spinner color={`var(--yellow)`}/>}
                  {status.toUpperCase()}
                </span>
              )}
              {elapsed && <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace', marginLeft:4 }}>{elapsed}s</span>}
            </>
          ) : (
            <span style={{ color:'var(--text-muted)', fontSize:13 }}>Select a module and tool to run</span>
          )}

          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            {selTool && (
              <button onClick={() => setShowDoc(d => !d)} style={{
                padding:'5px 12px', borderRadius:7, fontSize:12, fontWeight:500,
                background: showDoc ? 'var(--accent-subtle)' : 'transparent',
                color: showDoc ? 'var(--accent)' : 'var(--text-secondary)',
                border:`1px solid ${showDoc ? 'var(--accent-border)' : 'var(--bg-border)'}`,
              }}>
                {showDoc ? 'Hide docs' : 'Quick start'}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

          {!selTool ? (
            /* ── Empty state ── */
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, opacity:0.4 }}>
              <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="8" r="2.5" fill="var(--accent)"/>
                <circle cx="7" cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
                <circle cx="21" cy="20" r="2.5" fill="var(--accent)" opacity="0.7"/>
                <line x1="14" y1="10.5" x2="14" y2="13" stroke="var(--accent)" strokeWidth="1.2"/>
                <line x1="12.5" y1="14.5" x2="8.5" y2="18" stroke="var(--accent)" strokeWidth="1.2"/>
                <line x1="15.5" y1="14.5" x2="19.5" y2="18" stroke="var(--accent)" strokeWidth="1.2"/>
                <circle cx="14" cy="14" r="1.5" fill="var(--accent)"/>
              </svg>
              <div style={{ color:'var(--text-muted)', fontSize:13, fontFamily:'Geist Mono,monospace' }}>select a module and tool</div>
            </div>
          ) : (
            <>
              {/* ── Quick start docs ── */}
              {showDoc && (doc || toolDoc) && (
                <div style={{ background:'var(--bg-surface)', border:'1px solid var(--bg-border)', borderRadius:10, padding:'16px 18px', animation:'fadeIn 0.2s ease' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:accent }}/>
                    <span style={{ fontWeight:700, fontSize:13 }}>{selTool.name} — Quick Start</span>
                  </div>
                  {toolDoc?.desc && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12, lineHeight:1.65 }}>{toolDoc.desc}</p>}
                  {toolDoc?.example && (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Example</div>
                      <div style={{ fontFamily:'Geist Mono,monospace', fontSize:11.5, color:'var(--accent)', background:'var(--accent-subtle)', borderRadius:6, padding:'8px 12px', border:'1px solid var(--accent-border)' }}>
                        {toolDoc.example}
                      </div>
                    </div>
                  )}
                  {doc?.desc && !toolDoc && (
                    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65 }}>{doc.desc}</p>
                  )}
                </div>
              )}

              {/* ── Form ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:520 }}>
                {Object.entries(selTool.schema||{}).map(([key, rule]) => (
                  <div key={key}>
                    <div style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
                      <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'Geist Mono,monospace' }}>{rule.label||key}</label>
                      {rule.required
                        ? <span className="badge badge-red" style={{ fontSize:10 }}>required</span>
                        : rule.default !== undefined && <span style={{ fontSize:10.5, color:'var(--text-muted)', fontFamily:'Geist Mono,monospace' }}>default: {rule.default}</span>
                      }
                    </div>
                    <input type={rule.type==='number'?'number':'text'} placeholder={rule.default !== undefined ? String(rule.default) : rule.label||key} value={form[key]??''} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} onKeyDown={e => e.key==='Enter' && handleRun()}/>
                  </div>
                ))}
              </div>

              {/* ── Run button ── */}
              <div>
                <button onClick={handleRun} disabled={loading} style={{
                  padding:'10px 24px', borderRadius:8, fontWeight:600, fontSize:13,
                  background: loading ? 'var(--bg-hover)' : accent,
                  color: loading ? 'var(--text-muted)' : '#fff',
                  display:'inline-flex', alignItems:'center', gap:8,
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading && <Spinner color="#fff"/>}
                  {loading ? 'Running…' : 'Run tool'}
                </button>
              </div>

              {/* ── Structured result ── */}
              {result && !loading && (
                <div style={{ animation:'fadeUp 0.2s ease', maxWidth:640 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10, fontFamily:'Geist Mono,monospace' }}>
                    Result
                  </div>
                  <ResultView moduleId={selMod.id} toolId={selTool.id} result={result}/>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
