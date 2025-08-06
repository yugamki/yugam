/// <reference types="node" />
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('IamYUGAM123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yugam.in' },
    update: {},
    create: {
      email: 'admin@yugam.in',
      password: hashedPassword,
      firstName: 'Yugam',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      yugamId: 'YUG26-00001',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YUG26-00001'
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample room types
  const maleRoomType = await prisma.roomType.upsert({
    where: { name: 'Male Dormitory' },
    update: {},
    create: {
      name: 'Male Dormitory',
      description: 'Shared dormitory accommodation for male participants',
      capacity: 4,
      pricePerNight: 500,
      amenities: ['WiFi', 'AC', 'Shared Bathroom', 'Study Table'],
      gender: 'MALE',
      totalRooms: 50,
      availableRooms: 50
    }
  })

  const femaleRoomType = await prisma.roomType.upsert({
    where: { name: 'Female Dormitory' },
    update: {},
    create: {
      name: 'Female Dormitory',
      description: 'Shared dormitory accommodation for female participants',
      capacity: 4,
      pricePerNight: 500,
      amenities: ['WiFi', 'AC', 'Shared Bathroom', 'Study Table'],
      gender: 'FEMALE',
      totalRooms: 50,
      availableRooms: 50
    }
  })

  console.log('✅ Room types created')

  // Create sample content
  await prisma.content.upsert({
    where: { key: 'homepage_hero' },
    update: {},
    create: {
      key: 'homepage_hero',
      title: 'Welcome to Yugam 2025',
      content: '<h1>India\'s Most Spectacular College Festival</h1><p>Join 25,000+ students for three unforgettable days of innovation, culture, competition, and celebration.</p>',
      isPublished: true
    }
  })

  console.log('✅ Sample content created')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })