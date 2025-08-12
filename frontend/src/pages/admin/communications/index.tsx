import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { useToastContext } from '@/components/ui/toast-provider'

interface EmailCommunication {
  id: string
  eventId?: string
  senderId: string
  subject: string
  content: string
  replyTo: string
  recipientCount: number
  sentAt: string
  status: string
  event?: {
    title: string
    isWorkshop: boolean
  }
  sender: {
    firstName: string
    lastName: string
  }
}

interface WhatsAppRequest {
  id: string
  eventId?: string
  senderId: string
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
  requestedAt: string
  approvedAt?: string
  approvedBy?: string
  sentAt?: string
  recipientCount?: number
  event?: {
    title: string
    isWorkshop: boolean
  }
  sender: {
    firstName: string
    lastName: string
  }
  approver?: {
    firstName: string
    lastName: string
  }
}



export default function CommunicationsManagement() {
  const [emails, setEmails] = useState<EmailCommunication[]>([])
  const [whatsappRequests, setWhatsappRequests] = useState<WhatsAppRequest[]>([])

  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<WhatsAppRequest | null>(null)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const { toast } = useToastContext()

  useEffect(() => {
    fetchEmails()
    fetchWhatsAppRequests()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/communications/emails', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive"
      })
    }
  }

  const fetchWhatsAppRequests = async () => {
    try {
      const response = await fetch('/api/communications/whatsapp/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWhatsappRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp requests:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleWhatsAppApproval = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/communications/whatsapp/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: approvalStatus })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `WhatsApp request ${approvalStatus.toLowerCase()} successfully`
        })
        setApprovalDialog(false)
        setSelectedRequest(null)
        fetchWhatsAppRequests()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating WhatsApp request:', error)
      toast({
        title: "Error",
        description: "Failed to update WhatsApp request",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'SENT': 'default',
      'PENDING': 'secondary',
      'APPROVED': 'default',
      'REJECTED': 'destructive',
      'FAILED': 'destructive'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const filteredEmails = emails.filter(email => {
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.event?.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const filteredWhatsAppRequests = whatsappRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sender.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sender.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.event?.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communications Management</h1>
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails">Email Communications</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Communications</CardTitle>
              <CardDescription>View all sent email communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by subject, sender, or event..."
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
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Event/Workshop</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{email.sender.firstName} {email.sender.lastName}</div>
                          <div className="text-sm text-gray-500">{email.replyTo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {email.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        {email.event ? (
                          <div>
                            <div className="font-medium">{email.event.title}</div>
                            <Badge variant="outline" className="text-xs">
                              {email.event.isWorkshop ? 'Workshop' : 'Event'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">All Participants</span>
                        )}
                      </TableCell>
                      <TableCell>{email.recipientCount}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell>{new Date(email.sentAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Requests</CardTitle>
              <CardDescription>Manage WhatsApp message requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by message, sender, or event..."
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
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Event/Workshop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWhatsAppRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.sender.firstName} {request.sender.lastName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{request.message}</div>
                      </TableCell>
                      <TableCell>
                        {request.event ? (
                          <div>
                            <div className="font-medium">{request.event.title}</div>
                            <Badge variant="outline" className="text-xs">
                              {request.event.isWorkshop ? 'Workshop' : 'Event'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">All Participants</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === 'PENDING' && (
                          <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review WhatsApp Request</DialogTitle>
                                <DialogDescription>
                                  Review the WhatsApp message request from {selectedRequest?.sender.firstName} {selectedRequest?.sender.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Message Content</Label>
                                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                                    {selectedRequest?.message}
                                  </div>
                                </div>
                                <div>
                                  <Label>Event/Workshop</Label>
                                  <div className="text-sm">
                                    {selectedRequest?.event?.title || 'All Participants'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Action</Label>
                                  <Select value={approvalStatus} onValueChange={(value: 'APPROVED' | 'REJECTED') => setApprovalStatus(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="APPROVED">Approve</SelectItem>
                                      <SelectItem value="REJECTED">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setApprovalDialog(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleWhatsAppApproval}
                                  variant={approvalStatus === 'REJECTED' ? 'destructive' : 'default'}
                                >
                                  {approvalStatus === 'APPROVED' ? 'Approve' : 'Reject'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {request.status === 'APPROVED' && (
                          <Badge variant="outline" className="text-xs">
                            Approved by {request.approver?.firstName} {request.approver?.lastName}
                          </Badge>
                        )}
                      </TableCell>
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