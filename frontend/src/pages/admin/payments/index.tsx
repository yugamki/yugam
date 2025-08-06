import { useState, useEffect } from 'react'
import { Search, MoreHorizontal, RefreshCw, DollarSign, CreditCard, AlertCircle } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: string
  currency: string
  createdAt: string
  refundAmount?: number
  refundReason?: string
  user: {
    firstName: string
    lastName: string
    email: string
    yugamId?: string
  }
  event: {
    title: string
    eventType: string
    isWorkshop: boolean
  }
  registration: {
    team?: {
      name: string
    }
  }
}

interface PaymentStats {
  totalRevenue: number
  completedPayments: number
  pendingPayments: number
  refundedAmount: number
  generalPassRevenue: number
}

const paymentStatuses = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIAL_REFUND', label: 'Partial Refund' },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>
    case 'PENDING':
      return <Badge variant="warning">Pending</Badge>
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>
    case 'REFUNDED':
      return <Badge variant="secondary">Refunded</Badge>
    case 'PARTIAL_REFUND':
      return <Badge variant="outline">Partial Refund</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/admin?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/refund/${selectedPayment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          refundReason,
        }),
      })

      if (response.ok) {
        await fetchPayments()
        await fetchStats()
        setIsRefundDialogOpen(false)
        setSelectedPayment(null)
        setRefundAmount('')
        setRefundReason('')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.yugamId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Completed Payments',
      value: stats?.completedPayments?.toString() || '0',
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments?.toString() || '0',
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
    {
      title: 'Refunded Amount',
      value: formatCurrency(stats?.refundedAmount || 0),
      icon: RefreshCw,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage all payments and refunds
          </p>
        </div>
        <Button variant="outline" onClick={() => { fetchPayments(); fetchStats(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            View and manage payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user, event, or Yugam ID..."
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
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.user.firstName} {payment.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{payment.user.email}</div>
                        {payment.user.yugamId && (
                          <div className="text-xs text-gray-400">{payment.user.yugamId}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.event.title}</div>
                        <div className="text-sm text-gray-500">
                          {payment.event.isWorkshop ? 'Workshop' : 'Event'} • {payment.event.eventType}
                        </div>
                        {payment.registration.team && (
                          <div className="text-xs text-gray-400">Team: {payment.registration.team.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(payment.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.refundAmount ? (
                        <div>
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(payment.refundAmount)}
                          </div>
                          <div className="text-xs text-gray-500">{payment.refundReason}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {payment.status === 'COMPLETED' && !payment.refundAmount && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedPayment(payment)
                                setRefundAmount(payment.amount.toString())
                                setIsRefundDialogOpen(true)
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'COMPLETED' && payment.refundAmount && payment.refundAmount < payment.amount && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedPayment(payment)
                                setRefundAmount((payment.amount - (payment.refundAmount || 0)).toString())
                                setIsRefundDialogOpen(true)
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Additional Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payments found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm">
                  <div><strong>User:</strong> {selectedPayment.user.firstName} {selectedPayment.user.lastName}</div>
                  <div><strong>Event:</strong> {selectedPayment.event.title}</div>
                  <div><strong>Original Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
                  {selectedPayment.refundAmount && (
                    <div><strong>Already Refunded:</strong> {formatCurrency(selectedPayment.refundAmount)}</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundReason">Refund Reason</Label>
                <Input
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRefund}
              disabled={!refundAmount || !refundReason}
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}