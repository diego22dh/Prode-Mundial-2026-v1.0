import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { flag } from '../lib/flags'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PHASES = { group:'Fase de grupos', R32:'Ronda 32', R16:'Octavos', QF:'Cuartos', SF:'Semis', '3rd':'3er puesto', F:'Final' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' }) + ' ' +
    d.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })
}

export default function AdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [scores, setScores] = useState({}) // matchId -> {home, away}
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('pending') // 'pending' | 'all'

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/partidos')
    else if (profile) fetchMatches()
  }, [profile])

  async function fetchMatches() {
    const { data } = await supabase.from('matches').select('*').order('match_date')
    setMatches(data || [])
    setLoading(false)
  }

  function handleScore(matchId, side, val) {
    const num = val === '' ? '' : Math.max(0, Math.min(30, parseInt(val) || 0))
    setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], [side]: num } }))
  }

  async function saveResult(matchId) {
    const s = scores[matchId]
    if (s?.home === '' || s?.away === '' || s?.home === undefined || s?.away === undefined) {
      setMsg('Completá ambos scores'); return
    }
    setProcessing(matchId)
    const { error: e1 } = await supabase
      .from('matches')
      .update({ home_score: s.home, away_score: s.away, status: 'finished' })
      .eq('id', matchId)
    if (e1) { setMsg(e1.message); setProcessing(null); return }

    const { data, error: e2 } = await supabase.rpc('score_match', { p_match_id: matchId })
    if (e2) setMsg(e2.message)
    else setMsg(`✓ Resultado guardado. ${data} pronósticos puntuados.`)

    setScores(prev => { const n = {...prev}; delete n[matchId]; return n })
    await fetchMatches()
    setProcessing(null)
  }

  async function setLive(matchId) {
    await supabase.from('matches').update({ status: 'live' }).eq('id', matchId)
    await fetchMatches()
  }

  const filtered = matches.filter(m =>
    tab === 'pending' ? m.status !== 'finished' : true
  )

  // Group by phase
  const grouped = {}
  filtered.forEach(m => {
    const key = m.group_name ? `Grupo ${m.group_name}` : (PHASES[m.phase] || m.phase)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  if (loading) return <div className="spinner" />

  return (
    <>
      <div className="card" style={{ marginBottom: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="badge badge-admin">ADMIN</span>
        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Panel de administración — carga de resultados</span>
      </div>

      {msg && (
        <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '12px' }}>
          {msg}
          <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="tabs card" style={{ marginBottom: '12px' }}>
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pendientes</button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Todos</button>
      </div>

      {Object.entries(grouped).map(([group, gMatches]) => (
        <div key={group} className="card" style={{ marginBottom: '12px' }}>
          <div className="group-header">{group}</div>
          {gMatches.map(m => (
            <div key={m.id} className="admin-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {flag(m.home_team)} {m.home_team} vs {flag(m.away_team)} {m.away_team}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{formatDate(m.match_date)}</div>
              </div>

              {m.status === 'finished' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="score-result" style={{ fontSize: '18px' }}>
                    {m.home_score}<span className="sep" style={{ fontSize: '12px' }}>-</span>{m.away_score}
                  </span>
                  <span className="badge badge-green">Finalizado</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {m.status === 'upcoming' && (
                    <button className="btn-sm" style={{ background: 'var(--gold)', color: '#fff', fontSize: '11px', padding: '4px 10px' }} onClick={() => setLive(m.id)}>
                      En vivo
                    </button>
                  )}
                  {m.status === 'live' && <span className="badge badge-red" style={{ fontSize: '11px' }}>● En vivo</span>}
                  <input
                    className="admin-score-input"
                    type="number" min="0" max="30" placeholder="L"
                    value={scores[m.id]?.home ?? ''}
                    onChange={e => handleScore(m.id, 'home', e.target.value)}
                  />
                  <span style={{ color: 'var(--gray-400)' }}>-</span>
                  <input
                    className="admin-score-input"
                    type="number" min="0" max="30" placeholder="V"
                    value={scores[m.id]?.away ?? ''}
                    onChange={e => handleScore(m.id, 'away', e.target.value)}
                  />
                  <button
                    className="btn-sm"
                    disabled={processing === m.id}
                    onClick={() => saveResult(m.id)}
                  >
                    {processing === m.id ? '...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
