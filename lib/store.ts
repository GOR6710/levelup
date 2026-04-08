import { prisma } from './prisma'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'task' | 'level' | 'streak'
  requirement: string
  xpReward: number
  target: number
  progress: number
  unlocked: boolean
  unlockedAt?: Date
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'main' | 'daily' | 'side'
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  completed: boolean
  completedAt?: Date
}

export interface UserState {
  level: number
  currentXP: number
  maxXP: number
  achievements: number
  streak: number
  stats: { name: string; value: number; maxValue: number; color: string; icon: string }[]
}

// 默认属性
const defaultStats = [
  { name: '力量', value: 75, maxValue: 100, color: '#ff6b6b', icon: '💪' },
  { name: '智力', value: 85, maxValue: 100, color: '#4ecdc4', icon: '🧠' },
  { name: '社交', value: 60, maxValue: 100, color: '#ffe66d', icon: '👥' },
  { name: '技能', value: 90, maxValue: 100, color: '#a8e6cf', icon: '💻' },
  { name: '心理', value: 70, maxValue: 100, color: '#ff8b94', icon: '❤️' },
  { name: '效率', value: 80, maxValue: 100, color: '#c7ceea', icon: '⏰' },
]

// 获取或初始化用户状态
export async function getUserState(): Promise<UserState> {
  let state = await prisma.userState.findFirst()
  
  if (!state) {
    state = await prisma.userState.create({
      data: {
        level: 12,
        currentXP: 1250,
        maxXP: 1500,
        achievements: 12,
        streak: 5,
        stats: JSON.stringify(defaultStats),
      }
    })
  }
  
  return {
    level: state.level,
    currentXP: state.currentXP,
    maxXP: state.maxXP,
    achievements: state.achievements,
    streak: state.streak,
    stats: JSON.parse(state.stats),
  }
}

// 更新用户状态
export async function updateUserState(updates: Partial<UserState>): Promise<UserState> {
  const current = await getUserState()
  const newState = { ...current, ...updates }
  
  await prisma.userState.updateMany({
    data: {
      level: newState.level,
      currentXP: newState.currentXP,
      maxXP: newState.maxXP,
      achievements: newState.achievements,
      streak: newState.streak,
      stats: JSON.stringify(newState.stats),
    }
  })
  
  return newState
}

// 获取所有任务
export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  return tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    type: t.type as any,
    difficulty: t.difficulty as any,
    xp: t.xp,
    completed: t.completed,
    completedAt: t.completedAt || undefined,
  }))
}

// 添加任务
export async function addTask(task: Omit<Task, 'id'>): Promise<Task> {
  const newTask = await prisma.task.create({
    data: {
      title: task.title,
      description: task.description,
      type: task.type,
      difficulty: task.difficulty,
      xp: task.xp,
      completed: task.completed,
    }
  })
  
  return {
    id: newTask.id,
    title: newTask.title,
    description: newTask.description || '',
    type: newTask.type as any,
    difficulty: newTask.difficulty as any,
    xp: newTask.xp,
    completed: newTask.completed,
    completedAt: newTask.completedAt || undefined,
  }
}

// 删除任务
export async function deleteTaskById(id: string): Promise<Task | null> {
  try {
    const deleted = await prisma.task.delete({
      where: { id }
    })
    
    return {
      id: deleted.id,
      title: deleted.title,
      description: deleted.description || '',
      type: deleted.type as any,
      difficulty: deleted.difficulty as any,
      xp: deleted.xp,
      completed: deleted.completed,
      completedAt: deleted.completedAt || undefined,
    }
  } catch {
    return null
  }
}

