import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'
import nodemailer from 'nodemailer'

const router = express.Router()
const prisma = new PrismaClient()

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send email communication
router.post('/email', authenticate, authorize(
  UserRole.EVENTS_LEAD, 
  UserRole.WORKSHOPS_LEAD, 
  UserRole.ADMIN
), [
  body('eventId').optional().isString(),
  body('subject').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1 }),
  body('replyTo').isEmail()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { eventId, subject, content, replyTo } = req.body
    const userId = req.user!.id

    // Get event details if eventId provided
    let event = null
    if (eventId) {
      event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          registrations: {
            include: {
              user: { select: { email: true, firstName: true, lastName: true } },
              team: {
                include: {
                  members: {
                    include: {
                      user: { select: { email: true, firstName: true, lastName: true } }
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!event) {
        return res.status(404).json({ error: 'Event not found' })
      }

      // Check if user has permission to send emails for this event
      const userRole = req.user!.role
      if (!([UserRole.ADMIN] as UserRole[]).includes(userRole)) {
        if (event.isWorkshop && userRole !== UserRole.WORKSHOPS_LEAD) {
          return res.status(403).json({ error: 'Only workshops lead can send emails for workshops' })
        }
        if (!event.isWorkshop && userRole !== UserRole.EVENTS_LEAD) {
          return res.status(403).json({ error: 'Only events lead can send emails for events' })
        }
      }
    }

    // Get recipient emails
    let recipients: string[] = []
    if (event) {
      // Get all registered users for the event
      event.registrations.forEach(reg => {
        if (reg.user) {
          recipients.push(reg.user.email)
        }
        if (reg.team) {
          reg.team.members.forEach(member => {
            recipients.push(member.user.email)
          })
        }
      })
    } else {
      // Send to all participants if no specific event
      const users = await prisma.user.findMany({
        where: { role: UserRole.PARTICIPANT },
        select: { email: true }
      })
      recipients = users.map(user => user.email)
    }

    // Remove duplicates
    recipients = [...new Set(recipients)]

    // Send emails
    const emailPromises = recipients.map(email => 
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        replyTo,
        subject,
        html: content,
      })
    )

    await Promise.all(emailPromises)

    // Save communication record
    const communication = await prisma.emailCommunication.create({
      data: {
        eventId,
        senderId: userId,
        subject,
        content,
        replyTo,
        recipientCount: recipients.length,
        status: 'SENT'
      },
      include: {
        event: { select: { title: true, isWorkshop: true } },
        sender: { select: { firstName: true, lastName: true } }
      }
    })

    res.status(201).json({
      message: 'Email sent successfully',
      communication,
      recipientCount: recipients.length
    })
  } catch (error) {
    console.error('Send email error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

// Get sent emails
router.get('/emails', authenticate, authorize(
  UserRole.EVENTS_LEAD, 
  UserRole.WORKSHOPS_LEAD, 
  UserRole.ADMIN
), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const userRole = req.user!.role
    const { page = 1, limit = 20 } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    let where: any = {}
    
    // Filter based on user role
    if (userRole !== UserRole.ADMIN) {
      if (userRole === UserRole.EVENTS_LEAD) {
        where = {
          OR: [
            { senderId: userId },
            { event: { isWorkshop: false } }
          ]
        }
      } else if (userRole === UserRole.WORKSHOPS_LEAD) {
        where = {
          OR: [
            { senderId: userId },
            { event: { isWorkshop: true } }
          ]
        }
      } else {
        where.senderId = userId
      }
    }

    const [emails, total] = await Promise.all([
      prisma.emailCommunication.findMany({
        where,
        include: {
          event: { select: { title: true, isWorkshop: true } },
          sender: { select: { firstName: true, lastName: true } }
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.emailCommunication.count({ where })
    ])

    res.json({
      emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get emails error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Request WhatsApp message
router.post('/whatsapp/request', authenticate, authorize(
  UserRole.EVENTS_LEAD, 
  UserRole.WORKSHOPS_LEAD, 
  UserRole.ADMIN
), [
  body('eventId').optional().isString(),
  body('message').trim().isLength({ min: 1, max: 512 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { eventId, message } = req.body
    const userId = req.user!.id

    // Validate event if provided
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) {
        return res.status(404).json({ error: 'Event not found' })
      }
    }

    const request = await prisma.whatsAppRequest.create({
      data: {
        eventId,
        senderId: userId,
        message,
        status: 'PENDING'
      },
      include: {
        event: { select: { title: true, isWorkshop: true } },
        sender: { select: { firstName: true, lastName: true } }
      }
    })

    res.status(201).json({
      message: 'WhatsApp request submitted for approval',
      request
    })
  } catch (error) {
    console.error('WhatsApp request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get WhatsApp requests (admin only)
router.get('/whatsapp/requests', authenticate, authorize(
  UserRole.ADMIN
), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.whatsAppRequest.findMany({
        where,
        include: {
          event: { select: { title: true, isWorkshop: true } },
          sender: { select: { firstName: true, lastName: true } },
          approver: { select: { firstName: true, lastName: true } }
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.whatsAppRequest.count({ where })
    ])

    res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get WhatsApp requests error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Approve/Reject WhatsApp request
router.patch('/whatsapp/requests/:id', authenticate, authorize(
  UserRole.ADMIN
), [
  body('status').isIn(['APPROVED', 'REJECTED'])
], async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user!.id

    const request = await prisma.whatsAppRequest.update({
      where: { id },
      data: {
        status,
        approvedAt: new Date(),
        approvedBy: userId
      },
      include: {
        event: { select: { title: true } },
        sender: { select: { firstName: true, lastName: true } }
      }
    })

    res.json({
      message: `WhatsApp request ${status.toLowerCase()}`,
      request
    })
  } catch (error) {
    console.error('Approve WhatsApp request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's events for communication
router.get('/user-events', authenticate, authorize(
  UserRole.EVENTS_LEAD, 
  UserRole.WORKSHOPS_LEAD, 
  UserRole.ADMIN
), async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role

    let where: any = {}
    
    if (userRole === UserRole.EVENTS_LEAD) {
      where.isWorkshop = false
    } else if (userRole === UserRole.WORKSHOPS_LEAD) {
      where.isWorkshop = true
    }

    const events = await prisma.event.findMany({
      where: {
        ...where,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        isWorkshop: true,
        startDate: true
      },
      orderBy: { startDate: 'asc' }
    })

    res.json({ events })
  } catch (error) {
    console.error('Get user events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router