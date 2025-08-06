import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Not authenticated.' })
    }

    // Allow ADMIN to access everything
    if (req.user.role === UserRole.ADMIN || roles.includes(req.user.role)) {
      return next()
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' })
    }

    next()
  }
}