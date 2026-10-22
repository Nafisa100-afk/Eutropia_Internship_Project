import { ArrowUpRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fmt, slaState, type Ticket } from '../lib/api'
import StatusBadge, { PriorityBadge } from './StatusBadge'

export default function ComplaintTable({ rows, base, compact = false }: { rows: Ticket[]; base: string; compact?: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Ticket</th><th>Category</th>{!compact && <th>Ward / location</th>}<th>Priority</th><th>Status</th><th>Date</th>{!compact && <th>SLA deadline</th>}<th /></tr></thead>
        <tbody>
          {rows.map(row => <tr key={row.id}>
            <td><Link className="complaint-title" to={`${base}/${row.id}`}>{row.title}<small>#{row.id} · {row.customer}</small></Link></td>
            <td>{row.categoryLabel}</td>
            {!compact && <td className="place-cell"><strong>{row.ward ? `Ward ${row.ward}` : '—'}</strong><small>{[row.road, row.location].filter(Boolean).join(' · ')}</small></td>}
            <td><PriorityBadge priority={row.priority} /></td>
            <td><StatusBadge status={row.status} /></td>
            <td className="date-cell" title="Date of the issue">{row.incidentDate || row.date}</td>
            {!compact && <td className="date-cell"><Clock3 size={11} /> {fmt(row.deadline)} <small className={slaState(row) === 'Overdue' || slaState(row) === 'Breached' ? 'sla-bad' : ''}>{['Overdue', 'Breached'].includes(slaState(row)) ? `(${slaState(row)})` : ''}</small></td>}
            <td><Link className="icon-link" aria-label={`Open ticket ${row.id}`} to={`${base}/${row.id}`}><ArrowUpRight size={16} /></Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  )
}
