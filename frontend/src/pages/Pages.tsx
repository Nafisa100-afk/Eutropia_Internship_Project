import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock3, FileText, MapPin, ShieldCheck, Sparkles, Users, Building2, Search, CircleHelp, AlertCircle, Plus, Filter, CalendarDays, TrendingUp, Activity, Lightbulb, Droplets, Trash2, Construction, LockKeyhole, Mail, Eye, EyeOff, Bell, History } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'
import { api, fmt, isOverdue, slaState, trendOf, STATUSES, PRIORITIES, DONE, type Ticket } from '../lib/api'
import type { Role } from '../lib/api'
import { roleHome, roleNames } from '../data'
import { useAuth } from '../auth'
import { useLoad, Async } from '../hooks'
import ComplaintTable from '../components/ComplaintTable'
import StatusBadge, { PriorityBadge } from '../components/StatusBadge'
import Brand from '../components/Brand'

const categories = [
  { name: 'Roads & footpaths', detail: 'Potholes, damaged sidewalks and street surfaces', icon: Construction, color: 'peach' },
  { name: 'Drainage & water', detail: 'Blocked drains, waterlogging and leaks', icon: Droplets, color: 'blue' },
  { name: 'Waste management', detail: 'Missed pickups and public cleanliness', icon: Trash2, color: 'green' },
  { name: 'Street lighting', detail: 'Broken streetlights and dark public areas', icon: Lightbulb, color: 'gold' },
]

export function HomePage() {
  return <div className="home-page">
    <section className="hero-section">
      <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY SERVICE, MADE CLEARER</span>
        <h1>Your city.<br /><em>Your voice.</em><br />Real progress.</h1>
        <p className="hero-description">Report local issues, follow the updates, and help make everyday city services work better for everyone.</p>
        <div className="hero-buttons"><Link className="button button-primary button-large" to="/complaints/new">Report a problem <ArrowRight size={17} /></Link><Link className="button button-outline button-large" to="/track">Track a complaint <Search size={17} /></Link><Link className="button button-quiet button-large" to="/login">Sign in <ArrowRight size={17} /></Link></div>
        <div className="hero-trust"><div className="trust-avatars"><span>CC</span><span>✓</span><span>↗</span></div><span><strong>One place to stay informed.</strong><br />From report to resolution.</span></div>
      </div>
      <div className="hero-art">
        <div className="hero-art-label"><span className="live-dot" /> A clearer view of local progress</div>
        <div className="city-illustration" aria-label="Illustration of a connected city" role="img">
          <div className="sun-orb" /><div className="cloud cloud-one" /><div className="cloud cloud-two" />
          <div className="building building-one"><i /><i /><i /><i /><i /><i /></div><div className="building building-two"><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="building building-three"><i /><i /><i /><i /></div>
          <div className="tree tree-one"><i /><b /></div><div className="tree tree-two"><i /><b /></div><div className="street"><span /><span /></div>
          <div className="floating-note note-top"><span className="note-icon mint"><Check size={17} /></span><span><strong>Issue resolved</strong><small>Streetlight repaired</small></span><b>✓</b></div>
          <div className="floating-note note-bottom"><span className="note-icon sand-icon"><MapPin size={17} /></span><span><strong>Stay in the loop</strong><small>Updates, all in one place</small></span><ArrowUpRight size={17} /></div>
          <div className="art-stamp"><Building2 size={21} /><span>LOCAL<br />MATTERS</span></div>
        </div>
        <div className="hero-art-caption"><span>01 — LISTEN</span><span>02 — ACT</span><span>03 — IMPROVE</span></div>
      </div>
    </section>
    <section className="intro-strip"><div><span className="eyebrow">A BETTER WAY TO CONNECT</span><h2>Small reports.<br /><em>Meaningful change.</em></h2></div><p>City Connect brings residents and city service teams into one simple process. Share what needs attention, get a ticket number, and follow progress without the guesswork.</p><Link className="text-arrow" to="/about">How it works <ArrowRight size={16} /></Link></section>
    <section className="services-section"><div className="section-heading"><div><span className="eyebrow">WHAT NEEDS ATTENTION?</span><h2>Let’s take care of <em>our neighbourhood.</em></h2></div><p>Pick what needs attention to get started. Add a clear description and a priority when reporting.</p></div>
      <div className="service-grid">{categories.map((cat, i) => { const Icon = cat.icon; return <Link to="/complaints/new" key={cat.name} className={`service-card service-${cat.color}`}><span className="service-icon"><Icon size={22} /></span><span className="service-index">0{i+1}</span><h3>{cat.name}</h3><p>{cat.detail}</p><span className="service-arrow"><ArrowUpRight size={18} /></span></Link> })}</div>
    </section>
    <section className="steps-section"><div className="steps-intro"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>From concern to <em>clear next steps.</em></h2><p>Reporting should feel straightforward. Here’s how City Connect keeps the process easy to follow.</p><Link className="text-arrow" to="/track">Already reported an issue? Track it <ArrowRight size={16} /></Link></div>
      <div className="steps-list"><div className="step-item"><span>01</span><div><h3>Tell us what’s happening</h3><p>Share a clear subject and description, and choose a priority.</p></div><FileText size={21} /></div><div className="step-item"><span>02</span><div><h3>Keep your ticket number</h3><p>Use it to check the status of your ticket any time.</p></div><Search size={21} /></div><div className="step-item"><span>03</span><div><h3>Follow the progress</h3><p>See when a ticket is assigned, underway, or resolved.</p></div><CheckCircle2 size={21} /></div></div>
    </section>
    <section className="cta-band"><div className="cta-symbol"><Sparkles size={25} /></div><div><span className="eyebrow">YOUR COMMUNITY COUNTS</span><h2>Noticed something? <em>Let’s make it better.</em></h2><p>A clear report can help the right team understand what needs attention.</p></div><Link to="/complaints/new" className="button button-dark">Make a report <ArrowRight size={17} /></Link></section>
  </div>
}

