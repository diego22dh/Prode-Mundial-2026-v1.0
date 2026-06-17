import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/authContext.jsx'
import { useDarkMode } from '../hooks/useDarkMode'
import { useNextMatch } from '../hooks/useNextMatch'
import { flagUrl } from '../lib/flags'

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
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

function formatBsAs(iso, opts) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', ...opts
  })
}

function NextMatchBanner({ userId }) {
  const { nextMatch, myPred } = useNextMatch(userId)
  const navigate = useNavigate()

  if (!nextMatch) return null

  const matchTime = formatBsAs(nextMatch.match_date, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  const homeFlag = flagUrl(nextMatch.home_team)
  const awayFlag = flagUrl(nextMatch.away_team)

  return (
    <div
      onClick={() => navigate('/partidos')}
      style={{
        background: 'rgba(0,0,0,.25)',
        padding: '8px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        borderTop: '1px solid rgba(255,255,255,.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#fff', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', opacity: .7, whiteSpace: 'nowrap' }}>PRÓXIMO</span>
        {homeFlag && <img src={homeFlag} width="18" height="14" style={{ borderRadius: '2px' }} alt="" />}
        <span style={{ fontWeight: 500 }}>{nextMatch.home_team}</span>
        <span style={{ opacity: .5 }}>vs</span>
        {awayFlag && <img src={awayFlag} width="18" height="14" style={{ borderRadius: '2px' }} alt="" />}
        <span style={{ fontWeight: 500 }}>{nextMatch.away_team}</span>
        <span style={{ opacity: .6, fontSize: '11px' }}>{matchTime}</span>
      </div>

    </div>
  )
}

export default function Layout() {
  const { profile, user, signOut } = useAuth()
  const [dark, setDark] = useDarkMode()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <header className="topbar" style={{ flexDirection: 'column', height: 'auto', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '56px', width: '100%' }}>
          <div>
            <div className="topbar-title">⚽ Mundial 2026</div>
            <div className="topbar-sub">Torneo de pronósticos</div>
          </div>
          <div className="topbar-right">
            {profile?.is_admin && (
              <button className="btn-logout" onClick={() => navigate('/admin')} style={{ background: 'rgba(201,162,39,.3)' }}>
                Admin
              </button>
            )}
            <button
              onClick={() => setDark(d => !d)}
              style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            <div className="avatar" title={profile?.username}>{initials}</div>
            <button className="btn-logout" onClick={signOut}>Salir</button>
          </div>
        </div>
        <NextMatchBanner userId={user?.id} />
      </header>

      <main className="container page">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${pathname === '/partidos' ? 'active' : ''}`} onClick={() => navigate('/partidos')}>
          <IconBall /><span className="nav-label">Partidos</span>
        </button>
        <button className={`nav-item ${pathname === '/tabla' ? 'active' : ''}`} onClick={() => navigate('/tabla')}>
          <IconTrophy /><span className="nav-label">Tabla</span>
        </button>
        <button className={`nav-item ${pathname === '/torneos' ? 'active' : ''}`} onClick={() => navigate('/torneos')}>
          <IconGrid /><span className="nav-label">Torneos</span>
        </button>
        <button className={`nav-item ${pathname === '/reglamento' ? 'active' : ''}`} onClick={() => navigate('/reglamento')}>
          <IconBook /><span className="nav-label">Reglas</span>
        </button>
        <button className={`nav-item ${pathname === '/perfil' ? 'active' : ''}`} onClick={() => navigate('/perfil')}>
          <IconUser /><span className="nav-label">Perfil</span>
        </button>
      </nav>
    </>
  )
}
