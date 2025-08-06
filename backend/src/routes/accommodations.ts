import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, AccommodationType } from '@prisma/client'
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
  body('type').isIn(Object.values(AccommodationType)),
  body('checkInDate').isISO8601(),
  body('checkOutDate').isISO8601(),
  body('specialRequests').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { type, checkInDate, checkOutDate, specialRequests } = req.body
    const userId = req.user!.id

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
    let costPerNight = 0

    switch (type) {
      case 'SINGLE_ROOM':
        costPerNight = 1500
        break
      case 'DOUBLE_ROOM':
        costPerNight = 1000
        break
      case 'DORMITORY':
        costPerNight = 500
        break
      case 'EXTERNAL':
        costPerNight = 0
        break
    }

    const totalCost = costPerNight * nights

    // Create accommodation request
    const accommodation = await prisma.accommodation.create({
      data: {
        userId,
        type,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        specialRequests,
        totalCost,
        isConfirmed: type === 'EXTERNAL' // External accommodation is auto-confirmed
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
  body('type').optional().isIn(Object.values(AccommodationType)),
  body('checkInDate').optional().isISO8601(),
  body('checkOutDate').optional().isISO8601(),
  body('specialRequests').optional().trim()
], async (req: AuthRequest, res) => {
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
router.get('/admin', authenticate, authorize('OVERALL_ADMIN', 'SOFTWARE_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    
    if (type) {
      where.type = type
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
router.patch('/:id/confirm', authenticate, authorize('OVERALL_ADMIN', 'SOFTWARE_ADMIN'), [
  body('roomNumber').optional().trim(),
  body('roommates').optional().isArray()
], async (req: AuthRequest, res) => {
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

export default router