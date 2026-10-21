const LABEL: Record<string, string> = { OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CLOSED: 'Closed' }
const CLS: Record<string, string> = { OPEN: 'submitted', ASSIGNED: 'under-review', IN_PROGRESS: 'in-progress', RESOLVED: 'resolved', CLOSED: 'closed' }

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${CLS[status] ?? 'closed'}`}><span className="status-dot" />{LABEL[status] ?? status}</span>
}

export const PriorityBadge = ({ priority }: { priority: string }) => <span className={`priority priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
