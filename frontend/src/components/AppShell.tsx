import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, X, LogOut, LayoutDashboard, ClipboardList, UserRound, CircleHelp, ShieldCheck, FilePlus2, Clock3, History } from 'lucide-react'
import Brand from './Brand'
import { roleNames } from '../data'
import { useAuth } from '../auth'
import type { Role } from '../lib/api'

type Item = { label: string; to: string; icon: typeof LayoutDashboard }
const navByRole: Record<Role, Item[]> = {
  citizen: [
    { label: 'Overview', to: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'My tickets', to: '/citizen/complaints', icon: ClipboardList },
    { label: 'New complaint', to: '/complaints/new', icon: FilePlus2 },
    { label: 'My profile', to: '/citizen/profile', icon: UserRound },
  ],
  agent: [
    { label: 'Overview', to: '/agent/dashboard', icon: LayoutDashboard },
    { label: 'Assigned tickets', to: '/agent/complaints', icon: ClipboardList },
    { label: 'SLA & deadlines', to: '/agent/deadlines', icon: Clock3 },
    { label: 'My profile', to: '/agent/profile', icon: UserRound },
  ],
  admin: [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All tickets', to: '/admin/complaints', icon: ClipboardList },
    { label: 'SLA & deadlines', to: '/admin/deadlines', icon: Clock3 },
    { label: 'My profile', to: '/admin/profile', icon: UserRound },
  ],
  mayor: [
    { label: 'Overview', to: '/mayor/dashboard', icon: LayoutDashboard },
    { label: 'All tickets', to: '/mayor/complaints', icon: ClipboardList },
    { label: 'SLA & deadlines', to: '/mayor/deadlines', icon: Clock3 },
    { label: 'My profile', to: '/mayor/profile', icon: UserRound },
  ],
}
const shared: Item[] = [
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Activity log', to: '/activity', icon: History },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const role = user!.role
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const all = [...navByRole[role], ...shared]
  const currentTitle = all.find(i => i.to === location.pathname)?.label ?? (location.pathname.includes('/complaints/') ? 'Ticket details' : 'Workspace')
  const signOut = () => { logout(); navigate('/') }
  const profilePath = `/${role}/profile`
  const Sidebar = () => (
    <>
      <div className="sidebar-brand"><Brand /></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navByRole[role].map(item => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{item.label}</span></NavLink> })}
      </nav>
      <div className="sidebar-bottom">
        {shared.map(item => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{item.label}</span></NavLink> })}
        <NavLink to="/about" className="side-link"><CircleHelp size={18} /><span>Help & guidance</span></NavLink>
        <div className="sidebar-help">
          <span className="help-icon"><ShieldCheck size={18} /></span>
          <strong>Your city, in the loop.</strong>
          <p>Every ticket has a status and a deadline.</p>
          <NavLink to="/track">Track a ticket <span>↗</span></NavLink>
        </div>
        <div className="sidebar-user"><NavLink to={profilePath} onClick={() => setMobileOpen(false)} className="user-link" title="Open my profile"><div className="avatar">{user!.name.slice(0, 1).toUpperCase()}</div><div className="user-meta"><strong>{user!.name}</strong><small>{roleNames[role]}</small></div></NavLink><button className="sign-out-btn" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} className="muted-icon" /></button></div>
      </div>
    </>
  )
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar"><Sidebar /></aside>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)}><aside className="mobile-sidebar" onClick={e => e.stopPropagation()}><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button><Sidebar /></aside></div>}
      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button><div className="breadcrumb"><span>City Connect</span><b>/</b><strong>{currentTitle}</strong></div></div>
          <div className="topbar-actions">
            <NavLink to="/notifications" className="top-icon" aria-label="Notifications"><Bell size={18} /><i /></NavLink>
            <NavLink to={profilePath} className="top-avatar" aria-label="My profile" title={`${user!.name} · My profile`}>{user!.name.slice(0, 1).toUpperCase()}</NavLink>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="app-footer"><span>© 2026 City Connect</span><span>Signed in as {user!.name} · {roleNames[role]}</span></footer>
      </main>
    </div>
  )
}
