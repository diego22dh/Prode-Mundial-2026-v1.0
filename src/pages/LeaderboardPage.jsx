import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTournament } from '../hooks/useTournament'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { activeTournament } = useTournament(user?.id)
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (activeTournament) fetchData() }, [activeTournament])

  async function fetchData() {
    const [{ data: lb }, { data: st }] = await Promise.all([
      supabase.from('leaderboard').select('*').eq('tournament_id', activeTournament.id).order('position'),
      supabase.from('predictions').select('points, scored_at').eq('tournament_id', activeTournament.id).not('scored_at', 'is', null)
    ])
    setRows(lb || [])
    if (st) {
      const total = st.length
      const exact = st.filter(p => p.points === 3).length
      const avgPts = total > 0 ? (st.reduce((a, b) => a + b.points, 0) / total).toFixed(1) : 0
      setStats({ total, exact, avgPts })
    }
    setLoading(false)
  }

  function posClass(pos) {
    if (pos === 1) return 'gold'
    if (pos === 2) return 'silver'
    if (pos === 3) return 'bronze'
    return ''
  }

  if (!activeTournament) return (
    <div className="empty" style={{ paddingTop: '60px' }}>
      <div className="empty-icon">🏆</div>
      <p>Seleccioná un torneo para ver la tabla.</p>
    </div>
  )

  if (loading) return <div className="spinner" />

  return (
    <>
      {stats && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-val">{rows.length}</div>
              <div className="stat-lbl">Jugadores</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{stats.total}</div>
              <div className="stat-lbl">Pronósticos</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{stats.exact}</div>
              <div className="stat-lbl">Exactos</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span>Tabla — {activeTournament.name}</span>
          {rows.length > 0 && <span style={{ fontSize: '12px', fontFamily: 'inherit', fontWeight: 400 }}>
            Promedio: {stats?.avgPts} pts
          </span>}
        </div>

        {rows.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🏆</div>
            Todavía no hay puntos registrados.
          </div>
        )}

        {rows.map(row => (
          <div key={row.user_id} className={`lb-row ${row.user_id === user?.id ? 'me' : ''}`}>
            <div className={`lb-pos ${posClass(row.position)}`}>{row.position}</div>
            <div>
              <div className="lb-name">
                {row.username}
                {row.user_id === user?.id && (
                  <span className="badge badge-green" style={{ marginLeft: '6px', fontSize: '10px' }}>vos</span>
                )}
              </div>
              <div className="lb-sub">
                {row.exact_results} exactos · {row.correct_winner} ganador · {row.total_scored} jugados
              </div>
            </div>
            <div className="lb-pts">{row.total_points}</div>
          </div>
        ))}
      </div>
    </>
  )
}
