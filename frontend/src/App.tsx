import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AdminLayout } from '@/components/admin/layout'
import { HomePage } from '@/pages/home'
import { AdminDashboard } from '@/pages/admin/dashboard'

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
              <Route path="events" element={<div className="p-8 text-center">Admin Events - Coming Soon</div>} />
              <Route path="workshops" element={<div className="p-8 text-center">Admin Workshops - Coming Soon</div>} />
              <Route path="participants" element={<div className="p-8 text-center">Admin Participants - Coming Soon</div>} />
              <Route path="payments" element={<div className="p-8 text-center">Admin Payments - Coming Soon</div>} />
              <Route path="accommodations" element={<div className="p-8 text-center">Admin Accommodations - Coming Soon</div>} />
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