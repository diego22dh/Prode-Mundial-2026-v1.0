import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [myStats, setMyStats] = useState(null)

  useEffect(() => {
    if (profile) setUsername(profile.username || '')
    fetchStats()
  }, [profile])

  async function fetchStats() {
    if (!user) return
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setMyStats(data)
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!username.trim()) return
    setSaving(true); setMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id)
    setMsg(error ? error.message : '✓ Guardado')
    setSaving(false)
  }

  return (
    <>
      {myStats && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="card-header">Mi resumen</div>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-val">{myStats.total_points}</div>
              <div className="stat-lbl">Puntos</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">#{myStats.position}</div>
              <div className="stat-lbl">Posición</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{myStats.exact_results}</div>
              <div className="stat-lbl">Exactos</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '0 16px 14px', textAlign: 'center' }}>
            <div className="stat-box">
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)' }}>{myStats.correct_diff}</div>
              <div className="stat-lbl">Dif. correcta</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)' }}>{myStats.correct_winner}</div>
              <div className="stat-lbl">Ganador ok</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)' }}>{myStats.wrong}</div>
              <div className="stat-lbl">Errados</div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '20px' }}>
        <div className="card-header" style={{ margin: '-20px -20px 16px', padding: '12px 20px' }}>Mi perfil</div>
        {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px', display: 'block' }}>Email</label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: .6 }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px', display: 'block' }}>Nombre de usuario</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tu nombre" required />
          </div>
          <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '4px' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Points legend */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div className="card-header">Sistema de puntos</div>
        {[
          { pts: 3, label: 'Resultado exacto', eg: 'Pronosticás 2-1, sale 2-1' },
          { pts: 2, label: 'Ganador + diferencia', eg: 'Pronosticás 3-1, sale 2-0' },
          { pts: 1, label: 'Solo ganador/empate', eg: 'Pronosticás 2-0, sale 1-0' },
          { pts: 0, label: 'Sin acierto', eg: 'Pronosticás empate, gana alguien' },
        ].map(({ pts, label, eg }) => (
          <div key={pts} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}>
            <div className={`pts-chip pts-${pts}`} style={{ minWidth: '32px' }}>{pts}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{eg}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
