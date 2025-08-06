import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AdminLayout } from '@/components/admin/layout'
import { HomePage } from '@/pages/home'
import { AdminDashboard } from '@/pages/admin/dashboard'
import { AdminUsers } from '@/pages/admin/users'
import { UserPermissions } from '@/pages/admin/users/permissions'
import { EventsDashboard } from '@/pages/admin/events/dashboard'
import { WorkshopsDashboard } from '@/pages/admin/workshops/dashboard'
import { ManageEvents } from '@/pages/admin/events/manage'
import { CreateEvent } from '@/pages/admin/events/create'
import { PaymentsManagement } from '@/pages/admin/payments'
import { AccommodationsManagement } from '@/pages/admin/accommodations'
import { RegistrationsManagement } from '@/pages/admin/registrations'
import { CommunicationsManagement } from '@/pages/admin/communications'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="yugam-ui-theme">
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/events" element={<div className="p-8 text-center">Events Page - Coming Soon</div>} />
                    <Route path="/workshops" element={<div className="p-8 text-center">Workshops Page - Coming Soon</div>} />
                    <Route path="/dashboard" element={<div className="p-8 text-center">User Dashboard - Coming Soon</div>} />
                    <Route path="/auth/login" element={<div className="p-8 text-center">Login Page - Coming Soon</div>} />
                    <Route path="/auth/register" element={<div className="p-8 text-center">Register Page - Coming Soon</div>} />
                    <Route path="/contact" element={<div className="p-8 text-center">Contact Page - Coming Soon</div>} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<EventsDashboard />} />
              <Route path="events/manage" element={<ManageEvents />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="workshops" element={<WorkshopsDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/permissions" element={<UserPermissions />} />
              <Route path="payments" element={<PaymentsManagement />} />
              <Route path="accommodations" element={<AccommodationsManagement />} />
              <Route path="registrations" element={<RegistrationsManagement />} />
              <Route path="communications" element={<CommunicationsManagement />} />
              <Route path="notifications" element={<div className="p-8 text-center">Admin Notifications - Coming Soon</div>} />
              <Route path="reports" element={<div className="p-8 text-center">Admin Reports - Coming Soon</div>} />
              <Route path="content" element={<div className="p-8 text-center">Admin Content - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-8 text-center">Admin Settings - Coming Soon</div>} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App