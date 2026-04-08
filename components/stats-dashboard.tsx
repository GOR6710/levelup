'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'

interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
  xp: number
  type: string
  difficulty: string
}

interface StatsDashboardProps {
  tasks: Task[]
}

export function StatsDashboard({ tasks }: StatsDashboardProps) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    totalXP: 0,
    earnedXP: 0,
    todayCompleted: 0,
    weekCompleted: 0,
  })

  useEffect(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    const totalXP = tasks.reduce((sum, t) => sum + t.xp, 0)
    const earnedXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0)
    
    // 今天完成的任务
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCompleted = tasks.filter(t => 
      t.completed && t.completedAt && new Date(t.completedAt) >= today
    ).length
    
    // 本周完成的任务
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekCompleted = tasks.filter(t => 
      t.completed && t.completedAt && new Date(t.completedAt) >= weekAgo
    ).length
    
    setStats({
      totalTasks: total,
      completedTasks: completed,
      completionRate,
      totalXP,
      earnedXP,
      todayCompleted,
      weekCompleted,
    })
  }, [tasks])

  const statCards = [
    {
      title: '总任务',
      value: stats.totalTasks,
      subValue: `${stats.completedTasks} 已完成`,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '完成率',
      value: `${stats.completionRate}%`,
      subValue: `${stats.totalTasks - stats.completedTasks} 进行中`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: '已获得 XP',
      value: stats.earnedXP,
      subValue: `共 ${stats.totalXP} XP`,
      icon: CheckCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: '今日完成',
      value: stats.todayCompleted,
      subValue: `本周 ${stats.weekCompleted} 个`,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
          数据统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${card.bgColor} border border-[#1e3a5f]`}
            >
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-[#94a3b8]">{card.title}</span>
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <div className="text-xs text-[#64748b] mt-1">
                {card.subValue}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
