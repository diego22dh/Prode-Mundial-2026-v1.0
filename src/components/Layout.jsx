import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const IconBall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
)
const IconTrophy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar-title">⚽ Mundial 2026</div>
          <div className="topbar-sub">Torneo de pronósticos</div>
        </div>
        <div className="topbar-right">
          {profile?.is_admin && (
            <button
              className="btn-logout"
              onClick={() => navigate('/admin')}
              style={{ background: 'rgba(201,162,39,.3)' }}
            >Admin</button>
          )}
          <div className="avatar" title={profile?.username}>{initials}</div>
          <button className="btn-logout" onClick={signOut}>Salir</button>
        </div>
      </header>

      <main className="container page">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${pathname === '/partidos' ? 'active' : ''}`}
          onClick={() => navigate('/partidos')}
        >
          <IconBall />
          <span className="nav-label">Partidos</span>
        </button>
        <button
          className={`nav-item ${pathname === '/tabla' ? 'active' : ''}`}
          onClick={() => navigate('/tabla')}
        >
          <IconTrophy />
          <span className="nav-label">Tabla</span>
        </button>
        <button
          className={`nav-item ${pathname === '/perfil' ? 'active' : ''}`}
          onClick={() => navigate('/perfil')}
        >
          <IconUser />
          <span className="nav-label">Perfil</span>
        </button>
      </nav>
    </>
  )
}
