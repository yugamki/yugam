import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        college: true,
        year: true,
        department: true,
        role: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            createdEvents: true,
            teamMemberships: true
          }
        }
      }
    })

    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.put('/profile', authenticate, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone('en-IN'),
  body('college').optional().trim(),
  body('year').optional().trim(),
  body('department').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, phone, college, year, department } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName,
        lastName,
        phone,
        college,
        year,
        department
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        college: true,
        year: true,
        department: true,
        role: true,
        profileImage: true
      }
    })

    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all users (admin only)
router.get('/', authenticate, authorize(UserRole.OVERALL_ADMIN, UserRole.SOFTWARE_ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query

    const where: any = {}
    
    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { college: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          college: true,
          year: true,
          department: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              registrations: true,
              createdEvents: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user role (admin only)
router.patch('/:id/role', authenticate, authorize(UserRole.OVERALL_ADMIN), [
  body('role').isIn(Object.values(UserRole))
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { role } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })

    res.json({
      message: 'User role updated successfully',
      user
    })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user registrations
router.get('/registrations', authenticate, async (req: AuthRequest, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            eventType: true,
            isWorkshop: true
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
      orderBy: { registeredAt: 'desc' }
    })

    res.json({ registrations })
  } catch (error) {
    console.error('Get user registrations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router