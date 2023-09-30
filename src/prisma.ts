import { PrismaClient } from '@prisma/client'

// Create and export the Prisma Client instance
export default (() => {
  const prisma = new PrismaClient({
    // Enable NAPI (Native API) for query optimization
    // This is an experimental feature and may change in future versions
  })

  // Ensure the Prisma Client is connected when the module is loaded
  prisma.$connect().then(() => {
    console.info('Connected to Prisma', 'DB')
  })

  // Handle any errors during connection

  // Ensure the Prisma Client is disconnected when the application exits
  process.on('beforeExit', () => {
    prisma.$disconnect()
  })

  return prisma
})()
