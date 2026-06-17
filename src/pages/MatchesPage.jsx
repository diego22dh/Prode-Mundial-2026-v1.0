import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/authContext.jsx'
import { flagUrl } from '../lib/flags'
import { useRefresh } from '../lib/refreshContext.jsx'
import { useTournament } from '../hooks/useTournament'

const PHASES = { group:'Fase de grupos', R32:'Ronda de 16', R16:'Octavos', QF:'Cuartos', SF:'Semis', '3rd':'3er puesto', F:'Final' }

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

function isClosedForBetting(matchDate) {
  return new Date(matchDate) <= new Date(Date.now() + 10 * 60 * 1000)
}

function ptsClass(pts) { return `pts-chip pts-${pts}` }

function Team({ name }) {
  const url = flagUrl(name)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      {url && <img src={url} alt={name} width="24" height="18" style={{ borderRadius: '2px', flexShrink: 0 }} />}
      <span>{name}</span>
    </span>
  )
}

export default function MatchesPage() {
  const { user } = useAuth()
  const { triggerRefresh } = useRefresh()
  const { activeTournament } = useTournament(user?.id)
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [saveError, setSaveError] = useState(null)
  const [tab, setTab] = useState('upcoming')

  const hasDrafts = Object.keys(drafts).length > 0

  const fetchMatches = useCallback(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date')
    if (error) console.error('Error matches:', error)
    return data || []
  }, [])

  const fetchPredictions = useCallback(async (userId, tournamentId) => {
    if (!userId || !tournamentId) return {}
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('tournament_id', tournamentId)
    if (error) console.error('Error predictions:', error)
    const pMap = {}
    ;(data || []).forEach(pr => { pMap[pr.match_id] = pr })
    return pMap
  }, [])

  const activeTournamentId = activeTournament?.id

  useEffect(() => {
    console.log('[DIAG] useEffect disparado. user?.id:', user?.id, 'activeTournamentId:', activeTournamentId)
    if (!user?.id) { console.log('[DIAG] return — no hay user.id'); return }
    if (!activeTournamentId) { console.log('[DIAG] return — no hay activeTournamentId'); return }
    let cancelled = false
    async function load() {
      console.log('[DIAG] load() iniciado')
      setLoading(true)
      const [m, pMap] = await Promise.all([
        fetchMatches(),
        fetchPredictions(user.id, activeTournamentId)
      ])
      console.log('[DIAG] Promise.all resuelto. matches:', m.length, 'predictions:', Object.keys(pMap).length, 'cancelled:', cancelled)
      if (cancelled) { console.log('[DIAG] cancelado, no actualizo estado'); return }
      setMatches(m)
      setPredictions(pMap)
      setLoading(false)
      console.log('[DIAG] setLoading(false) ejecutado')
    }
    load()
    return () => {
      console.log('[DIAG] CLEANUP ejecutado — cancelled = true')
      cancelled = true
    }
  }, [user?.id, activeTournamentId, fetchMatches, fetchPredictions])

  function handleDraft(matchId, side, val) {
    if (side === 'classifier') {
      setDrafts(prev => ({ ...prev, [matchId]: { ...prev[matchId], classifier: val } }))
      return
    }
    const num = val === '' ? '' : Math.max(0, Math.min(20, parseInt(val) || 0))
    setDrafts(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: num }
    }))
  }

  async function saveDrafts() {
    setSaving(true)
    let count = 0
    let lastError = null
    const tid = activeTournament?.id
    if (!tid) {
      setSaveError('No hay torneo activo seleccionado')
      setSaving(false)
      return
    }
    try {
      const newPredictions = { ...predictions }

      for (const [matchId, draftVal] of Object.entries(drafts)) {
        const { home, away } = draftVal
        if (home === '' || away === '' || home === undefined || away === undefined) continue
        const mid = parseInt(matchId)
        const existing = predictions[mid]
        const classifier = draftVal?.classifier ?? null
        let error

        if (existing) {
          const result = await supabase
            .from('predictions')
            .update({ pred_home: home, pred_away: away, pred_classifier: classifier })
            .eq('user_id', user.id)
            .eq('match_id', mid)
            .eq('tournament_id', tid)
            .select()
          error = result.error
        } else {
          const result = await supabase
            .from('predictions')
            .insert({ user_id: user.id, match_id: mid, pred_home: home, pred_away: away, tournament_id: tid, pred_classifier: classifier })
            .select()
          error = result.error
        }

        if (error) {
          console.error('Error guardando predicción:', error)
          lastError = error
        } else {
          count++
          newPredictions[mid] = {
            ...(existing || {}),
            user_id: user.id,
            match_id: mid,
            pred_home: home,
            pred_away: away,
            tournament_id: tid,
            points: existing?.points ?? 0,
            scored_at: existing?.scored_at ?? null,
          }
        }
      }

      setPredictions(newPredictions)
      setDrafts({})
      setSavedCount(count)
      if (lastError) {
        setSaveError(`Error: ${lastError.message || lastError.code || JSON.stringify(lastError)}`)
      } else {
        setTimeout(() => setSavedCount(0), 3000)
      }
      triggerRefresh()
      setSaving(false)

      fetchPredictions(user.id, activeTournament?.id).then(pMap => setPredictions(pMap))
    } catch (err) {
      console.error('Error en saveDrafts:', err)
      setSaveError(`Error inesperado: ${err.message}`)
      setSaving(false)
    }
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

  if (!activeTournament) return (
    <div className="empty" style={{ paddingTop: '60px' }}>
      <div className="empty-icon">🏆</div>
      <p>Seleccioná un torneo para ver los partidos.</p>
      <p style={{ fontSize: '12px', marginTop: '6px' }}>Ir a la pestaña <strong>Torneos</strong></p>
    </div>
  )

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
            const hasSaved = pred != null
            const isEditing = draft?.home !== undefined || draft?.away !== undefined

            return (
              <div key={match.id} className="match-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '10px' }}>
                <div className="match-teams" style={{ minWidth: 0 }}>
                  <Team name={match.home_team} />
                  <span className="match-vs">vs</span>
                  <Team name={match.away_team} />
                </div>

                {finished ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="score-result">
                      <span>{match.home_score}</span>
                      <span className="sep">-</span>
                      <span>{match.away_score}</span>
                    </div>
                    {hasSaved && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                          {pred.pred_home}-{pred.pred_away}
                        </span>
                        <div className={ptsClass(pred.points)}>{pred.points}</div>
                      </div>
                    )}
                    {!hasSaved && <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Sin prono.</span>}
                  </div>

                ) : closed ? (
                  hasSaved ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: '#ede9fe', border: '1px solid #7c3aed',
                      borderRadius: '6px', padding: '3px 10px',
                      fontSize: '15px', fontWeight: 700, color: '#5b21b6'
                    }}>
                      {pred.pred_home}<span style={{ opacity: .5, fontSize: '12px' }}>-</span>{pred.pred_away}
                    </div>
                  ) : (
                    <span className="badge badge-red">Cerrado</span>
                  )

                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div className="score-inputs">
                      <input
                        className="score-input"
                        type="number" min="0" max="20"
                        value={draft?.home !== undefined ? draft.home : hasSaved ? pred.pred_home : ''}
                        onChange={e => handleDraft(match.id, 'home', e.target.value)}
                        style={isEditing
                          ? { borderColor: 'var(--green)', background: 'var(--green-light)' }
                          : hasSaved
                            ? { borderColor: 'var(--green)', background: 'var(--green-light)', fontWeight: 700 }
                            : {}}
                      />
                      <span className="score-sep">-</span>
                      <input
                        className="score-input"
                        type="number" min="0" max="20"
                        value={draft?.away !== undefined ? draft.away : hasSaved ? pred.pred_away : ''}
                        onChange={e => handleDraft(match.id, 'away', e.target.value)}
                        style={isEditing
                          ? { borderColor: 'var(--green)', background: 'var(--green-light)' }
                          : hasSaved
                            ? { borderColor: 'var(--green)', background: 'var(--green-light)', fontWeight: 700 }
                            : {}}
                      />
                    </div>
                    {match.phase !== 'group' && (() => {
                      const h = draft?.home !== undefined ? draft.home : hasSaved ? pred.pred_home : null
                      const a = draft?.away !== undefined ? draft.away : hasSaved ? pred.pred_away : null
                      const showclf = h !== null && a !== null && h !== '' && a !== '' && Number(h) === Number(a)
                      if (!showclf) return null
                      const savedClf = draft?.classifier ?? pred?.pred_classifier ?? ''
                      return (
                        <select
                          style={{
                            fontSize: '11px', padding: '3px 6px',
                            border: '1px solid #7c3aed', borderRadius: '6px',
                            background: '#ede9fe', color: '#5b21b6',
                            cursor: 'pointer', maxWidth: '140px'
                          }}
                          value={savedClf}
                          onChange={e => handleDraft(match.id, 'classifier', e.target.value)}
                        >
                          <option value="">¿Quién clasifica?</option>
                          <option value={match.home_team}>{match.home_team}</option>
                          <option value={match.away_team}>{match.away_team}</option>
                        </select>
                      )
                    })()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', width: '80px', flexShrink: 0 }}>
                  <div className="match-date" style={{ whiteSpace: 'nowrap' }}>{formatDate(match.match_date)}</div>
                  {match.venue && <div style={{ fontSize: '10px', color: 'var(--gray-400)', textAlign: 'right', lineHeight: 1.2, width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.venue.split(',')[0]}</div>}
                </div>
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
      {saveError && (
        <div className="save-bar" style={{ background: 'var(--red)' }}>
          <span style={{ fontSize: '12px' }}>{saveError}</span>
          <button onClick={() => setSaveError(null)}>✕</button>
        </div>
      )}
    </>
  )
}
