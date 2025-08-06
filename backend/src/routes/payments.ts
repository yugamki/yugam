import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, PaymentStatus } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

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

export default router