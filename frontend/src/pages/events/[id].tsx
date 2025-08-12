import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GeneralPassModal } from '@/components/general-pass-modal'
import { useAuth } from '@/components/auth-provider'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  Phone, 
  CreditCard,
  CheckCircle,
  Star
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  domain: string
  category: string
  startDate: string
  endDate: string
  eventType: string
  mode: string
  venue?: string
  rules?: string
  prizes?: string
  contactInfo?: string
  feePerPerson?: number
  feePerTeam?: number
  maxRegistrations?: number
  currentRegistrations: number
  creator: {
    firstName: string
    lastName: string
    email: string
  }
  _count: {
    registrations: number
  }
}

interface Registration {
  id: string
  status: string
  payment?: {
    status: string
    amount: number
  }
}

interface GeneralPass {
  id: string
  days: number
  amount: number
  isActive: boolean
}

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [generalPass, setGeneralPass] = useState<GeneralPass | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showGeneralPassModal, setShowGeneralPassModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEventDetails()
      if (user) {
        fetchUserRegistration()
        fetchGeneralPass()
      }
    }
  }, [id, user])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRegistration = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const eventRegistration = data.registrations.find((reg: any) => reg.event.id === id)
        setRegistration(eventRegistration || null)
      }
    } catch (error) {
      console.error('Error fetching registration:', error)
    }
  }

  const fetchGeneralPass = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/general-pass`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setGeneralPass(data.generalPass)
      }
    } catch (error) {
      console.error('Error fetching general pass:', error)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    setRegistering(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: id,
        }),
      })

      if (response.ok) {
        await fetchUserRegistration()
        await fetchEventDetails()
      } else {
        const error = await response.json()
        alert(error.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handlePayment = async () => {
    if (!registration) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId: registration.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // In a real implementation, integrate with Razorpay
        alert(`Payment of ${formatCurrency(data.amount)} initiated`)
        await fetchUserRegistration()
      } else {
        const error = await response.json()
        if (error.requiresGeneralPass) {
          setShowGeneralPassModal(true)
        } else {
          alert(error.error || 'Payment failed')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed')
    }
  }

  const handleGeneralPassPurchase = async (days: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/general-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ days }),
      })

      if (response.ok) {
        const data = await response.json()
        // In a real implementation, integrate with Razorpay
        alert(`General pass payment of ${formatCurrency(data.amount)} initiated`)
        await fetchGeneralPass()
      } else {
        const error = await response.json()
        alert(error.error || 'General pass purchase failed')
      }
    } catch (error) {
      console.error('General pass purchase error:', error)
      alert('General pass purchase failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return <Badge variant="outline">General Event</Badge>
      case 'PAID':
        return <Badge variant="yugam">Specific Event</Badge>
      case 'COMBO':
        return <Badge variant="destructive">Combo Event</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getRegistrationButton = () => {
    if (!user) {
      return (
        <Button size="lg" asChild>
          <Link to="/auth/login">Login to Register</Link>
        </Button>
      )
    }

    if (!registration) {
      return (
        <Button 
          size="lg" 
          onClick={handleRegister}
          disabled={registering || (event.maxRegistrations && event.currentRegistrations >= event.maxRegistrations)}
        >
          {registering ? 'Registering...' : 'Register Now'}
        </Button>
      )
    }

    if (registration.status === 'CONFIRMED') {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-600 font-medium">Registered & Paid</span>
        </div>
      )
    }

    // Show payment options based on event type
    if (event.eventType === 'GENERAL') {
      if (!generalPass) {
        return (
          <Button 
            size="lg" 
            onClick={() => setShowGeneralPassModal(true)}
            className="bg-gradient-to-r from-yugam-500 to-yugam-600"
          >
            <Star className="mr-2 h-4 w-4" />
            Buy General Event Pass
          </Button>
        )
      } else {
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-600 font-medium">
              Registered (General Pass Active - {generalPass.days} days)
            </span>
          </div>
        )
      }
    } else {
      // Specific event payment
      return (
        <Button 
          size="lg" 
          onClick={handlePayment}
          className="bg-gradient-to-r from-yugam-500 to-yugam-600"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {formatCurrency(event.feePerPerson || 0)}
        </Button>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/events" className="text-yugam-600 hover:text-yugam-700">
              ← Back to Events
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h1>
                {getEventTypeBadge(event.eventType)}
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {event.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yugam-500" />
                  <div>
                    <div className="font-medium">Start Date</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yugam-500" />
                  <div>
                    <div className="font-medium">End Date</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-yugam-500" />
                    <div>
                      <div className="font-medium">Venue</div>
                      <div className="text-sm text-gray-500">{event.venue}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yugam-500" />
                  <div>
                    <div className="font-medium">Registrations</div>
                    <div className="text-sm text-gray-500">
                      {event.currentRegistrations}
                      {event.maxRegistrations && ` / ${event.maxRegistrations}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <Card className="lg:w-96">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
                <CardDescription>
                  {event.eventType === 'GENERAL' 
                    ? 'Requires General Event Pass' 
                    : event.eventType === 'PAID' 
                    ? 'Specific Event Fee Required'
                    : 'Special Event'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.eventType !== 'GENERAL' && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yugam-600">
                      {formatCurrency(event.feePerPerson || 0)}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                )}
                
                <div className="text-center">
                  {getRegistrationButton()}
                </div>

                {registration && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium">Registration Status</div>
                      <div className="text-blue-600 dark:text-blue-400">
                        {registration.status}
                      </div>
                      {registration.payment && (
                        <div className="mt-2">
                          <div className="font-medium">Payment Status</div>
                          <div className="text-blue-600 dark:text-blue-400">
                            {registration.payment.status} - {formatCurrency(registration.payment.amount)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Rules */}
            {event.rules && (
              <Card>
                <CardHeader>
                  <CardTitle>Rules & Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {event.rules.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prizes */}
            {event.prizes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yugam-500" />
                    Prizes & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {event.prizes.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Domain</div>
                  <div className="text-sm text-gray-500">{event.domain}</div>
                </div>
                <div>
                  <div className="font-medium">Category</div>
                  <div className="text-sm text-gray-500">{event.category}</div>
                </div>
                <div>
                  <div className="font-medium">Mode</div>
                  <div className="text-sm text-gray-500">{event.mode}</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            {event.contactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-yugam-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {event.contactInfo.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="font-medium">
                    {event.creator.firstName} {event.creator.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{event.creator.email}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* General Pass Modal */}
      <GeneralPassModal
        isOpen={showGeneralPassModal}
        onClose={() => setShowGeneralPassModal(false)}
        onPurchase={handleGeneralPassPurchase}
      />
    </div>
  )
}