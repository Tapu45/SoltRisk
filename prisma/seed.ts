import { PrismaClient } from '../src/generated/prisma'
import { v4 as uuidv4 } from 'uuid'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const userId = uuidv4()
  const adminId = uuidv4()
  
  // Hash the password
  const hashedPassword = await bcrypt.hash('admin', 10)

  // Create the user with ADMIN role
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      updatedAt: new Date(),
      Admin: {
        create: {
          id: adminId
        }
      }
    }
  })

  console.log(`Created admin user: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })