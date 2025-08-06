import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Home, 
  Settings, 
  Bell,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trophy,
  GraduationCap,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Navigation based on user role
const getNavigation = (userRole: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
  ]

  if (userRole === 'ADMIN') {
    return [
      ...baseNavigation,
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Workshops', href: '/admin/workshops', icon: GraduationCap },
      { name: 'Participants', href: '/admin/participants', icon: Users },
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Accommodations', href: '/admin/accommodations', icon: Building },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { name: 'Content', href: '/admin/content', icon: FileText },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }

  if (userRole === 'EVENTS_LEAD') {
    return [
      ...baseNavigation,
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Event Coordinators', href: '/admin/events/coordinators', icon: Users },
      { name: 'Event Reports', href: '/admin/events/reports', icon: BarChart3 },
    ]
  }

  if (userRole === 'WORKSHOPS_LEAD') {
    return [
      ...baseNavigation,
      { name: 'Workshops', href: '/admin/workshops', icon: GraduationCap },
      { name: 'Workshop Coordinators', href: '/admin/workshops/coordinators', icon: Users },
      { name: 'Workshop Reports', href: '/admin/workshops/reports', icon: BarChart3 },
    ]
  }

  if (userRole === 'EVENT_COORDINATOR') {
    return [
      ...baseNavigation,
      { name: 'My Events', href: '/admin/events/my-events', icon: Calendar },
      { name: 'Registrations', href: '/admin/events/registrations', icon: Users },
    ]
  }

  if (userRole === 'WORKSHOP_COORDINATOR') {
    return [
      ...baseNavigation,
      { name: 'My Workshops', href: '/admin/workshops/my-workshops', icon: GraduationCap },
      { name: 'Registrations', href: '/admin/workshops/registrations', icon: Users },
    ]
  }

  return baseNavigation
}

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  userRole?: string
}

export function AdminSidebar({ collapsed = false, onToggle, userRole = 'PARTICIPANT' }: AdminSidebarProps) {
  const location = useLocation()
  const navigation = getNavigation(userRole)

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yugam-600" />
              <span className="text-xl font-bold yugam-gradient-text">Yugam Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yugam-100 text-yugam-700 dark:bg-yugam-900 dark:text-yugam-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-yugam-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {!collapsed && (
                  <>
                    <span className="ml-3">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Yugam 2025 Admin Panel
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              v1.0.0
            </div>
          </div>
        )}
      </div>
    </div>
  )
}