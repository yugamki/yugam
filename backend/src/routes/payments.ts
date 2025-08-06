import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, PaymentStatus, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Create general event pass payment
router.post('/general-pass', authenticate, [
  body('days').isInt({ min: 1, max: 3 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { days } = req.body
    const userId = req.user!.id

    // Check if user already has a general pass
    const existingPass = await prisma.generalEventPass.findUnique({
      where: { userId }
    })

    if (existingPass) {
      return res.status(400).json({ error: 'You already have a general event pass' })
    }

    // Calculate amount based on days
    let amount = 0
    switch (days) {
      case 1:
        amount = 500
        break
      case 2:
        amount = 800
        break
      case 3:
        amount = 1200
        break
      default:
        return res.status(400).json({ error: 'Invalid number of days' })
    }

    // Create general event pass
    const pass = await prisma.generalEventPass.create({
      data: {
        userId,
        days,
        amount
      }
    })

    res.status(201).json({
      message: 'General event pass created successfully',
      pass,
      amount,
      currency: 'INR'
    })
  } catch (error) {
    console.error('Create general pass error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create payment order
router.post('/create-order', authenticate, [
  body('registrationId').isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { registrationId } = req.body
    const userId = req.user!.id

    // Get registration details
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        team: {
          include: { members: true }
        },
        payment: true
      }
    })

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' })
    }

    // Check if user has access
    const hasAccess = registration.userId === userId || 
                     registration.team?.members.some(member => member.userId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check if payment already exists
    if (registration.payment) {
      return res.status(400).json({ error: 'Payment already exists for this registration' })
    }

    // Calculate amount
    let amount = 0
    if (registration.event.eventType === 'PAID' || registration.event.eventType === 'COMBO') {
      if (registration.event.mode === 'INDIVIDUAL') {
        amount = registration.event.feePerPerson || 0
      } else {
        amount = registration.event.feePerTeam || 0
      }
    } else if (registration.event.eventType === 'GENERAL') {
      // Check if user has general event pass
      const generalPass = await prisma.generalEventPass.findUnique({
        where: { userId }
      })
      
      if (!generalPass) {
        return res.status(400).json({ 
          error: 'General event pass required',
          requiresGeneralPass: true
        })
      }
      
      amount = 0 // No additional payment needed for general events if pass exists
    }

    if (amount === 0) {
      // Free event - mark as completed
      const payment = await prisma.payment.create({
        data: {
          userId,
          eventId: registration.eventId,
          registrationId,
          amount: 0,
          status: 'COMPLETED'
        }
      })

      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CONFIRMED' }
      })

      return res.json({
        message: 'Registration confirmed for free event',
        payment
      })
    }

    // For paid events, create payment record
    // In a real implementation, you would integrate with Razorpay here
    const payment = await prisma.payment.create({
      data: {
        userId,
        eventId: registration.eventId,
        registrationId,
        amount,
        status: 'PENDING',
        razorpayOrderId: `order_${Date.now()}` // Mock order ID
      }
    })

    res.json({
      message: 'Payment order created',
      payment,
      amount,
      currency: 'INR'
    })
  } catch (error) {
    console.error('Create payment order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify payment
router.post('/verify', authenticate, [
  body('paymentId').isString(),
  body('razorpayPaymentId').isString(),
  body('razorpaySignature').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: true
      }
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // In a real implementation, verify the payment with Razorpay
    // For now, we'll mark it as completed
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId,
        transactionId: razorpayPaymentId
      }
    })

    // Update registration status
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: 'CONFIRMED' }
    })

    res.json({
      message: 'Payment verified successfully',
      payment: updatedPayment
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get payment details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        event: {
          select: { title: true, startDate: true, venue: true }
        },
        registration: {
          include: {
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
        }
      }
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Check if user has access
    const hasAccess = payment.userId === userId || 
                     payment.registration.team?.members.some(member => member.userId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ payment })
  } catch (error) {
    console.error('Get payment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user payments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        event: {
          select: { title: true, startDate: true, venue: true, isWorkshop: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ payments })
  } catch (error) {
    console.error('Get user payments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all payments (admin only)
router.get('/admin', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, eventType } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    
    if (status) {
      where.status = status
    }

    if (eventType) {
      where.event = {
        eventType: eventType
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, yugamId: true }
          },
          event: {
            select: { title: true, eventType: true, isWorkshop: true }
          },
          registration: {
            include: {
              team: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.payment.count({ where })
    ])

    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin payments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Process refund (admin only)
router.post('/refund/:id', authenticate, authorize(UserRole.ADMIN), [
  body('refundAmount').isFloat({ min: 0 }),
  body('refundReason').trim().isLength({ min: 1 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { refundAmount, refundReason } = req.body

    const payment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only refund completed payments' })
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: 'Refund amount cannot exceed payment amount' })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: refundAmount === payment.amount ? 'REFUNDED' : 'PARTIAL_REFUND',
        refundAmount,
        refundReason,
        refundedAt: new Date()
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        event: { select: { title: true } }
      }
    })

    res.json({
      message: 'Refund processed successfully',
      payment: updatedPayment
    })
  } catch (error) {
    console.error('Process refund error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get payment statistics (admin only)
router.get('/stats', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const [
      totalRevenue,
      completedPayments,
      pendingPayments,
      refundedAmount,
      generalPassRevenue
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),
      prisma.payment.aggregate({
        where: { status: { in: ['REFUNDED', 'PARTIAL_REFUND'] } },
        _sum: { refundAmount: true }
      }),
      prisma.generalEventPass.aggregate({
        _sum: { amount: true }
      })
    ])

    res.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      completedPayments,
      pendingPayments,
      refundedAmount: refundedAmount._sum.refundAmount || 0,
      generalPassRevenue: generalPassRevenue._sum.amount || 0
    })
  } catch (error) {
    console.error('Get payment stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router