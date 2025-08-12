import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToastContext } from '@/components/ui/toast-provider'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND'
  paymentMethod?: string
  transactionId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  refundedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    yugamId?: string
  }
  event: {
    title: string
    isWorkshop: boolean
  }
  registration: {
    id: string
  }
}

interface GeneralEventPass {
  id: string
  userId: string
  days: number
  amount: number
  isActive: boolean
  purchasedAt: string
  expiresAt?: string
  paymentId?: string
  user: {
    firstName: string
    lastName: string
    email: string
    yugamId?: string
  }
}

interface PaymentStats {
  totalRevenue: number
  totalPayments: number
  pendingPayments: number
  failedPayments: number
  refundedAmount: number
  generalPassRevenue: number
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [generalPasses, setGeneralPasses] = useState<GeneralEventPass[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refundDialog, setRefundDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToastContext()

  useEffect(() => {
    fetchPayments()
    fetchGeneralPasses()
    fetchStats()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      })
    }
  }

  const fetchGeneralPasses = async () => {
    try {
      const response = await fetch('/api/admin/general-passes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setGeneralPasses(data.passes)
      }
    } catch (error) {
      console.error('Error fetching general passes:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats', {
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

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return

    try {
      const response = await fetch(`/api/admin/payments/${selectedPayment.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Refund processed successfully"
        })
        setRefundDialog(false)
        setSelectedPayment(null)
        setRefundAmount('')
        setRefundReason('')
        fetchPayments()
        fetchStats()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to process refund",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'PENDING': 'secondary',
      'COMPLETED': 'default',
      'FAILED': 'destructive',
      'REFUNDED': 'outline',
      'PARTIAL_REFUND': 'outline'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      payment.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.event.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">General Pass Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.generalPassRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Event Payments</TabsTrigger>
          <TabsTrigger value="general-passes">General Event Passes</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Payments</CardTitle>
              <CardDescription>Manage all event and workshop payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, or event..."
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
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="PARTIAL_REFUND">Partial Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.user.firstName} {payment.user.lastName}</div>
                          <div className="text-sm text-gray-500">{payment.user.email}</div>
                          {payment.user.yugamId && (
                            <div className="text-xs text-gray-400">{payment.user.yugamId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.event.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {payment.event.isWorkshop ? 'Workshop' : 'Event'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {payment.status === 'COMPLETED' && (
                          <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                Refund
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Process Refund</DialogTitle>
                                <DialogDescription>
                                  Process a refund for {selectedPayment?.user.firstName} {selectedPayment?.user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="refundAmount">Refund Amount (₹)</Label>
                                  <Input
                                    id="refundAmount"
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    max={selectedPayment?.amount}
                                    min={0}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="refundReason">Refund Reason</Label>
                                  <Textarea
                                    id="refundReason"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Enter reason for refund..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setRefundDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleRefund}>
                                  Process Refund
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general-passes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Event Passes</CardTitle>
              <CardDescription>Manage general event pass purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalPasses.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pass.user.firstName} {pass.user.lastName}</div>
                          <div className="text-sm text-gray-500">{pass.user.email}</div>
                          {pass.user.yugamId && (
                            <div className="text-xs text-gray-400">{pass.user.yugamId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{pass.days} day{pass.days > 1 ? 's' : ''}</TableCell>
                      <TableCell>₹{pass.amount}</TableCell>
                      <TableCell>
                        <Badge variant={pass.isActive ? "default" : "secondary"}>
                          {pass.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(pass.purchasedAt).toLocaleDateString()}</TableCell>
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