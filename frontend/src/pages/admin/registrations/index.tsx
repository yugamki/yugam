import { useState, useEffect } from 'react'
import { Search, Users, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

interface Registration {
  id: string
  status: string
  registeredAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
    yugamId?: string
    college?: string
  }
  team?: {
    name: string
    members: {
      user: {
        firstName: string
        lastName: string
        email: string
      }
    }[]
  }
  event: {
    title: string
    eventType: string
    isWorkshop: boolean
    startDate: string
    venue?: string
  }
  payment?: {
    amount: number
    status: string
    createdAt: string
  }
}

interface RegistrationStats {
  totalRegistrations: number
  confirmedRegistrations: number
  pendingRegistrations: number
  totalRevenue: number
}

export function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [paidUsers, setPaidUsers] = useState<Registration[]>([])
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')

  useEffect(() => {
    fetchRegistrations()
    fetchPaidUsers()
    fetchStats()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/registrations?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaidUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/registrations/paid?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPaidUsers(data.registrations)
      }
    } catch (error) {
      console.error('Error fetching paid users:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/registrations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching registration stats:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'WAITLISTED':
        return <Badge variant="outline">Waitlisted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Paid</Badge>
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = 
      registration.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || registration.status === statusFilter
    const matchesEventType = !eventTypeFilter || registration.event.eventType === eventTypeFilter
    
    return matchesSearch && matchesStatus && matchesEventType
  })

  const filteredPaidUsers = paidUsers.filter(registration => {
    const matchesSearch = 
      registration.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading registrations...</div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Registrations',
      value: stats?.totalRegistrations?.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Confirmed Registrations',
      value: stats?.confirmedRegistrations?.toString() || '0',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending Registrations',
      value: stats?.pendingRegistrations?.toString() || '0',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: CreditCard,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registrations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all event and workshop registrations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Registrations Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Registrations</TabsTrigger>
          <TabsTrigger value="paid">Paid Users</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Registrations</CardTitle>
              <CardDescription>
                Complete list of all event and workshop registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by participant, event, or team name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="COMBO">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant/Team</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          {registration.user ? (
                            <div>
                              <div className="font-medium">
                                {registration.user.firstName} {registration.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{registration.user.email}</div>
                              {registration.user.yugamId && (
                                <div className="text-xs text-gray-400">{registration.user.yugamId}</div>
                              )}
                            </div>
                          ) : registration.team ? (
                            <div>
                              <div className="font-medium">{registration.team.name}</div>
                              <div className="text-sm text-gray-500">
                                {registration.team.members.length} members
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.event.title}</div>
                            <div className="text-sm text-gray-500">
                              {registration.event.isWorkshop ? 'Workshop' : 'Event'} • {new Date(registration.event.startDate).toLocaleDateString()}
                            </div>
                            {registration.event.venue && (
                              <div className="text-xs text-gray-400">{registration.event.venue}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={registration.event.eventType === 'GENERAL' ? 'outline' : 'yugam'}>
                            {registration.event.eventType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(registration.status)}
                        </TableCell>
                        <TableCell>
                          {registration.payment ? (
                            <div>
                              {getPaymentStatusBadge(registration.payment.status)}
                              <div className="text-sm text-gray-500">
                                {formatCurrency(registration.payment.amount)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No payment</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredRegistrations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No registrations found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Users</CardTitle>
              <CardDescription>
                Users who have completed payment for their registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search paid users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaidUsers.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          {registration.user && (
                            <div>
                              <div className="font-medium">
                                {registration.user.firstName} {registration.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{registration.user.email}</div>
                              {registration.user.college && (
                                <div className="text-xs text-gray-400">{registration.user.college}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.event.title}</div>
                            <div className="text-sm text-gray-500">
                              {registration.event.isWorkshop ? 'Workshop' : 'Event'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {registration.payment && (
                            <div className="font-medium">
                              {formatCurrency(registration.payment.amount)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {registration.payment && (
                            new Date(registration.payment.createdAt).toLocaleDateString()
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Paid</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPaidUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No paid users found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}