import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RefreshProvider } from './lib/refreshContext.jsx'
import { AuthProvider, useAuth } from './lib/authContext.jsx'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import MatchesPage from './pages/MatchesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import TournamentsPage from './pages/TournamentsPage'
import ReglamentoPage from './pages/ReglamentoPage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/partidos" replace />} />
              <Route path="partidos" element={<MatchesPage />} />
              <Route path="tabla" element={<LeaderboardPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="torneos" element={<TournamentsPage />} />
              <Route path="reglamento" element={<ReglamentoPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RefreshProvider>
    </AuthProvider>
  )
}
