import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Role } from './lib/api'
import AppShell from './components/AppShell'
import PublicLayout from './components/PublicLayout'
import { Protected } from './auth'
import { AboutPage, ActivityPage, ComplaintDetailPage, ComplaintsPage, DashboardPage, DeadlinesPage, HomePage, LoginPage, NewComplaintPage, NotificationsPage, NotFoundPage, ProfilePage, RegisterPage, ResolvedPage, TrackPage, UnauthorizedPage } from './pages/Pages'

const area = (role: Role, extra: ReactNode = null) => (
  <Route path={`/${role}`} element={<Protected allowed={[role]}><AppShell /></Protected>}>
    <Route path="dashboard" element={<DashboardPage role={role} />} />
    <Route path="complaints" element={<ComplaintsPage role={role} />} />
    <Route path="complaints/:id" element={<ComplaintDetailPage role={role} />} />
    {role !== 'citizen' && <Route path="deadlines" element={<DeadlinesPage role={role} />} />}
    <Route path="profile" element={<ProfilePage />} />
    <Route index element={<Navigate to="dashboard" replace />} />
    {extra}
  </Route>
)

export default function App() {
  const any: Role[] = ['citizen', 'agent', 'admin', 'mayor']
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/complaints/new" element={<NewComplaintPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/resolved-complaints" element={<ResolvedPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Route>
    {area('citizen')}
    {area('agent')}
    {area('admin')}
    {area('mayor')}
    <Route path="/notifications" element={<Protected allowed={any}><AppShell /></Protected>}><Route index element={<NotificationsPage />} /></Route>
    <Route path="/activity" element={<Protected allowed={any}><AppShell /></Protected>}><Route index element={<ActivityPage />} /></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
