import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Stat {
  name: string
  value: number
  maxValue: number
  icon: string
  color: string
}

export interface UserState {
  level: number
  currentXP: number
  maxXP: number
  achievements: number
  streak: number
  stats: Stat[]
}

const defaultStats: Stat[] = [
  { name: '力量', value: 75, maxValue: 100, icon: '💪', color: '#FF6B6B' },
  { name: '敏捷', value: 60, maxValue: 100, icon: '⚡', color: '#4ECDC4' },
  { name: '智力', value: 85, maxValue: 100, icon: '🧠', color: '#45B7D1' },
  { name: '耐力', value: 70, maxValue: 100, icon: '❤️', color: '#96CEB4' },
  { name: '魅力', value: 65, maxValue: 100, icon: '✨', color: '#FFEAA7' },
  { name: '技术', value: 90, maxValue: 100, icon: '💻', color: '#DDA0DD' },
]

// 获取或初始化用户状态
export async function getUserState(): Promise<UserState> {
  let state = await prisma.userStat.findFirst()
  
  if (!state) {
    state = await prisma.userStat.create({
      data: {
        userId: 'default',
        level: 12,
        currentXP: 1250,
        maxXP: 1500,
      }
    })
  }

  return {
    level: state.level,
    currentXP: state.currentXP,
    maxXP: state.maxXP,
    achievements: 12,
    streak: 5,
    stats: defaultStats,
  }
}

// 更新用户状态
export async function updateUserState(updates: Partial<UserState>): Promise<UserState> {
  const current = await getUserState()
  const newState = { ...current, ...updates }
  
  await prisma.userStat.upsert({
    where: { userId: 'default' },
    update: {
      level: newState.level,
      currentXP: newState.currentXP,
      maxXP: newState.maxXP,
    },
    create: {
      userId: 'default',
      level: newState.level,
      currentXP: newState.currentXP,
      maxXP: newState.maxXP,
    }
  })

  return newState
}

// 添加 XP
export async function addXP(amount: number): Promise<UserState> {
  const state = await getUserState()
  let { currentXP, level, maxXP } = state
  
  currentXP += amount
  
  // 检查升级
  while (currentXP >= maxXP) {
    currentXP -= maxXP
    level += 1
    maxXP = Math.floor(maxXP * 1.2)
  }

  return updateUserState({ currentXP, level, maxXP })
}

// 成就相关函数
export async function initializeAchievements() {
  // 初始化成就逻辑
  const count = await prisma.achievement.count()
  if (count === 0) {
    await prisma.achievement.createMany({
      data: [
        { name: '初次任务', description: '完成第一个任务', icon: '🎯', category: 'task', requirement: 1 },
        { name: '任务达人', description: '完成10个任务', icon: '🏆', category: 'task', requirement: 10 },
        { name: '升级新手', description: '达到5级', icon: '⭐', category: 'level', requirement: 5 },
        { name: '升级大师', description: '达到20级', icon: '👑', category: 'level', requirement: 20 },
      ]
    })
  }
}

export async function getAchievements() {
  return await prisma.achievement.findMany()
}

export async function checkTaskAchievements(taskCount: number) {
  const achievements = await prisma.achievement.findMany({
    where: { category: 'task' }
  })
  
  const unlocked: any[] = []
  for (const achievement of achievements) {
    if (taskCount >= achievement.requirement) {
      unlocked.push(achievement)
    }
  }
  
  return unlocked
}

export async function checkLevelAchievements(level: number) {
  const achievements = await prisma.achievement.findMany({
    where: { category: 'level' }
  })
  
  const unlocked: any[] = []
  for (const achievement of achievements) {
    if (level >= achievement.requirement) {
      unlocked.push(achievement)
    }
  }
  
  return unlocked
}

// 任务相关函数
export async function getTasks() {
  return await prisma.task.findMany({
    where: { userId: 'default' },
    orderBy: { createdAt: 'desc' }
  })
}

export async function addTask(task: any) {
  return await prisma.task.create({
    data: {
      ...task,
      userId: 'default'
    }
  })
}

export async function deleteTaskById(id: string) {
  return await prisma.task.delete({
    where: { id }
  })
}

export async function completeTaskById(id: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { completed: true }
  })
  
  // 添加 XP
  await addXP(task.xp)
  
  return task
}

// 更新属性
export async function updateStat(name: string, value: number): Promise<UserState> {
  const state = await getUserState()
  const newStats = state.stats.map(stat => 
    stat.name === name ? { ...stat, value: Math.min(value, stat.maxValue) } : stat
  )
  
  return updateUserState({ stats: newStats })
}
