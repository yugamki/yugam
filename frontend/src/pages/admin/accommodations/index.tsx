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

interface RoomType {
  id: string
  name: string
  description?: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  isActive: boolean
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  totalRooms: number
  availableRooms: number
  createdAt: string
}

interface Accommodation {
  id: string
  userId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  roomNumber?: string
  roommates: string[]
  specialRequests?: string
  isConfirmed: boolean
  totalCost: number
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    yugamId?: string
  }
  roomType: {
    name: string
    capacity: number
    pricePerNight: number
  }
}

interface AccommodationStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  totalRevenue: number
  totalRooms: number
  availableRooms: number
}

export default function AccommodationsManagement() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [stats, setStats] = useState<AccommodationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [roomNumber, setRoomNumber] = useState('')
  const { toast } = useToastContext()

  useEffect(() => {
    fetchRoomTypes()
    fetchAccommodations()
    fetchStats()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/accommodations/room-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data.roomTypes)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  const fetchAccommodations = async () => {
    try {
      const response = await fetch('/api/accommodations/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAccommodations(data.accommodations)
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch accommodations",
        variant: "destructive"
      })
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/accommodations/admin/stats', {
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

  const confirmAccommodation = async () => {
    if (!selectedAccommodation || !roomNumber) return

    try {
      const response = await fetch(`/api/accommodations/${selectedAccommodation.id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomNumber })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Accommodation confirmed successfully"
        })
        setConfirmationDialog(false)
        setSelectedAccommodation(null)
        setRoomNumber('')
        fetchAccommodations()
        fetchStats()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to confirm accommodation",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error confirming accommodation:', error)
      toast({
        title: "Error",
        description: "Failed to confirm accommodation",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (isConfirmed: boolean) => {
    return isConfirmed ? (
      <Badge variant="default">Confirmed</Badge>
    ) : (
      <Badge variant="secondary">Pending</Badge>
    )
  }

  const getGenderBadge = (gender: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'MALE': 'default',
      'FEMALE': 'secondary',
      'OTHER': 'outline'
    }
    return <Badge variant={variants[gender] || 'outline'}>{gender}</Badge>
  }

  const filteredAccommodations = accommodations.filter(accommodation => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'confirmed' && accommodation.isConfirmed) ||
      (filterStatus === 'pending' && !accommodation.isConfirmed)
    const matchesSearch = searchTerm === '' || 
      accommodation.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accommodations Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
            </CardContent>
          </Card>
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
              <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableRooms}/{stats.totalRooms}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Accommodation Bookings</TabsTrigger>
          <TabsTrigger value="room-types">Room Types</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accommodation Bookings</CardTitle>
              <CardDescription>Manage all accommodation bookings and confirmations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, or room type..."
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccommodations.map((accommodation) => (
                    <TableRow key={accommodation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{accommodation.user.firstName} {accommodation.user.lastName}</div>
                          <div className="text-sm text-gray-500">{accommodation.user.email}</div>
                          {accommodation.user.yugamId && (
                            <div className="text-xs text-gray-400">{accommodation.user.yugamId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{accommodation.roomType.name}</div>
                          <div className="text-sm text-gray-500">Capacity: {accommodation.roomType.capacity}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Check-in: {new Date(accommodation.checkInDate).toLocaleDateString()}</div>
                          <div>Check-out: {new Date(accommodation.checkOutDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{accommodation.totalCost}</div>
                        <div className="text-sm text-gray-500">₹{accommodation.roomType.pricePerNight}/night</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(accommodation.isConfirmed)}</TableCell>
                      <TableCell>
                        {!accommodation.isConfirmed ? (
                          <Dialog open={confirmationDialog} onOpenChange={setConfirmationDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAccommodation(accommodation)}
                              >
                                Confirm
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Accommodation</DialogTitle>
                                <DialogDescription>
                                  Assign a room number for {selectedAccommodation?.user.firstName} {selectedAccommodation?.user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Room Number</Label>
                                  <Input
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                    placeholder="Enter room number..."
                                  />
                                </div>
                                {selectedAccommodation?.specialRequests && (
                                  <div>
                                    <Label>Special Requests</Label>
                                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                                      {selectedAccommodation.specialRequests}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setConfirmationDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={confirmAccommodation} disabled={!roomNumber}>
                                  Confirm Booking
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Room {accommodation.roomNumber}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Types</CardTitle>
              <CardDescription>Manage available room types and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomTypes.map((roomType) => (
                    <TableRow key={roomType.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{roomType.name}</div>
                          {roomType.description && (
                            <div className="text-sm text-gray-500">{roomType.description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {roomType.amenities.join(', ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{roomType.capacity} person{roomType.capacity > 1 ? 's' : ''}</TableCell>
                      <TableCell>₹{roomType.pricePerNight}</TableCell>
                      <TableCell>{getGenderBadge(roomType.gender)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{roomType.availableRooms}/{roomType.totalRooms} available</div>
                          <div className="text-xs text-gray-500">
                            {Math.round((roomType.availableRooms / roomType.totalRooms) * 100)}% occupancy
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roomType.isActive ? "default" : "secondary"}>
                          {roomType.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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