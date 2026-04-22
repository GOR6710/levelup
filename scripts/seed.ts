import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建测试用户
  const hashedPassword = await bcrypt.hash('test123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
    },
  })

  // 创建用户统计
  await prisma.userStat.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      level: 1,
      currentXP: 0,
      maxXP: 100,
    },
  })

  console.log('测试用户创建成功:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
