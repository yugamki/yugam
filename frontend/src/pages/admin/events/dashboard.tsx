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

const stats = [
  {
    title: 'Total Events',
    value: '45',
    change: '+3 this week',
    changeType: 'positive',
    icon: Calendar,
  },
  {
    title: 'Active Events',
    value: '32',
    change: '+5 from last month',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    title: 'Total Registrations',
    value: '1,247',
    change: '+18.2%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Pending Approvals',
    value: '8',
    change: '2 urgent',
    changeType: 'warning',
    icon: AlertCircle,
  },
]

const recentEvents = [
  {
    id: 1,
    title: 'Robotics Competition',
    category: 'Technical',
    status: 'PUBLISHED',
    registrations: 156,
    maxRegistrations: 200,
    startDate: '2024-02-15',
    coordinator: 'Dr. Smith'
  },
  {
    id: 2,
    title: 'Web Development Workshop',
    category: 'Technical',
    status: 'PENDING_APPROVAL',
    registrations: 0,
    maxRegistrations: 50,
    startDate: '2024-02-20',
    coordinator: 'Prof. Johnson'
  },
  {
    id: 3,
    title: 'Cultural Dance Competition',
    category: 'Cultural',
    status: 'PUBLISHED',
    registrations: 89,
    maxRegistrations: 100,
    startDate: '2024-02-18',
    coordinator: 'Ms. Patel'
  },
]

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

export function EventsDashboard() {
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
        {stats.map((stat) => {
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
              {recentEvents.map((event) => (
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
              ))}
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
                  <div className="text-sm text-muted-foreground">8 events waiting for approval</div>
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