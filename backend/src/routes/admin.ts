import express from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Dashboard stats
router.get('/dashboard/stats', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const [totalParticipants, activeEvents, totalRevenue, workshops] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.PARTICIPANT } }),
      prisma.event.count({ where: { status: 'PUBLISHED', isWorkshop: false } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.event.count({ where: { status: 'PUBLISHED', isWorkshop: true } })
    ])

    res.json({
      totalParticipants,
      activeEvents,
      revenue: totalRevenue._sum.amount || 0,
      workshops
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Recent activities
router.get('/dashboard/activities', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    // Get recent registrations, payments, and events
    const [recentRegistrations, recentPayments, recentEvents] = await Promise.all([
      prisma.registration.findMany({
        take: 5,
        orderBy: { registeredAt: 'desc' },
        include: {
          event: { select: { title: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { title: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: 'PENDING_APPROVAL' },
        include: {
          creator: { select: { firstName: true, lastName: true } }
        }
      })
    ])

    const activities = [
      ...recentRegistrations.map(reg => ({
        id: reg.id,
        type: 'registration',
        message: `${reg.user?.firstName} ${reg.user?.lastName} registered for ${reg.event.title}`,
        time: new Date(reg.registeredAt).toLocaleString(),
        status: 'success'
      })),
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment',
        message: `Payment received for ${payment.event.title}`,
        time: new Date(payment.createdAt).toLocaleString(),
        status: payment.status === 'COMPLETED' ? 'success' : 'pending'
      })),
      ...recentEvents.map(event => ({
        id: event.id,
        type: 'event',
        message: `New event "${event.title}" submitted for approval`,
        time: new Date(event.createdAt).toLocaleString(),
        status: 'pending'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    res.json({ activities })
  } catch (error) {
    console.error('Dashboard activities error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Pending approvals
router.get('/dashboard/pending-approvals', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const pendingEvents = await prisma.event.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        creator: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const approvals = pendingEvents.map(event => ({
      id: event.id,
      title: event.title,
      type: event.isWorkshop ? 'Workshop' : 'Event',
      submittedBy: `${event.creator.firstName} ${event.creator.lastName}`,
      submittedAt: new Date(event.createdAt).toLocaleString()
    }))

    res.json({ approvals })
  } catch (error) {
    console.error('Pending approvals error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Events stats
router.get('/events/stats', authenticate, authorize(UserRole.ADMIN, UserRole.EVENTS_LEAD), async (req: AuthRequest, res) => {
  try {
    const [totalEvents, activeEvents, totalRegistrations, pendingApprovals] = await Promise.all([
      prisma.event.count({ where: { isWorkshop: false } }),
      prisma.event.count({ where: { status: 'PUBLISHED', isWorkshop: false } }),
      prisma.registration.count({
        where: {
          event: { isWorkshop: false }
        }
      }),
      prisma.event.count({ where: { status: 'PENDING_APPROVAL', isWorkshop: false } })
    ])

    res.json({
      totalEvents,
      activeEvents,
      totalRegistrations,
      pendingApprovals
    })
  } catch (error) {
    console.error('Events stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Workshops stats
router.get('/workshops/stats', authenticate, authorize(UserRole.ADMIN, UserRole.WORKSHOPS_LEAD), async (req: AuthRequest, res) => {
  try {
    const [totalWorkshops, activeWorkshops, totalParticipants, pendingApprovals] = await Promise.all([
      prisma.event.count({ where: { isWorkshop: true } }),
      prisma.event.count({ where: { status: 'PUBLISHED', isWorkshop: true } }),
      prisma.registration.count({
        where: {
          event: { isWorkshop: true }
        }
      }),
      prisma.event.count({ where: { status: 'PENDING_APPROVAL', isWorkshop: true } })
    ])

    res.json({
      totalWorkshops,
      activeWorkshops,
      totalParticipants,
      pendingApprovals
    })
  } catch (error) {
    console.error('Workshops stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get events for admin
router.get('/events', authenticate, authorize(UserRole.ADMIN, UserRole.EVENTS_LEAD), async (req: AuthRequest, res) => {
  try {
    const { limit = 10 } = req.query

    const events = await prisma.event.findMany({
      where: { isWorkshop: false },
      include: {
        creator: { select: { firstName: true, lastName: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    })

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      category: event.category,
      status: event.status,
      registrations: event._count.registrations,
      maxRegistrations: event.maxRegistrations || 0,
      startDate: event.startDate.toISOString(),
      coordinator: `${event.creator.firstName} ${event.creator.lastName}`
    }))

    res.json({ events: formattedEvents })
  } catch (error) {
    console.error('Get admin events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get workshops for admin
router.get('/workshops', authenticate, authorize(UserRole.ADMIN, UserRole.WORKSHOPS_LEAD), async (req: AuthRequest, res) => {
  try {
    const { limit = 10 } = req.query

    const workshops = await prisma.event.findMany({
      where: { isWorkshop: true },
      include: {
        creator: { select: { firstName: true, lastName: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    })

    const formattedWorkshops = workshops.map(workshop => ({
      id: workshop.id,
      title: workshop.title,
      category: workshop.category,
      status: workshop.status,
      registrations: workshop._count.registrations,
      maxRegistrations: workshop.maxRegistrations || 0,
      startDate: workshop.startDate.toISOString(),
      coordinator: `${workshop.creator.firstName} ${workshop.creator.lastName}`
    }))

    res.json({ workshops: formattedWorkshops })
  } catch (error) {
    console.error('Get admin workshops error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router