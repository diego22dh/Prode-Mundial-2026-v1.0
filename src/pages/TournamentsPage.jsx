import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTournament } from '../hooks/useTournament'

export default function TournamentsPage() {
  const { user } = useAuth()
  const {
    tournaments, activeTournament, setActiveTournament,
    requestCreate, joinTournament, leaveTournament,
    getMembership, loading, refresh
  } = useTournament(user?.id)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const active = tournaments.filter(t => t.status === 'active')
  const pending = tournaments.filter(t => t.status === 'pending' && t.created_by === user?.id)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true); setMsg('')
    const { error } = await requestCreate(name, desc)
    if (error) setMsg(error.message)
    else { setMsg('✓ Solicitud enviada. El admin debe aprobarlo.'); setName(''); setDesc(''); setShowCreate(false) }
    setBusy(false)
  }

  async function handleJoin(t) {
    setBusy(true)
    const { error } = await joinTournament(t.id)
    if (error) setMsg(error.message)
    else { setActiveTournament(t); setMsg(`✓ Te uniste a "${t.name}"`) }
    setBusy(false)
  }

  async function handleLeave(t) {
    if (!window.confirm(`¿Abandonar el torneo "${t.name}"?`)) return
    setBusy(true)
    await leaveTournament(t.id)
    setMsg(`Abandonaste "${t.name}"`)
    setBusy(false)
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

      {/* Torneo activo */}
      {activeTournament && (
        <div className="card" style={{ marginBottom: '12px', padding: '12px 16px', background: 'var(--green-light)', border: '1px solid var(--green)' }}>
          <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600, marginBottom: '2px' }}>TORNEO ACTIVO</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-800)' }}>{activeTournament.name}</div>
          {activeTournament.description && <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{activeTournament.description}</div>}
        </div>
      )}

      {/* Lista de torneos activos */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">
          <span>Torneos disponibles</span>
          <span style={{ fontSize: '12px', fontFamily: 'inherit', fontWeight: 400, color: 'var(--gray-400)' }}>{active.length} torneos</span>
        </div>

        {active.length === 0 && (
          <div className="empty"><div className="empty-icon">🏆</div>No hay torneos activos todavía.</div>
        )}

        {active.map(t => {
          const membership = getMembership(t.id)
          const isActive = activeTournament?.id === t.id

          return (
            <div key={t.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t.name}
                  {isActive && <span className="badge badge-green" style={{ fontSize: '10px' }}>activo</span>}
                </div>
                {t.description && <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{t.description}</div>}
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                  Creado por {t.profiles?.username}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {!membership ? (
                  <button className="btn-sm" disabled={busy} onClick={() => handleJoin(t)}>
                    Unirme
                  </button>
                ) : (
                  <>
                    {!isActive && (
                      <button className="btn-sm" style={{ background: 'var(--green)' }} onClick={() => setActiveTournament(t)}>
                        Seleccionar
                      </button>
                    )}
                    <button className="btn-sm" style={{ background: 'var(--gray-400)' }} disabled={busy} onClick={() => handleLeave(t)}>
                      Salir
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Solicitudes pendientes del usuario */}
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="card-header">Mis solicitudes pendientes</div>
          {pending.map(t => (
            <div key={t.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{t.name}</div>
                {t.description && <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{t.description}</div>}
              </div>
              <span className="badge badge-gold">Pendiente</span>
            </div>
          ))}
        </div>
      )}

      {/* Crear torneo */}
      {!showCreate ? (
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + Solicitar nuevo torneo
        </button>
      ) : (
        <div className="card" style={{ padding: '16px' }}>
          <div className="card-header" style={{ margin: '-16px -16px 14px', padding: '10px 16px' }}>Solicitar nuevo torneo</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input className="input" placeholder="Nombre del torneo (ej: Trabajo, Familia)" value={name} onChange={e => setName(e.target.value)} required />
            <input className="input" placeholder="Descripción (opcional)" value={desc} onChange={e => setDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" type="submit" disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                style={{ flex: 1, background: 'var(--gray-200)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </form>
          <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '8px' }}>
            El torneo quedará pendiente hasta que el admin lo apruebe.
          </p>
        </div>
      )}
    </>
  )
}
