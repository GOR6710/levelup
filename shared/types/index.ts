// Shared Types for LevelUp
// Used across all platforms: Web, Android, iOS, HarmonyOS

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  level: number
  currentXP: number
  maxXP: number
  totalPower: number
  achievementsCount: number
  streakDays: number
  lastActiveDate?: string
}

export interface Stat {
  name: string
  value: number
  maxValue: number
  color: string
  icon: string
}

export type TaskType = 'main' | 'daily' | 'side'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  difficulty: TaskDifficulty
  xp: number
  completed: boolean
  completedAt?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
  unlockedAt?: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  type: string
  description: string
  xpGained: number
  metadata?: Record<string, any>
  createdAt: string
}

export interface AIConversation {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  createdAt: string
}

// Auth Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
