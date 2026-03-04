import { useState, useEffect, useCallback } from 'react'

// ─── JNE API CONFIG ──────────────────────────────────────────────────────────
const JNE_BASE = 'https://web.jne.gob.pe/serviciovotoinformado/api/votoinf'
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

async function jneFetch(cargo) {
  const url = `${JNE_BASE}/listarCanditatos`
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cargo }),
  }

  // Try direct first
  try {
    const r = await fetch(url, { ...opts, mode: 'cors' })
    if (r.ok) { const d = await r.json(); if (d?.data) return d.data }
  } catch {}

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const r = await fetch(proxy(url), opts)
      if (r.ok) {
        const text = await r.text()
        const d = JSON.parse(text)
        if (d?.data) return d.data
      }
    } catch {}
  }

  throw new Error('No se pudo conectar con la API del JNE')
}

// ─── STATUS STYLES ───────────────────────────────────────────────────────────
const STATUS_META = {
  INSCRITO:      { label: 'Inscrito',      color: '#27795a', bg: '#e8f5ee' },
  IMPROCEDENTE:  { label: 'Improcedente',  color: '#c0392b', bg: '#fdf0ef' },
  EXCLUSION:     { label: 'Exclusión',     color: '#8b0000', bg: '#fdf0ef' },
  RENUNCIA:      { label: 'Renuncia',      color: '#7a5c00', bg: '#fdf8e1' },
  'APELACIÓN':   { label: 'Apelación',     color: '#1a4a7a', bg: '#eaf0fb' },
}

const CARGOS = [
  { id: 'PRESIDENTE',       label: 'Presidente' },
  { id: 'VICEPRESIDENTE',   label: 'Vicepresidente' },
  { id: 'SENADOR',          label: 'Senadores' },
  { id: 'DIPUTADO',         label: 'Diputados' },
  { id: 'PARLAMENTO_ANDINO',label: 'Parlamento Andino' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fullName(c) {
  return [c.strNombres, c.strApellidoPaterno, c.strApellidoMaterno]
    .filter(Boolean).join(' ')
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: '#666', bg: '#eee' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: '0.7rem',
      fontFamily: 'var(--ff-mono)',
      fontWeight: 600,
      letterSpacing: '0.05em',
      color: meta.color,
      background: meta.bg,
      border: `1px solid ${meta.color}30`,
    }}>{meta.label}</span>
  )
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      borderBottom: '3px double var(--border)',
      background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Masthead */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '8px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
            color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>República del Perú</div>
          <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
            color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 600,
          }}>Elecciones Generales 2026</div>
        </div>
        <div style={{
          fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
          color: 'var(--muted)', letterSpacing: '0.05em',
        }}>Fuente: JNE — Voto Informado</div>
      </div>

      {/* Title */}
      <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--ff-head)',
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}>
          Transparencia Electoral Perú
        </h1>
        <p style={{
          fontFamily: 'var(--ff-mono)', fontSize: '0.7rem',
          color: 'var(--muted)', marginTop: 4, letterSpacing: '0.08em',
        }}>
          DATOS EN TIEMPO REAL · JURADO NACIONAL DE ELECCIONES
        </p>
      </div>

      {/* Tabs */}
      <nav style={{
        display: 'flex', gap: 0,
        padding: '12px 24px 0',
        overflowX: 'auto',
        borderBottom: 'none',
      }}>
        {CARGOS.map(c => (
          <button key={c.id} onClick={() => setActiveTab(c.id)} style={{
            padding: '8px 20px',
            fontFamily: 'var(--ff-mono)', fontSize: '0.72rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: activeTab === c.id ? 700 : 400,
            color: activeTab === c.id ? 'var(--paper)' : 'var(--muted)',
            background: activeTab === c.id ? 'var(--ink)' : 'transparent',
            border: '1px solid var(--border)',
            borderBottom: activeTab === c.id ? '1px solid var(--ink)' : '1px solid var(--border)',
            marginBottom: activeTab === c.id ? -1 : 0,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}>{c.label}</button>
        ))}
      </nav>
    </header>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', gap: 16 }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
        CONSULTANDO JNE...
      </p>
    </div>
  )
}

function ErrorBox({ message, onRetry }) {
  return (
    <div style={{
      margin: '40px auto', maxWidth: 520,
      border: '1px solid var(--red)',
      background: '#fdf0ef',
      padding: '24px 28px',
      borderRadius: 4,
    }}>
      <p style={{ fontFamily: 'var(--ff-head)', fontSize: '1.1rem', color: 'var(--red)', marginBottom: 8 }}>
        Error de conexión
      </p>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>{message}</p>
      <button onClick={onRetry} style={{
        padding: '8px 20px',
        background: 'var(--ink)', color: 'var(--paper)',
        border: 'none', borderRadius: 3,
        fontFamily: 'var(--ff-mono)', fontSize: '0.75rem',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>Reintentar</button>
    </div>
  )
}

function StatsBar({ data }) {
  if (!data?.length) return null
  const counts = {}
  data.forEach(c => { counts[c.strEstadoCandidato] = (counts[c.strEstadoCandidato] || 0) + 1 })
  const parties = [...new Set(data.map(c => c.strOrganizacionPolitica))].length

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 12,
      padding: '16px 24px',
      background: 'var(--cream)',
      borderBottom: '1px solid var(--border)',
    }}>
      <StatPill label="Total" value={data.length} />
      <StatPill label="Partidos" value={parties} />
      {Object.entries(counts).map(([k, v]) => (
        <StatPill key={k} label={STATUS_META[k]?.label || k} value={v}
          color={STATUS_META[k]?.color} />
      ))}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 12px',
      background: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 2,
    }}>
      <span style={{
        fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
        color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--ff-mono)', fontSize: '0.85rem',
        fontWeight: 700, color: color || 'var(--ink)',
      }}>{value}</span>
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'var(--ff-mono)', fontSize: '0.8rem', color: 'var(--muted)',
      }}>⌕</span>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px 8px 32px',
          background: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 3, fontSize: '0.85rem',
          color: 'var(--ink)', outline: 'none',
        }}
      />
    </div>
  )
}

