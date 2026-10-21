import { Link } from 'react-router-dom'
import { Building2, ArrowUpRight } from 'lucide-react'

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="City Connect home">
      <span className="brand-mark"><Building2 size={21} strokeWidth={2.1} /></span>
      {!compact && <span className="brand-copy"><strong>city<span>connect</span></strong><small>Better streets. Better service.</small></span>}
      {compact && <span className="brand-short">City Connect</span>}
    </Link>
  )
}

export function PageLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="inline-link">{children}<ArrowUpRight size={15} /></Link>
}
