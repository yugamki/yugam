import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToastContext } from '@/components/ui/toast-provider'

interface Registration {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED'
  registeredAt: string
  event: {
    title: string
    eventType: 'GENERAL' | 'PAID' | 'COMBO'
    isWorkshop: boolean
    startDate: string
    venue?: string
  }
  user: {
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
  payment?: {
    id: string
    amount: number
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND'
    createdAt: string
  }
}

interface RegistrationStats {
  totalRegistrations: number
  confirmedRegistrations: number
  pendingRegistrations: number
  cancelledRegistrations: number
  waitlistedRegistrations: number
  eventRegistrations: number
  workshopRegistrations: number
}

export default function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [paidRegistrations, setPaidRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEventType, setFilterEventType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToastContext()

  useEffect(() => {
    fetchRegistrations()
    fetchPaidRegistrations()
    fetchStats()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      })
    }
  }

  const fetchPaidRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations/admin/paid', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPaidRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Error fetching paid registrations:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/registrations/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRegistrationStatus = async (registrationId: string, status: string) => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Registration status updated successfully"
        })
        fetchRegistrations()
        fetchStats()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating registration status:', error)
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'PENDING': 'secondary',
      'CONFIRMED': 'default',
      'CANCELLED': 'destructive',
      'WAITLISTED': 'outline'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'PENDING': 'secondary',
      'COMPLETED': 'default',
      'FAILED': 'destructive',
      'REFUNDED': 'outline',
      'PARTIAL_REFUND': 'outline'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const filteredRegistrations = registrations.filter(registration => {
    const matchesStatus = filterStatus === 'all' || registration.status === filterStatus
    const matchesEventType = filterEventType === 'all' || 
      (filterEventType === 'event' && !registration.event.isWorkshop) ||
      (filterEventType === 'workshop' && registration.event.isWorkshop)
    const matchesSearch = searchTerm === '' || 
      registration.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.yugamId?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesEventType && matchesSearch
  })

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Registrations Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waitlistedRegistrations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Registrations</TabsTrigger>
          <TabsTrigger value="paid">Paid Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Registrations</CardTitle>
              <CardDescription>Manage all event and workshop registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, event, or Yugam ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEventType} onValueChange={setFilterEventType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Event/Workshop</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.user.firstName} {registration.user.lastName}</div>
                          <div className="text-sm text-gray-500">{registration.user.email}</div>
                          {registration.user.yugamId && (
                            <div className="text-xs text-gray-400">{registration.user.yugamId}</div>
                          )}
                          {registration.user.college && (
                            <div className="text-xs text-gray-400">{registration.user.college}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.event.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(registration.event.startDate).toLocaleDateString()}
                          </div>
                          {registration.event.venue && (
                            <div className="text-xs text-gray-400">{registration.event.venue}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {registration.event.isWorkshop ? 'Workshop' : 'Event'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {registration.event.eventType}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>
                        {registration.payment ? (
                          <div>
                            <div className="font-medium">₹{registration.payment.amount}</div>
                            {getPaymentStatusBadge(registration.payment.status)}
                          </div>
                        ) : (
                          <span className="text-gray-400">No payment</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={registration.status}
                          onValueChange={(value) => updateRegistrationStatus(registration.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paid Registrations</CardTitle>
              <CardDescription>View all registrations with completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Event/Workshop</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Registration Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.user.firstName} {registration.user.lastName}</div>
                          <div className="text-sm text-gray-500">{registration.user.email}</div>
                          {registration.user.yugamId && (
                            <div className="text-xs text-gray-400">{registration.user.yugamId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.event.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(registration.event.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {registration.event.isWorkshop ? 'Workshop' : 'Event'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{registration.payment?.amount}</div>
                        {getPaymentStatusBadge(registration.payment?.status || 'PENDING')}
                      </TableCell>
                      <TableCell>
                        {registration.payment?.createdAt ? 
                          new Date(registration.payment.createdAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}