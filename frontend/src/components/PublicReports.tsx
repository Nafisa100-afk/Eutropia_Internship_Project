import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, CircleHelp, Construction, Droplets, Lightbulb, MapPin, Search, Trash2 } from 'lucide-react'
import { api, CATEGORIES, DONE, fmtDay, type Ticket } from '../lib/api'
import { useLoad, Async } from '../hooks'
import StatusBadge from './StatusBadge'

export const CATEGORY_ICON: Record<string, typeof Construction> = {
  roads: Construction, drainage: Droplets, waste: Trash2, lighting: Lightbulb, other: CircleHelp,
}

type Props = {
  /** 'done' hole shudhu resolved / closed report dekhay */
  mode?: 'all' | 'done'
  /** Koyta card dekhabe (na dile shob) */
  limit?: number
  /** Search box + status filter dekhabe */
  searchable?: boolean
  /** Category filter URL e (?category=roads) rakhbe, jate link share kora jay */
  syncUrl?: boolean
}

/** Public (login chhara) report list: category chip filter shoho */
export default function PublicReports({ mode = 'all', limit, searchable = false, syncUrl = false }: Props) {
  const [sp, setSp] = useSearchParams()
  const [localCat, setLocalCat] = useState('all')
  const [q, setQ] = useState('')
  const [state, setState] = useState<'all' | 'active' | 'done'>('all')
  const s = useLoad(() => api.publicReports({ status: mode === 'done' ? 'done' : undefined, limit: 200 }), [mode])

  const raw = syncUrl ? sp.get('category') || 'all' : localCat
  const cat = CATEGORIES.some(c => c.value === raw) ? raw : 'all'
  const pick = (v: string) => {
    if (!syncUrl) return setLocalCat(v)
    const n = new URLSearchParams(sp)
    if (v === 'all') n.delete('category'); else n.set('category', v)
    setSp(n, { replace: true })
  }

  return <div className="public-reports">
    <Async s={s} empty={mode === 'done' ? 'No resolved reports yet' : 'No reports yet'}>{rows => {
      const inState = (t: Ticket) => state === 'all' || (state === 'done') === DONE.includes(t.status)
      const base = rows.filter(t => inState(t) && `${t.title} ${t.summary} ${t.location} ${t.road} ${t.ward}`.toLowerCase().includes(q.toLowerCase()))
      const count = (v: string) => base.filter(t => v === 'all' || t.category === v).length
      const f = base.filter(t => cat === 'all' || t.category === cat)
      const shown = limit ? f.slice(0, limit) : f
      return <>
        {searchable && <div className="listing-tools public-tools">
          <label className="search-field"><Search size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by problem, road, place or ward" /></label>
          {mode === 'all' && <label className="select-filter"><select aria-label="Filter by progress" value={state} onChange={e => setState(e.target.value as typeof state)}><option value="all">All progress</option><option value="active">Still being handled</option><option value="done">Resolved</option></select></label>}
        </div>}
        <div className="chip-row" role="group" aria-label="Filter reports by category">
          {[{ value: 'all', label: 'All reports' }, ...CATEGORIES].map(c => {
            const Icon = CATEGORY_ICON[c.value]
            return <button key={c.value} type="button" aria-pressed={cat === c.value} className={`chip ${cat === c.value ? 'active' : ''}`} onClick={() => pick(c.value)}>{Icon && <Icon size={14} />}{c.label}<b>{count(c.value)}</b></button>
          })}
        </div>
        {shown.length ? <div className="report-grid">{shown.map(c => {
          const Icon = CATEGORY_ICON[c.category] ?? CircleHelp
          const where = [c.ward ? `Ward ${c.ward}` : '', c.road, c.location].filter(Boolean).join(' · ')
          return <article className="report-card" key={c.id}>
            <div className="report-card-top"><span className={`cat-pill cat-${c.category}`}><Icon size={13} />{c.categoryLabel}</span><StatusBadge status={c.status} /></div>
            <h3>{c.title}</h3>
            <p className="report-text">{c.summary}</p>
            <p className="resolved-meta"><MapPin size={13} />{where || 'Place not given'}</p>
            <div className="resolved-foot"><span><CalendarDays size={14} /> {fmtDay(c.incidentDate || c.date)}</span><span>#{c.id}</span></div>
          </article>
        })}</div> : <div className="empty-state"><Search size={25} /><strong>No reports match this filter</strong><p>Try another category or clear the search.</p></div>}
        {limit && f.length > shown.length && <p className="list-more">Showing the latest {shown.length} of {f.length}.</p>}
      </>
    }}</Async>
  </div>
}
