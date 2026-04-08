// User types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  level: number
  totalXP: number
  nextLevelXP: number
  createdAt: Date
  updatedAt: Date
}

// Attribute types
export interface Attribute {
  id: string
  userId: string
  name: string
  category: AttributeCategory
  displayName: string
  icon: string
  level: number
  currentXP: number
  maxXP: number
  history?: AttributeHistory[]
}

export type AttributeCategory = 
  | "physical"      // 身体素质
  | "mental"        // 智力属性
  | "social"        // 社交能力
  | "professional"  // 专业技能
  | "mental_state"  // 心理状态
  | "life"          // 生活技能

export interface AttributeHistory {
  date: string
  level: number
  xp: number
}

// Skill types
export interface Skill {
  id: string
  userId: string
  name: string
  description?: string
  category: string
  icon?: string
  level: number
  maxLevel: number
  currentXP: number
  maxXP: number
  parentId?: string
  parent?: Skill
  children: Skill[]
  unlocked: boolean
  unlockRequirements?: UnlockRequirements
  dependencies: string[]
}

export interface UnlockRequirements {
  minLevel?: number
  requiredSkills?: string[]
  requiredAttributes?: { name: string; level: number }[]
}

// Task types
export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  type: TaskType
  xpReward: number
  attributeRewards?: Record<string, number>
  completed: boolean
  completedAt?: Date
  dueDate?: Date
  scheduledAt?: Date
  recurrence?: RecurrenceType
  streak: number
  maxStreak: number
  priority: Priority
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type TaskType = "daily" | "main" | "side" | "limited"
export type RecurrenceType = "daily" | "weekly" | "monthly"
export type Priority = "low" | "medium" | "high" | "urgent"

// Achievement types
export interface Achievement {
  id: string
  name: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  condition: AchievementCondition
  xpReward: number
}

export type AchievementCategory = "level" | "skill" | "streak" | "special"

export interface AchievementCondition {
  type: string
  value: number
  [key: string]: any
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  achievement: Achievement
  unlockedAt: Date
}

// AI Chat types
export interface AIChat {
  id: string
  userId: string
  role: "user" | "assistant" | "system"
  content: string
  metadata?: AIChatMetadata
  createdAt: Date
}

export interface AIChatMetadata {
  action?: string
  data?: any
}

// Activity Log types
export interface ActivityLog {
  id: string
  userId: string
  type: ActivityType
  title: string
  description?: string
  xpGained: number
  metadata?: any
  createdAt: Date
}

export type ActivityType = 
  | "task_complete" 
  | "level_up" 
  | "skill_unlock" 
  | "achievement_unlock"
  | "streak_milestone"
