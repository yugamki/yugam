import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface EventStats {
  totalEvents: number
  activeEvents: number
  totalRegistrations: number
  pendingApprovals: number
}

interface Event {
  id: string
  title: string
  category: string
  status: string
  registrations: number
  maxRegistrations: number
  startDate: string
  coordinator: string
}

export function EventsDashboard() {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEventsData()
  }, [])

  const fetchEventsData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch events stats
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/events/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Fetch recent events
      const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/events?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events)
      }
    } catch (error) {
      console.error('Error fetching events data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>
      case 'PENDING_APPROVAL':
        return <Badge variant="warning">Pending</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading events dashboard...</div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents?.toString() || '0',
      change: '+3 this week',
      changeType: 'positive',
      icon: Calendar,
    },
    {
      title: 'Active Events',
      value: stats?.activeEvents?.toString() || '0',
      change: '+5 from last month',
      changeType: 'positive',
      icon: CheckCircle,
    },
    {
      title: 'Total Registrations',
      value: stats?.totalRegistrations?.toString() || '0',
      change: '+18.2%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals?.toString() || '0',
      change: '2 urgent',
      changeType: 'warning',
      icon: AlertCircle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all events for Yugam 2025
          </p>
        </div>
        <Button variant="yugam">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${
                  stat.changeType === 'warning' ? 'text-yellow-500' : 'text-muted-foreground'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Latest events and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {event.category} • by {event.coordinator}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {event.registrations}/{event.maxRegistrations} registered • {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No events found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common event management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <Plus className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Create New Event</div>
                  <div className="text-sm text-muted-foreground">Add a new event to the system</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <AlertCircle className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Review Pending Events</div>
                  <div className="text-sm text-muted-foreground">{stats?.pendingApprovals || 0} events waiting for approval</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Coordinators</div>
                  <div className="text-sm text-muted-foreground">Assign events to coordinators</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <TrendingUp className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Reports</div>
                  <div className="text-sm text-muted-foreground">Event performance and analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}