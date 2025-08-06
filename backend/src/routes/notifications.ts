import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where: any = { userId }
    if (unreadOnly === 'true') {
      where.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        include: {
          notification: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.userNotification.count({ where }),
      prisma.userNotification.count({
        where: { userId, isRead: false }
      })
    ])

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const notification = await prisma.userNotification.update({
      where: {
        id,
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({
      message: 'Notification marked as read',
      notification
    })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    await prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create notification (admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('message').trim().isLength({ min: 1 }),
  body('type').trim().isLength({ min: 1 }),
  body('targetRole').optional().isIn(Object.values(UserRole)),
  body('targetCategory').optional().trim(),
  body('targetEventId').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, message, type, targetRole, targetCategory, targetEventId } = req.body

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        targetRole,
        targetCategory,
        targetEventId
      }
    })

    // Find target users
    const where: any = {}
    
    if (targetRole) {
      where.role = targetRole
    }

    if (targetEventId) {
      // Users registered for specific event
      where.registrations = {
        some: {
          eventId: targetEventId
        }
      }
    }

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true }
    })

    // Create user notifications
    const userNotifications = targetUsers.map(user => ({
      userId: user.id,
      notificationId: notification.id
    }))

    await prisma.userNotification.createMany({
      data: userNotifications
    })

    res.status(201).json({
      message: 'Notification created and sent successfully',
      notification,
      targetCount: targetUsers.length
    })
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all notifications (admin only)
router.get('/admin', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        include: {
          _count: {
            select: {
              userNotifications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.notification.count()
    ])

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router