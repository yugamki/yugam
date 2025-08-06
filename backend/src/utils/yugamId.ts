import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateYugamId(): Promise<string> {
  let yugamId: string
  let isUnique = false

  while (!isUnique) {
    // Generate 5-digit random number
    const randomNumber = Math.floor(10000 + Math.random() * 90000)
    yugamId = `YUG26-${randomNumber}`

    // Check if this ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { yugamId }
    })

    if (!existingUser) {
      isUnique = true
    }
  }

  return yugamId!
}

export function generateQRCode(yugamId: string): string {
  // In a real implementation, you would generate an actual QR code
  // For now, we'll return a placeholder URL
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${yugamId}`
}