export function AboutPage() {
  return <div className="public-page narrow-public"><span className="eyebrow">ABOUT CITY CONNECT</span><h1>Better service starts with <em>a clearer conversation.</em></h1><p className="lead">City Connect is designed to make local service requests easier to report, easier to follow, and easier for responsible teams to manage.</p>
    <div className="about-feature-grid"><article><span className="feature-icon peach"><FileText /></span><h3>One clear report</h3><p>Describe an issue and share where it is happening, so the responsible team has a useful starting point.</p></article><article><span className="feature-icon green"><Activity /></span><h3>Visible progress</h3><p>Use your ticket number to follow status updates, with a clear deadline for every ticket.</p></article><article><span className="feature-icon blue"><Users /></span><h3>Connected teams</h3><p>Role-based workspaces help authorized staff review, assign, and manage service requests.</p></article></div>
    <div className="privacy-callout"><ShieldCheck size={22} /><div><strong>Privacy is part of the design.</strong><p>You only see your own tickets. Staff see only what their role allows, and the server enforces it.</p></div></div>
    <Link className="button button-primary" to="/complaints/new">Report an issue <ArrowRight size={17} /></Link>
  </div>
}

const base = (role: Role) => `/${role}/complaints`

function NeedLogin({ what }: { what: string }) {
  return <div className="public-page form-page"><div className="success-panel"><span className="success-mark"><LockKeyhole size={30} /></span><span className="eyebrow">SIGN IN REQUIRED</span><h1>Please <em>sign in first.</em></h1><p>{what}</p><div className="not-found-actions"><Link className="button button-primary" to="/login">Sign in <ArrowRight size={16} /></Link><Link className="button button-outline" to="/register">Create a citizen account</Link></div></div></div>
}

export function NewComplaintPage() {
  const { user } = useAuth()
  const [f, setF] = useState({ subject: '', description: '', priority: 'medium' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Ticket>()
  if (!user) return <NeedLogin what="Sign in as a citizen to submit a complaint. Your tickets are linked to your account, so you can follow them later." />
  if (user.role !== 'citizen') return <div className="public-page form-page"><div className="success-panel"><span className="eyebrow">CITIZENS ONLY</span><h1>Staff accounts <em>manage tickets.</em></h1><p>Only citizen accounts can submit new complaints.</p><Link className="button button-primary" to={roleHome[user.role]}>Go to my workspace</Link></div></div>
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const x: Record<string, string> = {}
    if (f.subject.trim().length < 5) x.subject = 'Subject needs at least 5 characters.'
    if (f.description.trim().length < 20) x.description = 'Please describe the issue in at least 20 characters.'
    setErr(x); if (Object.keys(x).length) return
    setBusy(true)
    try { setDone(await api.submit({ subject: f.subject.trim(), description: f.description.trim(), priority: f.priority })); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    catch (er: any) { setErr({ form: er.message }) }
    setBusy(false)
  }
  if (done) return <div className="public-page form-page"><div className="success-panel"><span className="success-mark"><CheckCircle2 size={32} /></span><span className="eyebrow">COMPLAINT SUBMITTED</span><h1>Thank you. Your report <em>is in.</em></h1><p>Keep your ticket number to follow the progress. You can also find it under My tickets.</p><div className="tracking-example"><span>Your ticket number</span><strong>#{done.id}</strong><small>Priority: {done.priority}</small></div><div className="not-found-actions"><Link className="button button-primary" to={`/citizen/complaints/${done.id}`}>View ticket <ArrowRight size={16} /></Link><button className="button button-outline" onClick={() => { setDone(undefined); setF({ subject: '', description: '', priority: 'medium' }) }}>Create another report</button></div></div></div>
  return <div className="public-page form-page"><div className="form-heading"><span className="eyebrow">REPORT A LOCAL ISSUE</span><h1>Let’s get it on <em>the right track.</em></h1><p>Share the key details below. Please avoid including private information that is not needed to understand the issue.</p></div>
    <form className="surface-form" onSubmit={submit} noValidate>
      <div className="form-section-title"><span>01</span><div><h2>Issue details</h2><p>Tell us what needs attention.</p></div></div>
      <label className="field-label">Subject <span>*</span><input value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} placeholder="e.g. Streetlight not working on Road 7" />{err.subject && <span className="field-error" role="alert">{err.subject}</span>}</label>
      <label className="field-label">Description <span>*</span><textarea rows={5} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Describe what happened, where it is, when you noticed it and why it needs attention." />{err.description && <span className="field-error" role="alert">{err.description}</span>}</label>
      <label className="field-label">Priority <span>*</span><select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>{PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></label>
      <div className="privacy-callout form-privacy"><Clock3 size={20} /><div><strong>Resolution deadlines</strong><p>Deadline depends on priority: urgent 8 hours, high 24 hours, medium 48 hours, low 72 hours.</p></div></div>
      {err.form && <p className="field-error" role="alert">{err.form}</p>}
      <div className="form-actions"><span><span className="required-star">*</span> Required fields</span><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit report'} <ArrowRight size={17} /></button></div>
    </form>
  </div>
}

export function TrackPage() {
  const { user } = useAuth()
  const [id, setId] = useState('')
  const [res, setRes] = useState<Ticket>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!user) return <NeedLogin what="Sign in to look up the status of your tickets." />
  const go = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setRes(undefined)
    if (!/^\d+$/.test(id)) { setError('Enter your ticket number (digits only).'); return }
    setBusy(true)
    try { setRes(await api.complaint(id)) } catch (er: any) { setError(er.status === 404 ? 'We could not find that ticket in your account.' : er.message) }
    setBusy(false)
  }
  return <div className="public-page form-page track-page"><div className="track-art"><span className="track-art-icon"><Search size={28} /></span><div className="track-orbit orbit-a" /><div className="track-orbit orbit-b" /><span className="track-star">✦</span></div><span className="eyebrow">TICKET TRACKING</span><h1>Progress, without <em>the guesswork.</em></h1><p className="lead">Enter the ticket number you received when the complaint was submitted.</p>
    <form className="tracking-form" onSubmit={go} noValidate><label className="field-label">Ticket number<input value={id} inputMode="numeric" onChange={e => setId(e.target.value.trim())} placeholder="e.g. 12" autoComplete="off" /></label><button className="button button-primary button-large" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Check status'} <ArrowRight size={17} /></button><span className="tracking-hint"><LockKeyhole size={14} /> You can only look up tickets you are allowed to see.</span></form>
    {error && <p className="field-error" role="alert" style={{ marginTop: 14 }}>{error}</p>}
    {res && <section className="panel detail-panel" style={{ marginTop: 22, textAlign: 'left' }}><div className="panel-heading"><div><h2>#{res.id} · {res.title}</h2><p>Last update {res.updated}</p></div><StatusBadge status={res.status} /></div><div className="detail-facts"><div><span>Priority</span><strong><PriorityBadge priority={res.priority} /></strong></div><div><span>Assigned agent</span><strong>{res.agent ?? 'Not assigned yet'}</strong></div><div><span>Created</span><strong>{fmt(res.date)}</strong></div><div><span>SLA deadline</span><strong>{fmt(res.deadline)} · {slaState(res)}</strong></div></div></section>}
    <div className="track-help"><CircleHelp size={18} /><span><strong>Can’t find your ticket number?</strong><br />Open My tickets in your workspace to see all of your tickets.</span></div>
  </div>
}

export function ResolvedPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const s = useLoad(() => (user ? api.resolved() : Promise.resolve([] as Ticket[])), [user?.name])
  if (!user) return <NeedLogin what="Resolved tickets are available after you sign in." />
  return <div className="public-page listing-public"><span className="eyebrow">COMMUNITY PROGRESS</span><h1>Good work deserves <em>to be seen.</em></h1><p className="lead">Resolved and closed tickets visible to your account.</p><div className="listing-tools"><label className="search-field"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resolved tickets" /></label></div>
    <Async s={s} empty="No resolved tickets yet">{rows => { const f = rows.filter(c => `${c.title} ${c.summary}`.toLowerCase().includes(search.toLowerCase())); return f.length ? <div className="resolved-grid">{f.map(c => <article className="resolved-card" key={c.id}><span className="resolved-icon"><CheckCircle2 size={21} /></span><StatusBadge status={c.status} /><h3>{c.title}</h3><p>{c.summary.length > 110 ? c.summary.slice(0, 110) + '…' : c.summary}</p><div className="resolved-foot"><span><CalendarDays size={14} /> Reported {c.date}</span><span>#{c.id}</span></div></article>)}</div> : <div className="empty-state"><Search size={25} /><strong>No matching resolved tickets</strong><p>Try a different keyword.</p></div> }}</Async></div>
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!u.trim() || !p) { setError('Enter your username and password.'); return }
    setBusy(true)
    try { const r = await api.login(u.trim(), p); login(r); const from = (loc.state as any)?.from; navigate(from && from.startsWith(`/${r.role}`) ? from : roleHome[r.role as Role]) }
    catch (er: any) { setError(er.status === 401 ? 'Wrong username or password.' : er.message) }
    setBusy(false)
  }
  return <div className="auth-layout"><div className="auth-aside"><Brand /><div className="auth-aside-copy"><span className="eyebrow">ONE CITY. MANY HANDS.</span><h1>Good service is a <em>shared effort.</em></h1><p>Sign in to follow your reports or continue the work of making local services better.</p><div className="auth-quote"><span>“</span><p>Clear information helps every community move forward.</p></div></div><div className="auth-aside-bottom">City Connect · Community services</div></div>
    <div className="auth-main"><Link className="auth-back" to="/">← Back to homepage</Link><div className="auth-card"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to City Connect</h2><p className="muted-text">Citizens, support agents and administrators sign in here.</p>
      <form onSubmit={go} noValidate><label className="field-label">Username<div className="input-icon"><Mail size={17} /><input value={u} onChange={e => setU(e.target.value)} placeholder="Your username" autoComplete="username" /></div></label>
        <label className="field-label">Password<div className="input-icon"><LockKeyhole size={17} /><input type={show ? 'text' : 'password'} value={p} onChange={e => setP(e.target.value)} placeholder="Your password" autoComplete="current-password" /><button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button></form>
      <div className="auth-divider"><span>NEW TO CITY CONNECT?</span></div><Link className="button button-outline auth-submit" to="/register">Create a citizen account</Link></div></div></div>
}

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const go = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!f.username.trim() || !f.email.trim()) { setError('Username and email are required.'); return }
    if (f.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (f.password !== f.confirm) { setError('The two passwords do not match.'); return }
    setBusy(true)
    try {
      await api.register({ username: f.username.trim(), email: f.email.trim(), first_name: f.first_name.trim(), last_name: f.last_name.trim(), password: f.password })
      const r = await api.login(f.username.trim(), f.password); login(r); navigate(roleHome[r.role as Role])
    } catch (er: any) { setError(er.message) }
    setBusy(false)
  }
  return <div className="public-page form-page"><div className="form-heading"><span className="eyebrow">JOIN YOUR COMMUNITY</span><h1>Create your <em>citizen account.</em></h1><p>An account lets you submit complaints, follow your own tickets and receive updates.</p></div>
    <form className="surface-form" onSubmit={go} noValidate>
      <label className="field-label">Username <span>*</span><input value={f.username} onChange={set('username')} autoComplete="username" placeholder="Choose a username" /></label>
      <div className="form-two-col"><label className="field-label">First name<input value={f.first_name} onChange={set('first_name')} autoComplete="given-name" /></label><label className="field-label">Last name<input value={f.last_name} onChange={set('last_name')} autoComplete="family-name" /></label></div>
      <label className="field-label">Email address <span>*</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" /></label>
      <label className="field-label">Password <span>*</span><input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 8 characters" /></label>
      <label className="field-label">Confirm password <span>*</span><input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Enter your password again" /></label>
      <div className="privacy-callout form-privacy"><ShieldCheck size={20} /><div><strong>Staff access is assigned separately.</strong><p>Registration creates citizen access only. Agents and administrators are created by a system administrator.</p></div></div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={17} /></button>
    </form></div>
}