// 完成任务
export async function completeTaskById(id: string): Promise<{ task: Task | null; xpGained: number; leveledUp: boolean; newState?: UserState }> {
  const task = await prisma.task.findUnique({ where: { id } })
  
  if (!task || task.completed) {
    return { task: null, xpGained: 0, leveledUp: false }
  }
  
  // 更新任务状态
  await prisma.task.update({
    where: { id },
    data: { completed: true, completedAt: new Date() }
  })
  
  // 更新用户状态
  const userState = await getUserState()
  let newXP = userState.currentXP + task.xp
  let leveledUp = false
  let newLevel = userState.level
  let newMaxXP = userState.maxXP
  
  if (newXP >= userState.maxXP) {
    newLevel = userState.level + 1
    newXP = newXP - userState.maxXP
    newMaxXP = Math.floor(userState.maxXP * 1.2)
    leveledUp = true
    
    // 随机增加属性
    const newStats = [...userState.stats]
    const randomStatIndex = Math.floor(Math.random() * newStats.length)
    newStats[randomStatIndex].value = Math.min(newStats[randomStatIndex].value + 2, 100)
    
    await updateUserState({
      level: newLevel,
      currentXP: newXP,
      maxXP: newMaxXP,
      achievements: userState.achievements + 1,
      stats: newStats
    })
  } else {
    await updateUserState({
      currentXP: newXP,
      achievements: userState.achievements + 1,
    })
  }
  
  // 检查任务成就
  const completedTasks = await prisma.task.count({ where: { completed: true } })
  await checkTaskAchievements(completedTasks)
  
  // 检查等级成就
  if (leveledUp) {
    await checkLevelAchievements(newLevel)
  }
  
  return {
    task: {
      id: task.id,
      title: task.title,
      description: task.description || '',
      type: task.type as any,
      difficulty: task.difficulty as any,
      xp: task.xp,
      completed: true,
      completedAt: new Date(),
    },
    xpGained: task.xp,
    leveledUp,
    newState: await getUserState()
  }
}

// 更新属性
export async function updateStat(statName: string, value: number): Promise<boolean> {
  const userState = await getUserState()
  const stat = userState.stats.find(s => s.name === statName)
  
  if (!stat) return false
  
  stat.value = Math.min(Math.max(value, 0), 100)
  await updateUserState({ stats: userState.stats })
  
  return true
}

// 获取完整状态
export async function getState(): Promise<{ tasks: Task[]; userState: UserState }> {
  const [tasks, userState] = await Promise.all([
    getTasks(),
    getUserState()
  ])
  
  return { tasks, userState }
}

// 成就相关函数
export async function getAchievements(): Promise<Achievement[]> {
  return await prisma.achievement.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function initializeAchievements(): Promise<void> {
  const count = await prisma.achievement.count()
  if (count > 0) return

  const defaultAchievements = [
    {
      title: '初次尝试',
      description: '完成第一个任务',
      icon: '🎯',
      category: 'task',
      requirement: '完成 1 个任务',
      xpReward: 50,
      target: 1
    },
    {
      title: '任务达人',
      description: '完成 10 个任务',
      icon: '⭐',
      category: 'task',
      requirement: '完成 10 个任务',
      xpReward: 200,
      target: 10
    },
    {
      title: '升级了！',
      description: '首次升级',
      icon: '📈',
      category: 'level',
      requirement: '达到等级 2',
      xpReward: 100,
      target: 2
    },
    {
      title: '坚持不懈',
      description: '连续 7 天登录',
      icon: '🔥',
      category: 'streak',
      requirement: '连续 7 天',
      xpReward: 300,
      target: 7
    },
    {
      title: '困难挑战者',
      description: '完成 5 个困难任务',
      icon: '💪',
      category: 'task',
      requirement: '完成 5 个困难任务',
      xpReward: 500,
      target: 5
    }
  ]

  for (const achievement of defaultAchievements) {
    await prisma.achievement.create({ data: achievement })
  }
}

export async function updateAchievementProgress(
  category: string,
  progress: number
): Promise<Achievement[]> {
  const achievements = await prisma.achievement.findMany({
    where: { category, unlocked: false }
  })

  const unlocked: Achievement[] = []

  for (const achievement of achievements) {
    const newProgress = Math.min(progress, achievement.target)
    const shouldUnlock = newProgress >= achievement.target

    const updated = await prisma.achievement.update({
      where: { id: achievement.id },
      data: {
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date() : null
      }
    })

    if (shouldUnlock) {
      unlocked.push(updated)
    }
  }

  return unlocked
}

export async function checkTaskAchievements(completedTasks: number): Promise<Achievement[]> {
  return await updateAchievementProgress('task', completedTasks)
}

export async function checkLevelAchievements(level: number): Promise<Achievement[]> {
  return await updateAchievementProgress('level', level)
}