function CandidateTable({ candidates }) {
  if (!candidates.length) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--ff-mono)', color: 'var(--muted)', fontSize: '0.8rem' }}>
          No se encontraron candidatos
        </p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            {['#', 'Candidato', 'DNI', 'Organización Política', 'Departamento', 'Estado'].map(h => (
              <th key={h} style={{
                padding: '10px 14px', textAlign: 'left',
                fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontWeight: 600, whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? 'var(--paper)' : 'var(--cream)',
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ede0c4'}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--paper)' : 'var(--cream)'}
            >
              <td style={{ padding: '9px 14px', fontFamily: 'var(--ff-mono)', color: 'var(--muted)', fontSize: '0.75rem' }}>
                {c.intPosicion || '—'}
              </td>
              <td style={{ padding: '9px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {fullName(c)}
                {c.strSexo && (
                  <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {c.strSexo === 'F' ? '♀' : c.strSexo === 'M' ? '♂' : ''}
                  </span>
                )}
              </td>
              <td style={{ padding: '9px 14px', fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                {c.strDocumentoIdentidad || '—'}
              </td>
              <td style={{ padding: '9px 14px', fontSize: '0.8rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.strOrganizacionPolitica}
              </td>
              <td style={{ padding: '9px 14px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {c.strDepartamento || c.strProvincia || '—'}
              </td>
              <td style={{ padding: '9px 14px' }}>
                <StatusBadge status={c.strEstadoCandidato} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabContent({ cargo }) {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('TODOS')
  const [filterParty, setFilterParty]   = useState('TODOS')
  const [page, setPage]       = useState(1)
  const PER_PAGE = 50

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const d = await jneFetch(cargo)
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [cargo])

  useEffect(() => { load(); setSearch(''); setFilterStatus('TODOS'); setFilterParty('TODOS'); setPage(1) }, [load])

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} onRetry={load} />

  const parties = ['TODOS', ...new Set(data.map(c => c.strOrganizacionPolitica)).values()].sort()
  const statuses = ['TODOS', ...Object.keys(STATUS_META)]

  const filtered = data.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      fullName(c).toLowerCase().includes(q) ||
      (c.strOrganizacionPolitica || '').toLowerCase().includes(q) ||
      (c.strDocumentoIdentidad || '').includes(q)
    const matchStatus = filterStatus === 'TODOS' || c.strEstadoCandidato === filterStatus
    const matchParty  = filterParty  === 'TODOS' || c.strOrganizacionPolitica === filterParty
    return matchSearch && matchStatus && matchParty
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="fade-in">
      <StatsBar data={data} />

      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
      }}>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }}
          placeholder="Buscar por nombre, partido, DNI..." />

        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)',
            background: 'var(--paper)', color: 'var(--ink)',
            borderRadius: 3, fontSize: '0.8rem',
            fontFamily: 'var(--ff-mono)',
          }}>
          {statuses.map(s => <option key={s} value={s}>{s === 'TODOS' ? 'Todos los estados' : STATUS_META[s]?.label || s}</option>)}
        </select>

        <select value={filterParty} onChange={e => { setFilterParty(e.target.value); setPage(1) }}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)',
            background: 'var(--paper)', color: 'var(--ink)',
            borderRadius: 3, fontSize: '0.8rem',
            fontFamily: 'var(--ff-mono)', maxWidth: 260,
          }}>
          {parties.map(p => <option key={p} value={p}>{p === 'TODOS' ? 'Todos los partidos' : p}</option>)}
        </select>

        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString()} resultados
        </span>
      </div>

      <CandidateTable candidates={paged} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 8, padding: '20px 24px',
          borderTop: '1px solid var(--border)',
        }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={paginBtn(page === 1)}>← Anterior</button>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Pág. {page} de {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={paginBtn(page === totalPages)}>Siguiente →</button>
        </div>
      )}
    </div>
  )
}

function paginBtn(disabled) {
  return {
    padding: '6px 16px',
    fontFamily: 'var(--ff-mono)', fontSize: '0.72rem',
    letterSpacing: '0.05em',
    background: disabled ? 'var(--cream)' : 'var(--ink)',
    color: disabled ? 'var(--muted)' : 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: 3, cursor: disabled ? 'default' : 'pointer',
  }
}

function Footer() {
  return (
    <footer style={{
      borderTop: '3px double var(--border)',
      padding: '20px 24px',
      marginTop: 40,
      display: 'flex', flexWrap: 'wrap', gap: 12,
      justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <p style={{ fontFamily: 'var(--ff-head)', fontSize: '1rem', fontWeight: 700 }}>
          Transparencia Electoral Perú 2026
        </p>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', color: 'var(--muted)', marginTop: 3 }}>
          Datos oficiales del Jurado Nacional de Elecciones (JNE)
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <a href="https://web.jne.gob.pe/serviciovotoinformado/"
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--ff-mono)', fontSize: '0.7rem',
            color: 'var(--gold)', textDecoration: 'none',
            letterSpacing: '0.06em',
          }}>
          → JNE Voto Informado
        </a>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', color: 'var(--muted)', marginTop: 3 }}>
          github.com/dialdise/peru-electoral
        </p>
      </div>
    </footer>
  )
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('DIPUTADO')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <TabContent key={activeTab} cargo={activeTab} />
      </main>
      <Footer />
    </div>
  )
}
