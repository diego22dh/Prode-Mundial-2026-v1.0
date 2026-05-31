import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { flag } from '../lib/flags'

const PHASES = { group:'Fase de grupos', R32:'Ronda 32', R16:'Octavos', QF:'Cuartos', SF:'Semis', '3rd':'3er puesto', F:'Final' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' }) + ' ' +
    d.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })
}

function isClosedForBetting(matchDate) {
  return new Date(matchDate) <= new Date(Date.now() + 60 * 60 * 1000)
}

function ptsClass(pts) {
  return `pts-chip pts-${pts}`
}

function Team({ name }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{flag(name)}</span>
      <span>{name}</span>
    </span>
  )
}

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [tab, setTab] = useState('upcoming')

  const hasDrafts = Object.keys(drafts).length > 0

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: m, error: em } = await supabase
      .from('matches')
      .select('*')
      .order('match_date')

    if (em) console.error('Error matches:', em)
    setMatches(m || [])

    if (user) {
      const { data: p, error: ep } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

      if (ep) console.error('Error predictions:', ep)
      const pMap = {}
      ;(p || []).forEach(pr => { pMap[pr.match_id] = pr })
      setPredictions(pMap)
    }

    setLoading(false)
  }

  function handleDraft(matchId, side, val) {
    const num = val === '' ? '' : Math.max(0, Math.min(20, parseInt(val) || 0))
    setDrafts(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: num }
    }))
  }

  async function saveDrafts() {
    setSaving(true)
    let count = 0
    for (const [matchId, { home, away }] of Object.entries(drafts)) {
      if (home === '' || away === '' || home === undefined || away === undefined) continue
      const existing = predictions[parseInt(matchId)]
      let error
      if (existing) {
        ({ error } = await supabase
          .from('predictions')
          .update({ pred_home: home, pred_away: away })
          .eq('user_id', user.id)
          .eq('match_id', matchId))
      } else {
        ({ error } = await supabase
          .from('predictions')
          .insert({ user_id: user.id, match_id: parseInt(matchId), pred_home: home, pred_away: away }))
      }
      if (!error) count++
    }
    setDrafts({})
    setSavedCount(count)
    setTimeout(() => setSavedCount(0), 3000)
    await fetchAll()
    setSaving(false)
  }

  const grouped = {}
  const filteredMatches = matches.filter(m =>
    tab === 'upcoming' ? m.status !== 'finished' : m.status === 'finished'
  )
  filteredMatches.forEach(m => {
    const key = m.group_name ? `Grupo ${m.group_name}` : PHASES[m.phase] || m.phase
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  if (loading) return <div className="spinner" />

  return (
    <>
      <div className="tabs card" style={{ marginBottom: '12px' }}>
        <button className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
          Próximos
        </button>
        <button className={`tab-btn ${tab === 'finished' ? 'active' : ''}`} onClick={() => setTab('finished')}>
          Jugados
        </button>
      </div>

      {Object.entries(grouped).length === 0 && (
        <div className="empty"><div className="empty-icon">📅</div>No hay partidos en esta sección.</div>
      )}

      {Object.entries(grouped).map(([group, groupMatches]) => (
        <div key={group} className="card" style={{ marginBottom: '12px' }}>
          <div className="group-header">{group}</div>
          {groupMatches.map(match => {
            const pred = predictions[match.id]
            const draft = drafts[match.id]
            const closed = isClosedForBetting(match.match_date)
            const finished = match.status === 'finished'

            return (
              <div key={match.id} className="match-card" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {/* Teams */}
                <div className="match-teams" style={{ minWidth: '180px' }}>
                  <Team name={match.home_team} />
                  <span className="match-vs">vs</span>
                  <Team name={match.away_team} />
                </div>

                {/* Result or prediction inputs */}
                {finished ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="score-result">
                      <span>{match.home_score}</span>
                      <span className="sep">-</span>
                      <span>{match.away_score}</span>
                    </div>
                    {pred && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                          {pred.pred_home}-{pred.pred_away}
                        </span>
                        <div className={ptsClass(pred.points)}>{pred.points}</div>
                      </div>
                    )}
                    {!pred && <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Sin prono.</span>}
                  </div>
                ) : closed ? (
                  pred ? (
                    <div style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 500 }}>
                      {pred.pred_home} - {pred.pred_away}
                    </div>
                  ) : (
                    <span className="badge badge-red">Cerrado</span>
                  )
                ) : (
                  <div className="score-inputs">
                    <input
                      className="score-input"
                      type="number" min="0" max="20"
                      placeholder={pred ? String(pred.pred_home) : '0'}
                      value={draft?.home ?? ''}
                      onChange={e => handleDraft(match.id, 'home', e.target.value)}
                    />
                    <span className="score-sep">-</span>
                    <input
                      className="score-input"
                      type="number" min="0" max="20"
                      placeholder={pred ? String(pred.pred_away) : '0'}
                      value={draft?.away ?? ''}
                      onChange={e => handleDraft(match.id, 'away', e.target.value)}
                    />
                  </div>
                )}

                <div className="match-date">{formatDate(match.match_date)}</div>
              </div>
            )
          })}
        </div>
      ))}

      {hasDrafts && (
        <div className="save-bar">
          <span>{Object.keys(drafts).length} pronóstico(s) sin guardar</span>
          <button onClick={saveDrafts} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
      {savedCount > 0 && !hasDrafts && (
        <div className="save-bar" style={{ background: 'var(--green-dark)' }}>
          <span>✓ {savedCount} pronóstico(s) guardados</span>
          <span />
        </div>
      )}
    </>
  )
}
