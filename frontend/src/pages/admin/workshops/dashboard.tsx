import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
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
    title: 'Total Workshops',
    value: '28',
    change: '+2 this week',
    changeType: 'positive',
    icon: GraduationCap,
  },
  {
    title: 'Active Workshops',
    value: '22',
    change: '+3 from last month',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    title: 'Total Participants',
    value: '856',
    change: '+15.8%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Pending Approvals',
    value: '5',
    change: '1 urgent',
    changeType: 'warning',
    icon: AlertCircle,
  },
]

const recentWorkshops = [
  {
    id: 1,
    title: 'Machine Learning Fundamentals',
    category: 'Technical',
    status: 'PUBLISHED',
    registrations: 45,
    maxRegistrations: 50,
    startDate: '2024-02-16',
    coordinator: 'Dr. AI Expert'
  },
  {
    id: 2,
    title: 'Digital Marketing Strategy',
    category: 'Business',
    status: 'PENDING_APPROVAL',
    registrations: 0,
    maxRegistrations: 30,
    startDate: '2024-02-22',
    coordinator: 'Ms. Marketing'
  },
  {
    id: 3,
    title: 'Photography Masterclass',
    category: 'Creative',
    status: 'PUBLISHED',
    registrations: 28,
    maxRegistrations: 35,
    startDate: '2024-02-19',
    coordinator: 'Mr. Photographer'
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

export function WorkshopsDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workshops Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all workshops for Yugam 2025
          </p>
        </div>
        <Button variant="yugam">
          <Plus className="mr-2 h-4 w-4" />
          Create Workshop
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
        {/* Recent Workshops */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workshops</CardTitle>
            <CardDescription>
              Latest workshops and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkshops.map((workshop) => (
                <div key={workshop.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {workshop.title}
                      </h4>
                      {getStatusBadge(workshop.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {workshop.category} • by {workshop.coordinator}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {workshop.registrations}/{workshop.maxRegistrations} registered • {new Date(workshop.startDate).toLocaleDateString()}
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
              Common workshop management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <Plus className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Create New Workshop</div>
                  <div className="text-sm text-muted-foreground">Add a new workshop to the system</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <AlertCircle className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Review Pending Workshops</div>
                  <div className="text-sm text-muted-foreground">5 workshops waiting for approval</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Coordinators</div>
                  <div className="text-sm text-muted-foreground">Assign workshops to coordinators</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <TrendingUp className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Reports</div>
                  <div className="text-sm text-muted-foreground">Workshop performance and analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}