const heading = { citizen: ['YOUR CITY CONNECT', 'Your tickets, at a glance.', 'The reports you are following.'], agent: ['SERVICE DELIVERY', 'Let’s keep things moving.', 'Tickets assigned to you.'], admin: ['ADMINISTRATION', 'The platform, in good order.', 'All tickets in the system.'] } as Record<Role, string[]>

export function DashboardPage({ role }: { role: Role }) {
  const sum = useLoad(api.summary)
  const list = useLoad(api.complaints)
  const [eyebrow, title, desc] = heading[role]
  const m = sum.data
  const cards = m ? [
    { label: 'Open', value: m.open_tickets, note: 'Awaiting assignment', tone: 'sand' },
    { label: 'Assigned / in progress', value: (m.assigned_tickets ?? 0) + (m.in_progress_tickets ?? 0), note: 'Being worked on', tone: 'blue' },
    { label: 'Resolved / closed', value: (m.resolved_tickets ?? 0) + (m.closed_tickets ?? 0), note: 'Completed', tone: 'green' },
    { label: 'SLA breached', value: m.breached_slas, note: `${m.urgent_tickets} urgent · ${m.total_tickets} total`, tone: 'peach' },
  ] : []
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div><div className="heading-actions">{role === 'citizen' && <Link to="/complaints/new" className="button button-primary"><Plus size={17} /> New report</Link>}</div></div>
    {sum.error ? <div className="inline-result" role="alert"><AlertCircle size={18} /><div><strong>Could not load the summary</strong><p>{sum.error}</p></div></div> :
      <div className="metric-grid">{cards.map((c, i) => <article className="metric-card" key={c.label}><div className="metric-top"><span>{c.label}</span><span className={`metric-icon metric-${c.tone}`}>{i === 0 ? <FileText size={18} /> : i === 1 ? <Clock3 size={18} /> : i === 2 ? <CheckCircle2 size={18} /> : <TrendingUp size={18} />}</span></div><strong className="metric-value">{c.value}</strong><span className="metric-note">{c.note}</span></article>)}</div>}
    <Async s={list} empty="No tickets yet">{rows => { const t = trendOf(rows); const pr = [...PRIORITIES].reverse().map(p => ({ name: p.charAt(0).toUpperCase() + p.slice(1), value: rows.filter(r => r.priority === p).length })); return <>
      <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Ticket activity</h2><p>Tickets received and resolved per month</p></div><span className="chart-period">Last 6 months</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={t} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2D7772" stopOpacity={0.22} /><stop offset="100%" stopColor="#2D7772" stopOpacity={0.01} /></linearGradient><linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D47A5D" stopOpacity={0.18} /><stop offset="100%" stopColor="#D47A5D" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#eee7df" vertical={false} strokeDasharray="3 5" /><XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: '#91887f', fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#91887f', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e7ded4', fontSize: 12 }} /><Area type="monotone" dataKey="received" name="Received" stroke="#2D7772" strokeWidth={2.5} fill="url(#receivedFill)" /><Area type="monotone" dataKey="resolved" name="Resolved" stroke="#D47A5D" strokeWidth={2.5} fill="url(#resolvedFill)" /></AreaChart></ResponsiveContainer></div></section>
        <section className="panel category-panel"><div className="panel-heading"><div><h2>By priority</h2><p>Your tickets by priority</p></div></div><div className="category-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={pr} layout="vertical" margin={{ left: -16, right: 8, top: 4, bottom: 0 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={70} tick={{ fill: '#716961', fontSize: 11 }} /><Tooltip cursor={{ fill: '#f8f3ee' }} /><Bar dataKey="value" name="Tickets" fill="#2D7772" radius={[0, 5, 5, 0]} barSize={13} /></BarChart></ResponsiveContainer></div></section></div>
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent tickets</h2><p>The latest tickets in your workspace.</p></div><Link className="text-arrow" to={base(role)}>View all <ArrowRight size={15} /></Link></div><ComplaintTable rows={rows.slice(0, 5)} base={base(role)} compact /></section></> }}</Async></div>
}

