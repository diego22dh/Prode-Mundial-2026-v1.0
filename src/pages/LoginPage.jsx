import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/partidos') }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) setError(error.message)
    } else {
      if (!username.trim()) { setError('El nombre de usuario es obligatorio'); setLoading(false); return }
      const { error } = await signUpWithEmail(email, password, username)
      if (error) setError(error.message)
      else setInfo('Revisá tu email para confirmar el registro.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--gray-100)' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>⚽</div>
        <h1 className="bebas" style={{ fontSize: '32px', color: 'var(--green)', lineHeight: 1 }}>Mundial 2026</h1>
        <p style={{ fontSize: '14px', color: 'var(--gray-400)', marginTop: '4px' }}>Torneo de pronósticos</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '24px' }}>
        {/* Tabs */}
        <div className="tabs" style={{ margin: '-24px -24px 20px', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
          <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setInfo('') }}>
            Ingresar
          </button>
          <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); setInfo('') }}>
            Registrarse
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {info  && <div className="alert alert-success">{info}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mode === 'register' && (
            <input className="input" type="text" placeholder="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} required />
          )}
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center' }}>
        USA · CANADA · MEXICO — Junio/Julio 2026
      </p>
    </div>
  )
}
