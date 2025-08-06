import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get user accommodation
router.get('/my-accommodation', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const accommodation = await prisma.accommodation.findUnique({
      where: { userId },
      include: {
        roomType: true,
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true }
        }
      }
    })

    res.json({ accommodation })
  } catch (error) {
    console.error('Get accommodation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Request accommodation
router.post('/', authenticate, [
  body('roomTypeId').isString(),
  body('checkInDate').isISO8601(),
  body('checkOutDate').isISO8601(),
  body('specialRequests').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { roomTypeId, checkInDate, checkOutDate, specialRequests } = req.body
    const userId = req.user!.id

    // Get user details for gender validation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true }
    })

    if (!user?.gender) {
      return res.status(400).json({ error: 'Please update your gender in profile before booking accommodation' })
    }

    // Get room type details
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId }
    })

    if (!roomType) {
      return res.status(404).json({ error: 'Room type not found' })
    }

    if (!roomType.isActive) {
      return res.status(400).json({ error: 'This room type is not available' })
    }

    if (roomType.gender !== user.gender) {
      return res.status(400).json({ error: 'This room type is not available for your gender' })
    }

    if (roomType.availableRooms <= 0) {
      return res.status(400).json({ error: 'No rooms available for this type' })
    }

    // Check if user already has accommodation
    const existingAccommodation = await prisma.accommodation.findUnique({
      where: { userId }
    })

    if (existingAccommodation) {
      return res.status(400).json({ error: 'You already have an accommodation request' })
    }

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' })
    }

    // Calculate cost based on type and duration
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalCost = roomType.pricePerNight * nights

    // Create accommodation request
    const accommodation = await prisma.accommodation.create({
      data: {
        userId,
        roomTypeId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        specialRequests,
        totalCost,
        isConfirmed: false
      },
      include: {
        roomType: true
      }
    })

    // Decrease available rooms
    await prisma.roomType.update({
      where: { id: roomTypeId },
      data: {
        availableRooms: {
          decrement: 1
        }
      }
    })

    res.status(201).json({
      message: 'Accommodation request created successfully',
      accommodation
    })
  } catch (error) {
    console.error('Create accommodation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update accommodation
router.put('/:id', authenticate, [
  body('roomTypeId').optional().isString(),
  body('checkInDate').optional().isISO8601(),
  body('checkOutDate').optional().isISO8601(),
  body('specialRequests').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const userId = req.user!.id

    const accommodation = await prisma.accommodation.findUnique({
      where: { id }
    })

    if (!accommodation) {
      return res.status(404).json({ error: 'Accommodation not found' })
    }

    if (accommodation.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (accommodation.isConfirmed) {
      return res.status(400).json({ error: 'Cannot modify confirmed accommodation' })
    }

    const updatedAccommodation = await prisma.accommodation.update({
      where: { id },
      data: req.body
    })

    res.json({
      message: 'Accommodation updated successfully',
      accommodation: updatedAccommodation
    })
  } catch (error) {
    console.error('Update accommodation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Cancel accommodation
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const accommodation = await prisma.accommodation.findUnique({
      where: { id }
    })

    if (!accommodation) {
      return res.status(404).json({ error: 'Accommodation not found' })
    }

    if (accommodation.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await prisma.accommodation.delete({
      where: { id }
    })

    res.json({ message: 'Accommodation cancelled successfully' })
  } catch (error) {
    console.error('Cancel accommodation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all accommodations (admin only)
router.get('/admin', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, roomTypeId, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    
    if (roomTypeId) {
      where.roomTypeId = roomTypeId
    }

    if (status === 'confirmed') {
      where.isConfirmed = true
    } else if (status === 'pending') {
      where.isConfirmed = false
    }

    const [accommodations, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        include: {
          roomType: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              college: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.accommodation.count({ where })
    ])

    res.json({
      accommodations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin accommodations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Confirm accommodation (admin only)
router.patch('/:id/confirm', authenticate, authorize(UserRole.ADMIN), [
  body('roomNumber').optional().trim(),
  body('roommates').optional().isArray()
], async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { roomNumber, roommates } = req.body

    const accommodation = await prisma.accommodation.update({
      where: { id },
      data: {
        isConfirmed: true,
        roomNumber,
        roommates: roommates || []
      },
      include: {
        roomType: true,
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    res.json({
      message: 'Accommodation confirmed successfully',
      accommodation
    })
  } catch (error) {
    console.error('Confirm accommodation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get room types (public)
router.get('/room-types', async (req, res) => {
  try {
    const { gender } = req.query

    const where: any = { isActive: true }
    if (gender) {
      where.gender = gender
    }

    const roomTypes = await prisma.roomType.findMany({
      where,
      orderBy: { pricePerNight: 'asc' }
    })

    res.json({ roomTypes })
  } catch (error) {
    console.error('Get room types error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create room type (admin only)
router.post('/room-types', authenticate, authorize(UserRole.ADMIN), [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('capacity').isInt({ min: 1 }),
  body('pricePerNight').isFloat({ min: 0 }),
  body('amenities').optional().isArray(),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']),
  body('totalRooms').isInt({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, description, capacity, pricePerNight, amenities, gender, totalRooms } = req.body

    const roomType = await prisma.roomType.create({
      data: {
        name,
        description,
        capacity,
        pricePerNight,
        amenities: amenities || [],
        gender,
        totalRooms,
        availableRooms: totalRooms
      }
    })

    res.status(201).json({
      message: 'Room type created successfully',
      roomType
    })
  } catch (error) {
    console.error('Create room type error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update room type (admin only)
router.put('/room-types/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const roomType = await prisma.roomType.update({
      where: { id },
      data: req.body
    })

    res.json({
      message: 'Room type updated successfully',
      roomType
    })
  } catch (error) {
    console.error('Update room type error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router