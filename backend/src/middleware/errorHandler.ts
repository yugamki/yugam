import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error)

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(400).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists'
        })
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          message: 'The requested record does not exist'
        })
      default:
        return res.status(400).json({
          error: 'Database error',
          message: 'An error occurred while processing your request'
        })
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message
    })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please provide a valid authentication token'
    })
  }

  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.stack
  })
}