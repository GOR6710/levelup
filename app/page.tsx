'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatsPanel } from '@/components/stats-panel'
import { LevelSystem } from '@/components/level-system'
import { TaskSystem, Task } from '@/components/task-system'
import { StatsDashboard } from '@/components/stats-dashboard'
import { AchievementSystem } from '@/components/achievement-system'
import { AIAssistant } from '@/components/ai-assistant'
import { MobileNav, Tab } from '@/components/mobile-nav'
import { Zap, Trophy, Flame, TrendingUp, RefreshCw, Wifi, WifiOff, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// 初始属性数据
const initialStats = [
  { name: '力量', value: 75, maxValue: 100, color: '#ff6b6b', icon: '💪' },
  { name: '智力', value: 85, maxValue: 100, color: '#4ecdc4', icon: '🧠' },
  { name: '社交', value: 60, maxValue: 100, color: '#ffe66d', icon: '👥' },
  { name: '技能', value: 90, maxValue: 100, color: '#a8e6cf', icon: '💻' },
  { name: '心理', value: 70, maxValue: 100, color: '#ff8b94', icon: '❤️' },
  { name: '效率', value: 80, maxValue: 100, color: '#c7ceea', icon: '⏰' },
]

export default function Home() {
  // 任务状态
  const [tasks, setTasks] = useState<Task[]>([])
  
  // 等级状态
  const [level, setLevel] = useState(12)
  const [currentXP, setCurrentXP] = useState(1250)
  const [maxXP, setMaxXP] = useState(1500)
  
  // 属性状态
  const [stats, setStats] = useState(initialStats)
  
  // 成就和连胜
  const [achievements, setAchievements] = useState(12)
  const [streak, setStreak] = useState(5)

  // 加载状态
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // 移动端状态
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 计算总战力
  const totalPower = stats.reduce((sum, stat) => sum + stat.value, 0)

  // 从 API 加载数据
  const loadData = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/chat')
      if (!response.ok) throw new Error('API error')
      
      const data = await response.json()
      
      if (data.tasks) {
        setTasks(data.tasks)
      }
      
      if (data.userState) {
        setLevel(data.userState.level)
        setCurrentXP(data.userState.currentXP)
        setMaxXP(data.userState.maxXP)
        setAchievements(data.userState.achievements)
        setStreak(data.userState.streak)
        setStats(data.userState.stats)
      }
      
      setIsOnline(true)
      if (showToast) {
        toast.success('数据已刷新')
      }
    } catch (error) {
      console.error('Load data error:', error)
      setIsOnline(false)
      if (showToast) {
        toast.error('刷新失败，请检查网络')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadData()
    
    // 定时刷新
    const interval = setInterval(() => {
      loadData()
    }, 30000) // 每30秒自动刷新
    
    return () => clearInterval(interval)
  }, [loadData])

  // 处理任务完成 - 联动更新等级和属性
  const handleTaskComplete = useCallback(async (completedTask: Task) => {
    // 增加经验值
    const newXP = currentXP + completedTask.xp
    
    let newLevel = level
    let newCurrentXP = newXP
    let newMaxXP = maxXP
    let leveledUp = false
    
    // 检查是否升级
    if (newXP >= maxXP) {
      const remainingXP = newXP - maxXP
      newLevel = level + 1
      newCurrentXP = remainingXP
      newMaxXP = Math.floor(maxXP * 1.2)
      leveledUp = true
      
      setLevel(newLevel)
      setMaxXP(newMaxXP)
      
      // 升级时增加随机属性
      setStats(prev => {
        const randomStatIndex = Math.floor(Math.random() * prev.length)
        const newStats = prev.map((stat, index) =>
          index === randomStatIndex
            ? { ...stat, value: Math.min(stat.value + 2, stat.maxValue) }
            : stat
        )
        // 显示升级提示
        toast.success(`🎉 升级了！等级 ${newLevel}`, {
          description: `${prev[randomStatIndex].name} +2！`
        })
        return newStats
      })
    } else {
      setCurrentXP(newCurrentXP)
      toast.success(`+${completedTask.xp} XP`, {
        description: `任务「${completedTask.title}」完成`
      })
    }

    // 根据任务类型增加对应属性
    setStats(prev => {
      return prev.map(stat => {
        let increase = 0
        if (completedTask.type === 'main') increase = 3
        else if (completedTask.type === 'daily') increase = 1
        else if (completedTask.type === 'side') increase = 2
        
        // 根据任务难度调整
        if (completedTask.difficulty === 'hard') increase += 2
        else if (completedTask.difficulty === 'medium') increase += 1
        
        return { ...stat, value: Math.min(stat.value + increase, stat.maxValue) }
      })
    })

    // 更新成就数
    setAchievements(prev => prev + 1)

    // 同步到后端
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: newLevel,
          currentXP: newCurrentXP,
          maxXP: newMaxXP,
          achievements: achievements + 1,
          streak
        })
      })
    } catch (error) {
      console.error('Sync user state error:', error)
    }
  }, [currentXP, maxXP, level, achievements, streak])

  // 处理任务变更
  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks)
  }, [])

  // 刷新数据
  const handleRefresh = () => {
    loadData(true)
  }

  // AI 完成任务
  const handleAITaskComplete = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      handleTaskComplete(task)
    }
  }, [tasks, handleTaskComplete])

  // 渲染移动端内容
  const renderMobileContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 pb-24">
            <LevelSystem
              level={level}
              currentXP={currentXP}
              maxXP={maxXP}
              title="初级冒险者"
              
            />
            <StatsPanel />
            <StatsDashboard tasks={tasks} />
          </div>
        )
      case 'tasks':
        return (
          <div className="pb-24">
            <TaskSystem
              tasks={tasks}
              onTasksChange={handleTasksChange}
              onTaskComplete={handleTaskComplete}
            />
          </div>
        )
      case 'ai':
        return (
          <div className="pb-24">
            <AIAssistant 
              userContext={{
                level,
                currentXP,
                maxXP,
                achievements,
                streak,
                stats: stats.map(s => ({ name: s.name, value: s.value }))
              }}
              onTasksUpdate={handleRefresh}
              onTaskComplete={handleAITaskComplete}
            />
          </div>
        )
      case 'achievements':
        return (
          <div className="pb-24">
            <AchievementSystem />
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-4 pb-24">
            <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4">个人资料</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">等级</span>
                  <span className="text-[#00d4ff] font-bold">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">总战力</span>
                  <span className="text-[#00d4ff] font-bold">{totalPower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">成就</span>
                  <span className="text-yellow-400 font-bold">{achievements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">连胜</span>
                  <span className="text-orange-400 font-bold">{streak}天</span>
                </div>
              </div>
            </div>
            <StatsPanel />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-[#1e3a5f] bg-[#0a1628]/90 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20"
              >
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                  LevelUp
                </h1>
                <p className="text-[10px] lg:text-xs text-[#64748b] hidden sm:block">游戏化成长系统 v1.4</p>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">在线</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">离线</span>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-[#1e3a5f] hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e3a5f]/50 border border-[#1e3a5f]"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">{achievements}</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e3a5f]/50 border border-[#1e3a5f]"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">{streak}天</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e3a5f]/50 border border-[#1e3a5f]"
              >
                <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm font-medium">{totalPower}</span>
              </motion.div>
            </div>

            {/* Mobile Stats & Menu */}
            <div className="flex lg:hidden items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#1e3a5f]/50 border border-[#1e3a5f]"
              >
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-medium">{achievements}</span>
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-[#1e3a5f] bg-[#0a1628]/95 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">状态</span>
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">在线</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-red-400" />
                        <span className="text-red-400">离线</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">连胜</span>
                  <span className="text-orange-400 font-medium">{streak}天</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">总战力</span>
                  <span className="text-[#00d4ff] font-medium">{totalPower}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#1e3a5f] hover:border-[#00d4ff]"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  刷新数据
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 lg:py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Level & Stats */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <LevelSystem
              level={level}
              currentXP={currentXP}
              maxXP={maxXP}
              title="初级冒险者"
              
            />

            <StatsPanel />
            
            <StatsDashboard tasks={tasks} />
            
            <AchievementSystem />
          </motion.div>

          {/* Middle Column - Tasks */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TaskSystem
              tasks={tasks}
              onTasksChange={handleTasksChange}
              onTaskComplete={handleTaskComplete}
            />
          </motion.div>

          {/* Right Column - AI Assistant */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AIAssistant 
              userContext={{
                level,
                currentXP,
                maxXP,
                achievements,
                streak,
                stats: stats.map(s => ({ name: s.name, value: s.value }))
              }}
              onTasksUpdate={handleRefresh}
              onTaskComplete={handleAITaskComplete}
            />
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderMobileContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Footer - Desktop Only */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="hidden lg:block border-t border-[#1e3a5f] mt-12 py-6"
      >
        <div className="container mx-auto px-4 text-center text-[#64748b] text-sm">
          <p>LevelUp v1.4.0 - SQLite + AI Function Calling 🚀</p>
        </div>
      </motion.footer>
    </div>
  )
}
