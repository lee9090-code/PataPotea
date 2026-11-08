import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { Role } from './types'

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import GuardSidebar from './components/layout/GuardSidebar'
import AdminSidebar from './components/layout/AdminSidebar'

// Public pages
import Landing from './pages/public/Landing'
import Browse from './pages/public/Browse'
import ItemDetail from './pages/public/ItemDetail'
import HowItWorks from './pages/public/HowItWorks'

// Auth pages
import SignIn from './pages/auth/SignIn'
import CreateAccount from './pages/auth/CreateAccount'

// Student pages
import MyClaims from './pages/student/MyClaims'
import ClaimForm from './pages/student/ClaimForm'
import ReportLoss from './pages/student/ReportLoss'
import Account from './pages/student/Account'

// Guard pages
import GuardDashboard from './pages/guard/GuardDashboard'
import LogItem from './pages/guard/LogItem'
import ItemsList from './pages/guard/ItemsList'
import ClaimsList from './pages/guard/ClaimsList'
import VerifyClaim from './pages/guard/VerifyClaim'
import Handover from './pages/guard/Handover'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Guards from './pages/admin/Guards'
import ItemsAndClaims from './pages/admin/ItemsAndClaims'
import AuditLog from './pages/admin/AuditLog'

// ─── Route guards ────────────────────────────────────────────────

function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading…</div>
  if (!user) return <Navigate to="/auth/sign-in" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

// ─── Layout wrappers ─────────────────────────────────────────────

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}

function GuardLayout() {
  return (
    <div className="flex min-h-screen">
      <GuardSidebar />
      <main className="flex-1 bg-gray-50"><Outlet /></main>
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50"><Outlet /></main>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/items" element={<Browse />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Route>

          {/* Auth */}
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/create-account" element={<CreateAccount />} />

          {/* Student (requires login) */}
          <Route element={<RequireAuth roles={['student', 'staff']} />}>
            <Route element={<PublicLayout />}>
              <Route path="/student/my-claims" element={<MyClaims />} />
              <Route path="/items/:id/claim" element={<ClaimForm />} />
              <Route path="/report" element={<ReportLoss />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Route>

          {/* Guard workspace */}
          <Route element={<RequireAuth roles={['guard']} />}>
            <Route element={<GuardLayout />}>
              <Route path="/guard" element={<GuardDashboard />} />
              <Route path="/guard/log-item" element={<LogItem />} />
              <Route path="/guard/items" element={<ItemsList />} />
              <Route path="/guard/claims" element={<ClaimsList />} />
              <Route path="/guard/claims/:id/verify" element={<VerifyClaim />} />
              <Route path="/guard/handover/:claimId" element={<Handover />} />
            </Route>
          </Route>

          {/* Admin workspace */}
          <Route element={<RequireAuth roles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/guards" element={<Guards />} />
              <Route path="/admin/items-claims" element={<ItemsAndClaims />} />
              <Route path="/admin/audit-log" element={<AuditLog />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
