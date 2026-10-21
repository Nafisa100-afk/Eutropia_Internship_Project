import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, Loader2, Search } from 'lucide-react'

export type Load<T> = { data?: T; error?: string; loading: boolean; reload: () => void }
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []): Load<T> {
  const [s, setS] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    let live = true
    setS(p => ({ ...p, loading: true, error: undefined }))
    fn().then(data => live && setS({ data, loading: false }), (e: any) => live && setS({ error: e?.message || 'Something went wrong', loading: false }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n])
  const reload = useCallback(() => setN(x => x + 1), [])
  return { ...s, reload }
}

/** Loading / error / empty states, tarpor data render kore */
export function Async<T>({ s, empty, children }: { s: Load<T>; empty?: string; children: (d: T) => ReactNode }) {
  if (s.loading && s.data === undefined) return <div className="empty-state"><Loader2 size={25} className="spin" /><strong>Loading…</strong></div>
  if (s.error) return <div className="inline-result" role="alert"><AlertCircle size={19} /><div><strong>Could not load this data</strong><p>{s.error}</p><button className="button button-outline button-sm" onClick={s.reload}>Try again</button></div></div>
  const d = s.data as T
  if (empty && Array.isArray(d) && d.length === 0) return <div className="empty-state"><Search size={25} /><strong>{empty}</strong></div>
  return <>{children(d)}</>
}
