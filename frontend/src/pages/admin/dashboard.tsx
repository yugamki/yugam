import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Building,
  Trophy,
  GraduationCap,
  AlertCircle
} from 'lucide-react'

const stats = [
  {
    title: 'Total Participants',
    value: '2,547',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Active Events',
    value: '45',
    change: '+3',
    changeType: 'positive',
    icon: Calendar,
  },
  {
    title: 'Revenue',
    value: '₹8,45,000',
    change: '+18.2%',
    changeType: 'positive',
    icon: CreditCard,
  },
  {
    title: 'Workshops',
    value: '28',
    change: '+5',
    changeType: 'positive',
    icon: GraduationCap,
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'registration',
    message: 'New participant registered for Robotics Competition',
    time: '2 minutes ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'payment',
    message: 'Payment received for Web Development Workshop',
    time: '5 minutes ago',
    status: 'success'
  },
  {
    id: 3,
    type: 'event',
    message: 'New event "AI/ML Workshop" submitted for approval',
    time: '10 minutes ago',
    status: 'pending'
  },
  {
    id: 4,
    type: 'accommodation',
    message: 'Accommodation request approved for John Doe',
    time: '15 minutes ago',
    status: 'success'
  },
]

const pendingApprovals = [
  {
    id: 1,
    title: 'Machine Learning Workshop',
    type: 'Workshop',
    submittedBy: 'Dr. Sarah Johnson',
    submittedAt: '2 hours ago'
  },
  {
    id: 2,
    title: 'Cybersecurity Competition',
    type: 'Event',
    submittedBy: 'Prof. Mike Chen',
    submittedAt: '4 hours ago'
  },
  {
    id: 3,
    title: 'Cultural Dance Performance',
    type: 'Event',
    submittedBy: 'Priya Sharma',
    submittedAt: '6 hours ago'
  },
]

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with Yugam 2025.
          </p>
        </div>
        <Button variant="yugam">
          <Trophy className="mr-2 h-4 w-4" />
          View Festival Overview
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
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest activities across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Events and workshops waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.type} • by {item.submittedBy} • {item.submittedAt}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Create Event
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <GraduationCap className="h-6 w-6 mb-2" />
              Add Workshop
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Building className="h-6 w-6 mb-2" />
              Manage Rooms
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}