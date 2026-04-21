'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Lock, Star, Target, Flame, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  requirement: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  target: number
}

interface AchievementSystemProps {
  onAchievementUnlocked?: (achievement: Achievement) => void
}

const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
  task: { label: '任务', color: 'bg-blue-500', icon: Target },
  level: { label: '等级', color: 'bg-green-500', icon: Star },
  streak: { label: '连续', color: 'bg-orange-500', icon: Flame },
  special: { label: '特殊', color: 'bg-purple-500', icon: Zap },
}

export function AchievementSystem({ onAchievementUnlocked }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (!response.ok) throw new Error('加载失败')
      const data = await response.json()
      setAchievements(data.achievements || [])
    } catch (error) {
      toast.error('加载成就失败')
    } finally {
      setLoading(false)
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  const handleUnlock = (achievement: Achievement) => {
    if (!newlyUnlocked.includes(achievement.id)) {
      setNewlyUnlocked(prev => [...prev, achievement.id])
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <div className="font-bold">解锁成就！</div>
            <div className="text-sm">{achievement.title} (+{achievement.xpReward} XP)</div>
          </div>
        </div>,
        { duration: 5000 }
      )
      onAchievementUnlocked?.(achievement)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[#0a1628] border-[#1e3a5f] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-[#64748b]">加载中...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffd700]" />
            成就系统
          </CardTitle>
          <Badge variant="outline" className="border-[#1e3a5f] text-[#94a3b8]">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-[#94a3b8] mb-1">
            <span>总进度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {achievements.map((achievement, index) => {
                const config = categoryConfig[achievement.category] || categoryConfig.special
                const CategoryIcon = config.icon
                const progressPercent = (achievement.progress / achievement.target) * 100
                const isNewlyUnlocked = newlyUnlocked.includes(achievement.id)

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked
                        ? 'bg-[#1e3a5f]/30 border-[#00d4ff]/30'
                        : 'bg-[#0f2642] border-[#1e3a5f] opacity-70'
                    } ${isNewlyUnlocked ? 'ring-2 ring-[#ffd700] ring-offset-2 ring-offset-[#0a1628]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        achievement.unlocked ? 'bg-[#00d4ff]/20' : 'bg-[#1e3a5f]/50 grayscale'
                      }`}>
                        {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-[#64748b]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            achievement.unlocked ? 'text-white' : 'text-[#94a3b8]'
                          }`}>
                            {achievement.title}
                          </span>
                          {achievement.unlocked && (
                            <Badge className="bg-[#ffd700]/20 text-[#ffd700] border-0 text-xs">
                              +{achievement.xpReward} XP
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-[#64748b] mt-1">
                          {achievement.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${config.color.replace('bg-', 'border-')} text-[#94a3b8]`}
                          >
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>

                          {!achievement.unlocked && (
                            <span className="text-xs text-[#64748b]">
                              {achievement.progress}/{achievement.target}
                            </span>
                          )}
                        </div>

                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <Progress value={progressPercent} className="h-1.5" />
                          </div>
                        )}

                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-[#64748b] mt-2">
                            解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {achievements.length === 0 && (
              <div className="text-center py-8 text-[#64748b]">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无成就</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