export function ComplaintsPage({ role }: { role: Role }) {
  const s = useLoad(api.complaints)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All statuses')
  const titles: Record<Role, string> = { citizen: 'My tickets', agent: 'Assigned tickets', admin: 'All tickets' }
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">{roleNames[role].toUpperCase()} WORKSPACE</span><h1>{titles[role]}</h1><p>{heading[role][2]}</p></div>{role === 'citizen' && <Link to="/complaints/new" className="button button-primary"><Plus size={16} /> New report</Link>}</div>
    <section className="panel list-panel"><div className="list-toolbar"><label className="search-field"><Search size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by subject, description or number" /></label><label className="select-filter"><Filter size={15} /><select value={status} onChange={e => setStatus(e.target.value)}><option>All statuses</option>{STATUSES.map(x => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select></label><button className="button button-outline button-sm" onClick={() => { setQ(''); setStatus('All statuses') }}>Reset</button></div>
      <Async s={s} empty={role === 'agent' ? 'No tickets are assigned to you yet' : 'No tickets yet'}>{rows => { const f = rows.filter(c => `${c.title} ${c.summary} ${c.id}`.toLowerCase().includes(q.toLowerCase()) && (status === 'All statuses' || c.status === status)); return <><div className="list-count"><span>Showing <strong>{f.length}</strong> of {rows.length} tickets</span></div>{f.length ? <ComplaintTable rows={f} base={base(role)} /> : <div className="empty-state"><Search size={25} /><strong>No tickets match these filters</strong></div>}</> }}</Async></section></div>
}

