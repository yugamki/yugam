import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HomePage } from '@/pages/home'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="yugam-ui-theme">
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<div className="p-8 text-center">Events Page - Coming Soon</div>} />
                <Route path="/workshops" element={<div className="p-8 text-center">Workshops Page - Coming Soon</div>} />
                <Route path="/dashboard" element={<div className="p-8 text-center">Dashboard Page - Coming Soon</div>} />
                <Route path="/auth/login" element={<div className="p-8 text-center">Login Page - Coming Soon</div>} />
                <Route path="/auth/register" element={<div className="p-8 text-center">Register Page - Coming Soon</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App