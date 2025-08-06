import express, { Request, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { PrismaClient, UserRole, EventStatus, EventType } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get all events (public)
router.get('/', [
  query('category').optional().trim(),
  query('type').optional().isIn(['GENERAL', 'PAID', 'COMBO']),
  query('status').optional().isIn(['PUBLISHED', 'APPROVED']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { category, type, status = 'PUBLISHED', search, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {
      status: status as EventStatus,
      isWorkshop: false
    }

    if (category) {
      where.category = category
    }

    if (type) {
      where.eventType = type
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { domain: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creator: {
            select: { firstName: true, lastName: true }
          },
          _count: {
            select: { registrations: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.event.count({ where })
    ])

    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get workshops (public)
router.get('/workshops', [
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { category, search, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {
      status: 'PUBLISHED',
      isWorkshop: true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { domain: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [workshops, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creator: {
            select: { firstName: true, lastName: true }
          },
          _count: {
            select: { registrations: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.event.count({ where })
    ])

    res.json({
      workshops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get workshops error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { firstName: true, lastName: true, email: true }
        },
        manager: {
          select: { firstName: true, lastName: true, email: true }
        },
        forms: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ event })
  } catch (error) {
    console.error('Get event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create event (authenticated users)
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 1 }),
  body('domain').trim().isLength({ min: 1 }),
  body('category').trim().isLength({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('duration').isInt({ min: 1, max: 3 }),
  body('eventType').isIn(['GENERAL', 'PAID', 'COMBO']),
  body('mode').isIn(['INDIVIDUAL', 'TEAM']),
  body('expectedParticipants').isInt({ min: 1 }),
  body('isWorkshop').optional().isBoolean(),
  body('venue').optional().trim(),
  body('maxRegistrations').optional().isInt({ min: 1 }),
  body('minTeamSize').optional().isInt({ min: 1 }),
  body('maxTeamSize').optional().isInt({ min: 1 }),
  body('feePerPerson').optional().isFloat({ min: 0 }),
  body('feePerTeam').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const eventData = req.body
    const userId = req.user!.id
    const userRole = req.user!.role

    // Only ADMIN can create COMBO events
    if (eventData.eventType === 'COMBO' && 
        userRole !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can create combo events' })
    }

    // Only EVENTS_LEAD and above can create GENERAL/PAID events
    if (!eventData.isWorkshop && 
        !([UserRole.EVENTS_LEAD, UserRole.ADMIN] as UserRole[]).includes(userRole)) {
      return res.status(403).json({ error: 'Only events team lead and above can create events' })
    }

    // Only WORKSHOPS_LEAD and above can create workshops
    if (eventData.isWorkshop && 
        !([UserRole.WORKSHOPS_LEAD, UserRole.ADMIN] as UserRole[]).includes(userRole)) {
      return res.status(403).json({ error: 'Only workshops team lead and above can create workshops' })
    }

    // Validate dates
    const startDate = new Date(eventData.startDate)
    const endDate = new Date(eventData.endDate)

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'End date must be after start date' })
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate,
        endDate,
        creatorId: userId,
        status: 'PENDING_APPROVAL'
      },
      include: {
        creator: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    res.status(201).json({
      message: 'Event created successfully and sent for approval',
      event
    })
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update event (creator or admin)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Check permissions
    const canEdit = event.creatorId === userId || 
                   ([UserRole.ADMIN, UserRole.EVENTS_LEAD] as UserRole[]).includes(userRole)

    if (!canEdit) {
      return res.status(403).json({ error: 'Not authorized to edit this event' })
    }

    // Check if event is locked (approved events cannot be edited)
    if (event.status === 'APPROVED' || event.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot edit approved/published events' })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: req.body,
      include: {
        creator: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    })
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Approve/Reject event (admin only)
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.EVENTS_LEAD), [
  body('status').isIn(['APPROVED', 'PUBLISHED', 'CANCELLED']),
  body('managerId').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { status, managerId } = req.body

    const updateData: any = { status }
    if (managerId) {
      updateData.managerId = managerId
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { firstName: true, lastName: true, email: true }
        },
        manager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    res.json({
      message: `Event ${status.toLowerCase()} successfully`,
      event
    })
  } catch (error) {
    console.error('Update event status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete event (creator or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Check permissions
    const canDelete = event.creatorId === userId || 
                     userRole === UserRole.ADMIN

    if (!canDelete) {
      return res.status(403).json({ error: 'Not authorized to delete this event' })
    }

    await prisma.event.delete({
      where: { id }
    })

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router