import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
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

        <button className="btn-google" onClick={signInWithGoogle} style={{ marginBottom: '16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className="divider">o</div>

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
