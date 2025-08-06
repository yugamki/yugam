import express from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get content by key (public)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params

    const content = await prisma.content.findUnique({
      where: { 
        key,
        isPublished: true
      }
    })

    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }

    res.json({ content })
  } catch (error) {
    console.error('Get content error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all content (admin only)
router.get('/', authenticate, authorize(UserRole.OVERALL_ADMIN, UserRole.SOFTWARE_ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, published } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (published !== undefined) {
      where.isPublished = published === 'true'
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.content.count({ where })
    ])

    res.json({
      contents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get all content error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create content (admin only)
router.post('/', authenticate, authorize(UserRole.OVERALL_ADMIN, UserRole.SOFTWARE_ADMIN), [
  body('key').trim().isLength({ min: 1, max: 100 }),
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1 }),
  body('isPublished').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { key, title, content, isPublished = true } = req.body

    const newContent = await prisma.content.create({
      data: {
        key,
        title,
        content,
        isPublished
      }
    })

    res.status(201).json({
      message: 'Content created successfully',
      content: newContent
    })
  } catch (error) {
    console.error('Create content error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update content (admin only)
router.put('/:id', authenticate, authorize(UserRole.OVERALL_ADMIN, UserRole.SOFTWARE_ADMIN), [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('isPublished').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params

    const updatedContent = await prisma.content.update({
      where: { id },
      data: req.body
    })

    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    })
  } catch (error) {
    console.error('Update content error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete content (admin only)
router.delete('/:id', authenticate, authorize(UserRole.OVERALL_ADMIN, UserRole.SOFTWARE_ADMIN), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    await prisma.content.delete({
      where: { id }
    })

    res.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Delete content error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router