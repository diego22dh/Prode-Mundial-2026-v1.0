import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { flagUrl } from '../lib/flags'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PHASES = { group:'Fase de grupos', R32:'Ronda 32', R16:'Octavos', QF:'Cuartos', SF:'Semis', '3rd':'3er puesto', F:'Final' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit', month: '2-digit'
  }) + ' ' + d.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit', minute: '2-digit'
  })
}

// ─── Sección: Resultados ───────────────────────────────────
function MatchesTab({ profile }) {
  const [matches, setMatches] = useState([])
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('pending')

  useEffect(() => { fetchMatches() }, [])

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

  async function resetResult(matchId) {
    if (!window.confirm('¿Resetear este resultado y los puntos asociados?')) return
    setProcessing(matchId)
    await supabase.from('matches').update({ home_score: null, away_score: null, status: 'upcoming' }).eq('id', matchId)
    await supabase.from('predictions').update({ points: 0, scored_at: null }).eq('match_id', matchId)
    setMsg('✓ Resultado reseteado.')
    await fetchMatches()
    setProcessing(null)
  }

  const filtered = matches.filter(m => tab === 'pending' ? m.status !== 'finished' : true)
  const grouped = {}
  filtered.forEach(m => {
    const key = m.group_name ? `Grupo ${m.group_name}` : (PHASES[m.phase] || m.phase)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  if (loading) return <div className="spinner" />

  return (
    <>
      {msg && (
        <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '12px' }}>
          {msg}
          <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
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
                <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {flagUrl(m.home_team) && <img src={flagUrl(m.home_team)} width="16" height="12" style={{ borderRadius: '2px' }} alt="" />}
                  {m.home_team}
                  <span style={{ color: 'var(--gray-400)', margin: '0 2px' }}>vs</span>
                  {flagUrl(m.away_team) && <img src={flagUrl(m.away_team)} width="16" height="12" style={{ borderRadius: '2px' }} alt="" />}
                  {m.away_team}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{formatDate(m.match_date)}</div>
              </div>
              {m.status === 'finished' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px' }}>{m.home_score}-{m.away_score}</span>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>Final</span>
                  <button className="btn-sm" style={{ background: 'var(--red)', fontSize: '11px', padding: '4px 8px' }}
                    disabled={processing === m.id} onClick={() => resetResult(m.id)}>Reset</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {m.status === 'upcoming' && (
                    <button className="btn-sm" style={{ background: 'var(--gold)', color: '#fff', fontSize: '11px', padding: '4px 10px' }} onClick={() => setLive(m.id)}>
                      En vivo
                    </button>
                  )}
                  {m.status === 'live' && <span className="badge badge-red" style={{ fontSize: '11px' }}>● En vivo</span>}
                  <input className="admin-score-input" type="number" min="0" max="30" placeholder="L"
                    value={scores[m.id]?.home ?? ''} onChange={e => handleScore(m.id, 'home', e.target.value)} />
                  <span style={{ color: 'var(--gray-400)' }}>-</span>
                  <input className="admin-score-input" type="number" min="0" max="30" placeholder="V"
                    value={scores[m.id]?.away ?? ''} onChange={e => handleScore(m.id, 'away', e.target.value)} />
                  <button className="btn-sm" disabled={processing === m.id} onClick={() => saveResult(m.id)}>
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

// ─── Sección: Usuarios ────────────────────────────────────
function UsersTab({ currentProfile }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // profile id en edición
  const [editName, setEditName] = useState('')
  const [editAdmin, setEditAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, is_admin, created_at')
      .order('created_at')
    setUsers(data || [])
    setLoading(false)
  }

  function startEdit(u) {
    setEditing(u.id)
    setEditName(u.username)
    setEditAdmin(u.is_admin)
    setMsg('')
  }

  async function saveEdit(userId) {
    if (!editName.trim()) { setMsg('El nombre no puede estar vacío'); return }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ username: editName.trim(), is_admin: editAdmin })
      .eq('id', userId)
    if (error) setMsg(error.message)
    else { setMsg('✓ Usuario actualizado'); setEditing(null) }
    await fetchUsers()
    setSaving(false)
  }

  async function deleteUser(userId, username) {
    if (userId === currentProfile?.id) { setMsg('No podés eliminarte a vos mismo'); return }
    if (!window.confirm(`¿Eliminar al usuario "${username}"? Se borrarán también todos sus pronósticos.`)) return
    setSaving(true)
    // Borrar predicciones primero
    await supabase.from('predictions').delete().eq('user_id', userId)
    // Borrar perfil (cascade borra el auth.user por el FK)
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) setMsg(error.message)
    else setMsg(`✓ Usuario "${username}" eliminado`)
    await fetchUsers()
    setSaving(false)
  }

  if (loading) return <div className="spinner" />

  return (
    <>
      {msg && (
        <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '12px' }}>
          {msg}
          <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}
      <div className="card">
        <div className="card-header">
          <span>{users.length} usuario{users.length !== 1 ? 's' : ''}</span>
        </div>
        {users.map(u => (
          <div key={u.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editing === u.id ? (
              // Modo edición
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  className="input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '140px', padding: '5px 8px', fontSize: '13px' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editAdmin} onChange={e => setEditAdmin(e.target.checked)} />
                  Admin
                </label>
                <button className="btn-sm" disabled={saving} onClick={() => saveEdit(u.id)}>
                  {saving ? '...' : 'Guardar'}
                </button>
                <button className="btn-sm" style={{ background: 'var(--gray-400)' }} onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              // Modo vista
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {u.username}
                    {u.is_admin && <span className="badge badge-admin" style={{ fontSize: '10px' }}>admin</span>}
                    {u.id === currentProfile?.id && <span className="badge badge-green" style={{ fontSize: '10px' }}>vos</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                    Registrado {new Date(u.created_at).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </div>
                </div>
                <button
                  className="btn-sm"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => startEdit(u)}
                >
                  Editar
                </button>
                {u.id !== currentProfile?.id && (
                  <button
                    className="btn-sm"
                    style={{ background: 'var(--red)', fontSize: '11px', padding: '4px 10px' }}
                    disabled={saving}
                    onClick={() => deleteUser(u.id, u.username)}
                  >
                    Eliminar
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Admin principal ──────────────────────────────────────
export default function AdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState('matches') // 'matches' | 'users'

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/partidos')
  }, [profile])

  return (
    <>
      <div className="card" style={{ marginBottom: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="badge badge-admin">ADMIN</span>
        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Panel de administración</span>
      </div>

      <div className="tabs card" style={{ marginBottom: '12px' }}>
        <button className={`tab-btn ${section === 'matches' ? 'active' : ''}`} onClick={() => setSection('matches')}>
          Resultados
        </button>
        <button className={`tab-btn ${section === 'users' ? 'active' : ''}`} onClick={() => setSection('users')}>
          Usuarios
        </button>
      </div>

      {section === 'matches' && <MatchesTab profile={profile} />}
      {section === 'users'   && <UsersTab currentProfile={profile} />}
    </>
  )
}
