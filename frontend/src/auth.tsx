import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { session, detectRole, type Role } from './lib/api'

export type User = { role: Role; name: string }
type Ctx = { user: User | null; login: (u: User) => void; logout: () => void }
const AuthCtx = createContext<Ctx>({ user: null, login: () => {}, logout: () => {} })
export const useAuth = () => useContext(AuthCtx)

const KEY = 'cc_user'
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return session.access ? JSON.parse(sessionStorage.getItem(KEY) || 'null') : null } catch { return null }
  })
  const login = (u: User) => { sessionStorage.setItem(KEY, JSON.stringify(u)); setUser(u) }
  const logout = () => { session.clear(); setUser(null) }
  useEffect(() => {
    const expired = () => setUser(null)
    window.addEventListener('cc-auth-expired', expired)
    return () => window.removeEventListener('cc-auth-expired', expired)
  }, [])
  // Page reload e role abar verify kori (agent pore admin hole, ba notun ticket ashar por)
  useEffect(() => {
    if (!user) return
    detectRole().then(role => { if (role !== user.role) login({ ...user, role }) }, () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

export function Protected({ allowed, children }: { allowed: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!allowed.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}