export function ComplaintDetailPage({ role }: { role: Role }) {
  const { id } = useParams()
  const s = useLoad(() => api.complaint(id!), [id])
  const [status, setStatus] = useState('')
  const [prio, setPrio] = useState('')
  const [agent, setAgent] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const staff = role !== 'citizen'
  const act = (fn: () => Promise<unknown>, ok: string) => async () => {
    setBusy(true); setMsg(''); setErr('')
    try { await fn(); setMsg(ok); setStatus(''); setPrio(''); setAgent(''); s.reload() } catch (e: any) { setErr(e.message) }
    setBusy(false)
  }
  return <div className="dashboard-page"><Async s={s}>{c => <>
    <div className="page-heading-row"><div><Link className="back-link" to={base(role)}>← Back to tickets</Link><span className="eyebrow">TICKET DETAILS · #{c.id}</span><h1>{c.title}</h1><p>Submitted by {c.customer} on {fmt(c.date)}.</p></div><StatusBadge status={c.status} /></div>
    <div className="detail-layout"><div className="detail-main">
      <section className="panel detail-panel"><div className="panel-heading"><div><h2>Ticket summary</h2><p>Details of this report.</p></div><PriorityBadge priority={c.priority} /></div>
        <div className="detail-facts"><div><span>Ticket number</span><strong>#{c.id}</strong></div><div><span>Assigned agent</span><strong>{c.agent ?? 'Not assigned yet'}</strong></div><div><span>SLA deadline</span><strong><Clock3 size={15} />{fmt(c.deadline)}</strong></div><div><span>SLA status</span><strong className={isOverdue(c) ? 'sla-bad' : ''}>{slaState(c)}</strong></div></div>
        <div className="detail-description"><h3>Description</h3><p style={{ whiteSpace: 'pre-wrap' }}>{c.summary}</p></div></section>
      <section className="panel timeline-panel"><div className="panel-heading"><div><h2>Progress timeline</h2><p>Where this ticket is now.</p></div></div><div className="timeline">
        <div className="timeline-item done"><span><Check size={14} /></span><div><strong>Ticket created</strong><p>The report was received by City Connect.</p><small>{fmt(c.date)}</small></div></div>
        {c.agent && <div className="timeline-item done"><span><Check size={14} /></span><div><strong>Assigned to {c.agent}</strong><p>A support agent is responsible for this ticket.</p></div></div>}
        <div className={`timeline-item ${DONE.includes(c.status) ? 'done' : 'current'}`}><span>{DONE.includes(c.status) ? <Check size={14} /> : <Clock3 size={14} />}</span><div><strong><StatusBadge status={c.status} /></strong><p>{DONE.includes(c.status) ? 'This ticket has been resolved.' : 'The team is working on the next step.'}</p><small>Last update {c.updated}</small></div></div>
        {c.resolvedAt && <div className="timeline-item done"><span><Check size={14} /></span><div><strong>Resolved</strong><small>{fmt(c.resolvedAt)}</small></div></div>}
      </div></section></div>
      <aside className="detail-side">
        <section className="panel side-info"><span className="side-info-icon"><ShieldCheck size={20} /></span><h3>Who can see this</h3><p>Citizens see only their own tickets. Agents see tickets assigned to them. Administrators see everything. The server enforces this.</p></section>
        {staff && <section className="panel update-panel"><span className="eyebrow">MANAGE TICKET</span><h3>Update this ticket</h3>
          <label className="field-label">Status<select value={status || c.status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(x => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select></label>
          <button className="button button-primary auth-submit" disabled={busy || !status || status === c.status} onClick={act(() => api.setStatus(c.id, status), 'Status updated.')}>Update status <Check size={16} /></button>
          <label className="field-label">Priority<select value={prio || c.priority} onChange={e => setPrio(e.target.value)}>{PRIORITIES.map(x => <option key={x} value={x}>{x.charAt(0).toUpperCase() + x.slice(1)}</option>)}</select></label>
          <button className="button button-primary auth-submit" disabled={busy || !prio || prio === c.priority} onClick={act(() => api.setPriority(c.id, prio), 'Priority updated.')}>Update priority <Check size={16} /></button>
          {role === 'admin' && <><label className="field-label">Assign to support agent (agent user ID)<input inputMode="numeric" value={agent} onChange={e => setAgent(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 2" /></label>
            <button className="button button-primary auth-submit" disabled={busy || !agent} onClick={act(() => api.assign(c.id, Number(agent)), 'Ticket assigned.')}>Assign ticket <Users size={16} /></button></>}
          {msg && <div className="inline-result compact-result" role="status"><CheckCircle2 size={17} /><div><strong>{msg}</strong></div></div>}
          {err && <div className="inline-result compact-result" role="alert"><AlertCircle size={17} /><div><strong>Could not save</strong><p>{err}</p></div></div>}
        </section>}
      </aside></div></>}</Async></div>
}

export function DeadlinesPage({ role }: { role: Role }) {
  const s = useLoad(api.complaints)
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">SERVICE LEVELS</span><h1>SLA & deadlines</h1><p>Resolution deadlines: urgent 8h · high 24h · medium 48h · low 72h.</p></div></div>
    <section className="panel list-panel"><Async s={s} empty="No tickets yet">{rows => { const sorted = [...rows].sort((a, b) => Number(DONE.includes(a.status)) - Number(DONE.includes(b.status)) || (a.deadline || '').localeCompare(b.deadline || '')); return <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Priority</th><th>Status</th><th>Deadline</th><th>SLA</th></tr></thead><tbody>{sorted.map(t => <tr key={t.id}><td><Link className="complaint-title" to={`${base(role)}/${t.id}`}>{t.title}<small>#{t.id}</small></Link></td><td><PriorityBadge priority={t.priority} /></td><td><StatusBadge status={t.status} /></td><td className="date-cell">{fmt(t.deadline)}</td><td className={isOverdue(t) ? 'sla-bad' : ''}>{slaState(t)}</td></tr>)}</tbody></table></div> }}</Async></section></div>
}

export function ProfilePage() {
  const { user } = useAuth()
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">ACCOUNT</span><h1>My profile</h1><p>Your City Connect account.</p></div></div><div className="profile-layout"><section className="panel profile-card"><div className="profile-cover" /><div className="profile-identity"><div className="profile-avatar">{user?.name.slice(0, 1).toUpperCase()}</div><div><h2>{user?.name}</h2><p>{user ? roleNames[user.role] : ''} account</p></div></div><div className="profile-form"><label className="field-label">Username<input value={user?.name ?? ''} readOnly /></label><label className="field-label">Role<input value={user ? roleNames[user.role] : ''} readOnly /></label><p className="muted-text">Profile editing is not available yet.</p></div></section><aside className="panel side-info"><ShieldCheck size={22} /><h3>Your account, your reports</h3><p>Citizen accounts only access their own tickets. Staff roles are assigned by an administrator.</p></aside></div></div>
}

export function NotificationsPage() {
  const s = useLoad(api.notifications)
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">STAY INFORMED</span><h1>Notifications</h1><p>Updates help you understand what happens next.</p></div></div>
    <section className="panel notification-list"><Async s={s} empty="No notifications yet">{rows => <>{rows.map((n: any) => <article key={n.id} className={`notification-row ${n.is_read ? 'is-read' : ''}`}><span className="notification-icon sand"><Bell size={19} /></span><div className="notification-copy"><strong>{String(n.notification_type || 'Update').replace(/_/g, ' ')}</strong><p>{n.message}</p><small>{fmt(n.created_at)}</small></div>{!n.is_read && <span className="unread-dot" />}</article>)}</>}</Async></section></div>
}

export function ActivityPage() {
  const s = useLoad(api.logs)
  return <div className="dashboard-page"><div className="page-heading-row"><div><span className="eyebrow">AUDIT TRAIL</span><h1>Activity log</h1><p>Recent actions on your tickets.</p></div></div>
    <section className="panel list-panel"><Async s={s} empty="No activity yet">{rows => <div className="table-wrap"><table><thead><tr><th>When</th><th>Ticket</th><th>By</th><th>Action</th><th>Details</th></tr></thead><tbody>{rows.map((x: any) => <tr key={x.id}><td className="date-cell">{fmt(x.created_at)}</td><td>#{x.ticket}{x.ticket_subject ? ` · ${x.ticket_subject}` : ''}</td><td>{x.actor_name || '—'}</td><td>{String(x.action).replace(/_/g, ' ')}</td><td>{x.description}</td></tr>)}</tbody></table></div>}</Async></section></div>
}

export function UnauthorizedPage() {
  const { user } = useAuth()
  return <div className="public-page not-found"><span className="not-found-mark"><ShieldCheck size={28} /></span><span className="eyebrow">ACCESS RESTRICTED</span><h1>This space isn’t <em>available to your role.</em></h1><p>Your account does not have permission to open this page.</p><div className="not-found-actions"><Link className="button button-primary" to={user ? roleHome[user.role] : '/login'}>{user ? 'Go to my workspace' : 'Sign in'} <ArrowRight size={16} /></Link><Link className="button button-outline" to="/">Back home</Link></div></div>
}

export function NotFoundPage() {
  return <div className="public-page not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this path <em>has taken a turn.</em></h1><p>The page may have moved, or the link may be incomplete.</p><Link className="button button-primary" to="/">Return to homepage <ArrowRight size={16} /></Link></div>
}
