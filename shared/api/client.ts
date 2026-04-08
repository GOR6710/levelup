// API Client for LevelUp
// Works with any HTTP client (fetch, axios, etc.)

import type { 
  User, UserStats, Stat, Task, Achievement, 
  ActivityLog, AIConversation, AuthTokens,
  LoginCredentials, RegisterData, ApiResponse 
} from '../types'

export class LevelUpAPI {
  private baseURL: string
  private getToken: () => string | null

  constructor(baseURL: string, getToken: () => string | null) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async oauthLogin(provider: 'github' | 'google' | 'apple', code: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request(`/auth/oauth/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  }

  // User
  async getMe(): Promise<ApiResponse<User>> {
    return this.request('/user/me')
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/user/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Stats
  async getStats(): Promise<ApiResponse<{ stats: Stat[]; userStats: UserStats }>> {
    return this.request('/stats')
  }

  // Tasks
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request('/tasks')
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    })
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    })
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    })
  }

  async completeTask(id: string): Promise<ApiResponse<{ task: Task; xpGained: number; leveledUp: boolean }>> {
    return this.request(`/tasks/${id}/complete`, {
      method: 'POST'
    })
  }

  // Achievements
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    return this.request('/achievements')
  }

  // Activity Log
  async getActivityLog(limit = 50): Promise<ApiResponse<ActivityLog[]>> {
    return this.request(`/activity?limit=${limit}`)
  }

  // AI Chat
  async sendMessage(message: string, context?: Record<string, any>): Promise<ApiResponse<{ reply: string; actions?: any[] }>> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    })
  }

  async getConversationHistory(): Promise<ApiResponse<AIConversation[]>> {
    return this.request('/ai/history')
  }
}

export default LevelUpAPI
