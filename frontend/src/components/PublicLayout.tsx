import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Brand from './Brand'
import { useAuth } from '../auth'
import { roleHome } from '../data'

export default function PublicLayout() {
  const { user } = useAuth()
  return <div className="public-shell">
    <header className="public-header"><Brand />
      <nav className="public-nav"><NavLink to="/about">About</NavLink><NavLink to="/resolved-complaints">Resolved complaints</NavLink><NavLink to="/track">Track a ticket</NavLink></nav>
      <div className="public-actions">
        {user ? <Link className="button button-quiet sign-in-link" to={roleHome[user.role]}>My workspace</Link> : <Link className="button button-quiet sign-in-link" to="/login" aria-label="Sign in to City Connect">Sign in</Link>}
        <Link className="button button-primary" to="/complaints/new">Report an issue <ArrowUpRight size={16} /></Link>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="public-footer"><div className="footer-main"><Brand /><p>A more connected way to care for the place we call home.</p><div className="footer-links"><Link to="/about">About City Connect</Link><Link to="/track">Track a ticket</Link><Link to="/login">Sign in</Link></div></div><div className="footer-bottom"><span>© 2026 City Connect</span><span>Clear updates. Stronger communities.</span></div></footer>
  </div>
}
