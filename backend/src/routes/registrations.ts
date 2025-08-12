import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, RegistrationStatus } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Register for event
router.post('/', authenticate, [
  body('eventId').isString(),
  body('teamId').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { eventId, teamId } = req.body
    const userId = req.user!.id

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Event is not available for registration' })
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        OR: [
          { userId },
          { teamId }
        ]
      }
    })

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' })
    }

    // Check registration limits
    if (event.maxRegistrations && event.currentRegistrations >= event.maxRegistrations) {
      return res.status(400).json({ error: 'Event is full' })
    }

    // For team events, validate team
    if (event.mode === 'TEAM') {
      if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required for team events' })
      }

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true }
      })

      if (!team) {
        return res.status(404).json({ error: 'Team not found' })
      }

      if (team.eventId !== eventId) {
        return res.status(400).json({ error: 'Team is not for this event' })
      }

      // Check if user is team member
      const isMember = team.members.some(member => member.userId === userId)
      if (!isMember) {
        return res.status(403).json({ error: 'You are not a member of this team' })
      }
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: event.mode === 'INDIVIDUAL' ? userId : undefined,
        teamId: event.mode === 'TEAM' ? teamId : undefined,
        eventId,
        status: 'PENDING'
      },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            feePerPerson: true,
            feePerTeam: true
          }
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    // Update event registration count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentRegistrations: {
          increment: 1
        }
      }
    })

    res.status(201).json({
      message: 'Registration successful',
      registration
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get registration details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true }
                }
              }
            }
          }
        },
        payment: true
      }
    })

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' })
    }

    // Check if user has access to this registration
    const hasAccess = registration.userId === userId || 
                     registration.team?.members.some(member => member.userId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ registration })
  } catch (error) {
    console.error('Get registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all registrations (admin only)
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, eventType, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    
    if (eventType) {
      where.event = {
        eventType: eventType
      }
    }

    if (status) {
      where.status = status
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          event: {
            select: {
              title: true,
              eventType: true,
              isWorkshop: true,
              startDate: true,
              venue: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              yugamId: true,
              college: true
            }
          },
          team: {
            select: {
              name: true,
              members: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true, email: true }
                  }
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.registration.count({ where })
    ])

    res.json({
      registrations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin registrations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get paid users (admin only)
router.get('/admin/paid', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where: {
          payment: {
            status: 'COMPLETED'
          }
        },
        include: {
          event: {
            select: {
              title: true,
              isWorkshop: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              college: true
            }
          },
          payment: {
            select: {
              amount: true,
              createdAt: true
            }
          }
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.registration.count({
        where: {
          payment: {
            status: 'COMPLETED'
          }
        }
      })
    ])

    res.json({
      registrations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get paid users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get registration stats (admin only)
router.get('/admin/stats', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const [
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      totalRevenue
    ] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({
        where: { status: 'CONFIRMED' }
      }),
      prisma.registration.count({
        where: { status: 'PENDING' }
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ])

    res.json({
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      totalRevenue: totalRevenue._sum.amount || 0
    })
  } catch (error) {
    console.error('Get registration stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
// Cancel registration
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        team: {
          include: { members: true }
        },
        payment: true
      }
    })

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' })
    }

    // Check if user has access to cancel this registration
    const hasAccess = registration.userId === userId || 
                     registration.team?.creatorId === userId

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check if payment is completed
    if (registration.payment && registration.payment.status === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Cannot cancel registration with completed payment. Please contact support for refund.' 
      })
    }

    // Delete registration
    await prisma.registration.delete({
      where: { id }
    })

    // Update event registration count
    await prisma.event.update({
      where: { id: registration.eventId },
      data: {
        currentRegistrations: {
          decrement: 1
        }
      }
    })

    res.json({ message: 'Registration cancelled successfully' })
  } catch (error) {
    console.error('Cancel registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router