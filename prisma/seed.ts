import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@levelup.app' },
    update: {},
    create: {
      email: 'test@levelup.app',
      username: 'TestUser',
    },
  })
  console.log('✅ User created:', user.id)

  // Create user stats
  await prisma.userStat.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      level: 12,
      currentXP: 1250,
      maxXP: 1500,
      totalPower: 460,
      achievementsCount: 12,
      streakDays: 5,
    },
  })
  console.log('✅ User stats created')

  // Create stats
  const statsData = [
    { name: '力量', value: 75, color: '#ff6b6b', icon: '💪' },
    { name: '智力', value: 85, color: '#4ecdc4', icon: '🧠' },
    { name: '社交', value: 60, color: '#ffe66d', icon: '👥' },
    { name: '技能', value: 90, color: '#a8e6cf', icon: '💻' },
    { name: '心理', value: 70, color: '#ff8b94', icon: '❤️' },
    { name: '效率', value: 80, color: '#c7ceea', icon: '⏰' },
  ]

  for (const stat of statsData) {
    await prisma.stat.upsert({
      where: { 
        userId_name: { 
          userId: user.id, 
          name: stat.name 
        } 
      },
      update: {},
      create: {
        userId: user.id,
        name: stat.name,
        value: stat.value,
        maxValue: 100,
        color: stat.color,
        icon: stat.icon,
      },
    })
  }
  console.log('✅ Stats created')

  // Create sample tasks
  const tasksData = [
    { title: '完成项目文档', description: '编写 LevelUp v3.0 技术文档', type: 'main', difficulty: 'hard', xp: 500 },
    { title: '晨间锻炼', description: '30分钟有氧运动', type: 'daily', difficulty: 'easy', xp: 100 },
    { title: '阅读技术文章', description: '学习 React 新特性', type: 'side', difficulty: 'medium', xp: 200 },
    { title: '代码审查', description: 'Review 团队成员代码', type: 'main', difficulty: 'medium', xp: 200 },
    { title: '冥想', description: '15分钟正念冥想', type: 'daily', difficulty: 'easy', xp: 100 },
  ]

  for (const task of tasksData) {
    await prisma.task.create({
      data: {
        userId: user.id,
        title: task.title,
        description: task.description,
        type: task.type,
        difficulty: task.difficulty,
        xp: task.xp,
        completed: false,
      },
    })
  }
  console.log('✅ Sample tasks created')

  // Create sample achievements
  const achievementsData = [
    { name: '初出茅庐', description: '完成第一个任务', icon: '🎯' },
    { name: '连胜大师', description: '连续7天完成任务', icon: '🔥' },
    { name: '升级狂人', description: '达到10级', icon: '⭐' },
    { name: '任务达人', description: '完成50个任务', icon: '🏆' },
  ]

  for (const achievement of achievementsData) {
    await prisma.achievement.create({
      data: {
        userId: user.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: new Date(),
      },
    })
  }
  console.log('✅ Sample achievements created')

  console.log('\n✨ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
