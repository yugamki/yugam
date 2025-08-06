import { useState, useEffect } from 'react'
import { Plus, Search, CheckCircle, Building } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface Accommodation {
  id: string
  checkInDate: string
  checkOutDate: string
  roomNumber?: string
  isConfirmed: boolean
  totalCost: number
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    college?: string
  }
  roomType: {
    name: string
    capacity: number
    pricePerNight: number
    gender: string
  }
}

interface RoomType {
  id: string
  name: string
  description?: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  gender: string
  totalRooms: number
  availableRooms: number
  isActive: boolean
}

export function AccommodationsManagement() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateRoomTypeOpen, setIsCreateRoomTypeOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [roomNumber, setRoomNumber] = useState('')
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    description: '',
    capacity: 1,
    pricePerNight: 0,
    amenities: '',
    gender: 'MALE',
    totalRooms: 1
  })

  useEffect(() => {
    fetchAccommodations()
    fetchRoomTypes()
  }, [])

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accommodations/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAccommodations(data.accommodations)
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accommodations/room-types`)

      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data.roomTypes)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  const handleConfirmAccommodation = async () => {
    if (!selectedAccommodation) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accommodations/${selectedAccommodation.id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ roomNumber }),
      })

      if (response.ok) {
        await fetchAccommodations()
        setIsConfirmDialogOpen(false)
        setSelectedAccommodation(null)
        setRoomNumber('')
      }
    } catch (error) {
      console.error('Error confirming accommodation:', error)
    }
  }

  const handleCreateRoomType = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accommodations/room-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRoomType,
          amenities: newRoomType.amenities.split(',').map(a => a.trim()).filter(Boolean)
        }),
      })

      if (response.ok) {
        await fetchRoomTypes()
        setIsCreateRoomTypeOpen(false)
        setNewRoomType({
          name: '',
          description: '',
          capacity: 1,
          pricePerNight: 0,
          amenities: '',
          gender: 'MALE',
          totalRooms: 1
        })
      }
    } catch (error) {
      console.error('Error creating room type:', error)
    }
  }

  const filteredAccommodations = accommodations.filter(accommodation => {
    const matchesSearch = 
      accommodation.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'confirmed' && accommodation.isConfirmed) ||
      (statusFilter === 'pending' && !accommodation.isConfirmed)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading accommodations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accommodations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage participant accommodations and room types
          </p>
        </div>
        <Dialog open={isCreateRoomTypeOpen} onOpenChange={setIsCreateRoomTypeOpen}>
          <DialogTrigger asChild>
            <Button variant="yugam">
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Room Type</DialogTitle>
              <DialogDescription>
                Add a new room type for accommodations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Type Name</Label>
                <Input
                  id="name"
                  value={newRoomType.name}
                  onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                  placeholder="e.g., Male Dormitory"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRoomType.description}
                  onChange={(e) => setNewRoomType({ ...newRoomType, description: e.target.value })}
                  placeholder="Room description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newRoomType.capacity}
                    onChange={(e) => setNewRoomType({ ...newRoomType, capacity: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price Per Night (₹)</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    value={newRoomType.pricePerNight}
                    onChange={(e) => setNewRoomType({ ...newRoomType, pricePerNight: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newRoomType.gender} onValueChange={(value) => setNewRoomType({ ...newRoomType, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRooms">Total Rooms</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    value={newRoomType.totalRooms}
                    onChange={(e) => setNewRoomType({ ...newRoomType, totalRooms: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={newRoomType.amenities}
                  onChange={(e) => setNewRoomType({ ...newRoomType, amenities: e.target.value })}
                  placeholder="WiFi, AC, Shared Bathroom"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoomTypeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRoomType} disabled={!newRoomType.name}>
                Create Room Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room Types Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {roomTypes.map((roomType) => (
          <Card key={roomType.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {roomType.name}
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomType.availableRooms}/{roomType.totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                Available rooms • {formatCurrency(roomType.pricePerNight)}/night
              </p>
              <div className="mt-2">
                <Badge variant={roomType.gender === 'MALE' ? 'default' : roomType.gender === 'FEMALE' ? 'secondary' : 'outline'}>
                  {roomType.gender}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accommodations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation Requests</CardTitle>
          <CardDescription>
            Manage all accommodation requests from participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by participant name or room type..."
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
                <SelectItem value="">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Room No.</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccommodations.map((accommodation) => (
                  <TableRow key={accommodation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {accommodation.user.firstName} {accommodation.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{accommodation.user.email}</div>
                        {accommodation.user.college && (
                          <div className="text-xs text-gray-400">{accommodation.user.college}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{accommodation.roomType.name}</div>
                        <div className="text-sm text-gray-500">
                          Capacity: {accommodation.roomType.capacity} • {accommodation.roomType.gender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(accommodation.checkInDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(accommodation.checkOutDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(accommodation.totalCost)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={accommodation.isConfirmed ? 'success' : 'warning'}>
                        {accommodation.isConfirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {accommodation.roomNumber || 'Not assigned'}
                    </TableCell>
                    <TableCell>
                      {!accommodation.isConfirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAccommodation(accommodation)
                            setIsConfirmDialogOpen(true)
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAccommodations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No accommodation requests found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Accommodation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Accommodation</DialogTitle>
            <DialogDescription>
              Assign a room number and confirm the accommodation request.
            </DialogDescription>
          </DialogHeader>
          {selectedAccommodation && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm">
                  <div><strong>Participant:</strong> {selectedAccommodation.user.firstName} {selectedAccommodation.user.lastName}</div>
                  <div><strong>Room Type:</strong> {selectedAccommodation.roomType.name}</div>
                  <div><strong>Duration:</strong> {new Date(selectedAccommodation.checkInDate).toLocaleDateString()} - {new Date(selectedAccommodation.checkOutDate).toLocaleDateString()}</div>
                  <div><strong>Total Cost:</strong> {formatCurrency(selectedAccommodation.totalCost)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Enter room number"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAccommodation}
              disabled={!roomNumber}
            >
              Confirm Accommodation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}