import { useState, useEffect } from 'react'
import { Send, Mail, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Event {
  id: string
  title: string
  isWorkshop: boolean
  startDate: string
}

interface EmailCommunication {
  id: string
  subject: string
  content: string
  replyTo: string
  recipientCount: number
  sentAt: string
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
  message: string
  status: string
  requestedAt: string
  approvedAt?: string
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

export function CommunicationsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [emails, setEmails] = useState<EmailCommunication[]>([])
  const [whatsappRequests, setWhatsappRequests] = useState<WhatsAppRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  // Email form state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailForm, setEmailForm] = useState({
    eventId: '',
    subject: '',
    content: '',
    replyTo: ''
  })
  
  // WhatsApp form state
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false)
  const [whatsappForm, setWhatsappForm] = useState({
    eventId: '',
    message: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch user events
      const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/communications/user-events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Fetch sent emails
      const emailsResponse = await fetch(`${import.meta.env.VITE_API_URL}/communications/emails`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Fetch WhatsApp requests
      const whatsappResponse = await fetch(`${import.meta.env.VITE_API_URL}/communications/whatsapp/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events)
      }

      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json()
        setEmails(emailsData.emails)
      }

      if (whatsappResponse.ok) {
        const whatsappData = await whatsappResponse.json()
        setWhatsappRequests(whatsappData.requests)
      }
    } catch (error) {
      console.error('Error fetching communications data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/communications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(emailForm),
      })

      if (response.ok) {
        await fetchData()
        setIsEmailDialogOpen(false)
        setEmailForm({ eventId: '', subject: '', content: '', replyTo: '' })
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const handleWhatsAppRequest = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/communications/whatsapp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(whatsappForm),
      })

      if (response.ok) {
        await fetchData()
        setIsWhatsAppDialogOpen(false)
        setWhatsappForm({ eventId: '', message: '' })
      }
    } catch (error) {
      console.error('Error submitting WhatsApp request:', error)
    }
  }

  const handleApproveWhatsApp = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/communications/whatsapp/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating WhatsApp request:', error)
    }
  }

  const getWhatsAppStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'SENT':
        return <Badge variant="secondary">Sent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading communications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send emails and WhatsApp messages to participants
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  Send an email to participants. No approval required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventSelect">Event (Optional)</Label>
                  <Select value={emailForm.eventId} onValueChange={(value) => setEmailForm({...emailForm, eventId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event or leave blank for all participants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Participants</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} ({event.isWorkshop ? 'Workshop' : 'Event'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply To Email</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={emailForm.replyTo}
                    onChange={(e) => setEmailForm({...emailForm, replyTo: e.target.value})}
                    placeholder="reply@yugam.in"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={emailForm.content}
                    onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                    placeholder="Email content (HTML supported)"
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  disabled={!emailForm.subject || !emailForm.content || !emailForm.replyTo}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="yugam">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request WhatsApp Message</DialogTitle>
                <DialogDescription>
                  Submit a WhatsApp message for admin approval. Maximum 512 characters.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappEvent">Event (Optional)</Label>
                  <Select value={whatsappForm.eventId} onValueChange={(value) => setWhatsappForm({...whatsappForm, eventId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event or leave blank for all participants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Participants</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} ({event.isWorkshop ? 'Workshop' : 'Event'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappMessage">Message</Label>
                  <Textarea
                    id="whatsappMessage"
                    value={whatsappForm.message}
                    onChange={(e) => setWhatsappForm({...whatsappForm, message: e.target.value})}
                    placeholder="WhatsApp message content"
                    maxLength={512}
                    rows={6}
                  />
                  <div className="text-sm text-gray-500">
                    {whatsappForm.message.length}/512 characters
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWhatsAppDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleWhatsAppRequest}
                  disabled={!whatsappForm.message || whatsappForm.message.length > 512}
                >
                  Submit for Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Communications Tabs */}
      <Tabs defaultValue="emails" className="space-y-6">
        <TabsList>
          <TabsTrigger value="emails">Sent Emails</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Requests</TabsTrigger>
          {/* Show WhatsApp approval tab only for admins */}
          {/* Add admin-only WhatsApp approval functionality */}
        </TabsList>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Sent Emails</CardTitle>
              <CardDescription>
                History of all emails sent to participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{email.subject}</div>
                            <div className="text-sm text-gray-500">Reply to: {email.replyTo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {email.event ? (
                            <div>
                              <div className="font-medium">{email.event.title}</div>
                              <div className="text-sm text-gray-500">
                                {email.event.isWorkshop ? 'Workshop' : 'Event'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">All Participants</span>
                          )}
                        </TableCell>
                        <TableCell>{email.recipientCount}</TableCell>
                        <TableCell>
                          {email.sender.firstName} {email.sender.lastName}
                        </TableCell>
                        <TableCell>
                          {new Date(email.sentAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {emails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No emails sent yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Requests</CardTitle>
              <CardDescription>
                WhatsApp message requests and their approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Requested At</TableHead>
                      {/* Show actions only for admins */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whatsappRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="max-w-xs truncate">{request.message}</div>
                        </TableCell>
                        <TableCell>
                          {request.event ? (
                            <div>
                              <div className="font-medium">{request.event.title}</div>
                              <div className="text-sm text-gray-500">
                                {request.event.isWorkshop ? 'Workshop' : 'Event'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">All Participants</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getWhatsAppStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          {request.sender.firstName} {request.sender.lastName}
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApproveWhatsApp(request.id, 'APPROVED')}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApproveWhatsApp(request.id, 'REJECTED')}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {whatsappRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No WhatsApp requests yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}