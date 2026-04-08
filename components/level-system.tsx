'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, Award } from 'lucide-react'

interface LevelSystemProps {
  level: number
  currentXP: number
  maxXP: number
  title?: string
}

const getRankColor = (level: number): string => {
  if (level >= 100) return 'from-yellow-400 via-yellow-500 to-yellow-600'
  if (level >= 61) return 'from-purple-400 via-purple-500 to-purple-600'
  if (level >= 31) return 'from-blue-400 via-blue-500 to-blue-600'
  if (level >= 11) return 'from-green-400 via-green-500 to-green-600'
  return 'from-gray-300 via-gray-400 to-gray-500'
}

const getRankName = (level: number): string => {
  if (level >= 100) return '传说'
  if (level >= 61) return '专家'
  if (level >= 31) return '高手'
  if (level >= 11) return '进阶'
  return '新手'
}

export function LevelSystem({ level, currentXP, maxXP, title = '冒险者' }: LevelSystemProps) {
  const progress = (currentXP / maxXP) * 100
  const rankColor = getRankColor(level)
  const rankName = getRankName(level)

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white overflow-hidden relative">
      {/* 背景光效 */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rankColor} opacity-10 blur-3xl rounded-full`} />
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center text-2xl font-bold shadow-lg`}
            >
              {level}
            </motion.div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <Badge variant="outline" className={`border-transparent bg-gradient-to-r ${rankColor} text-white`}>
                <Award className="w-3 h-3 mr-1" />
                {rankName}
              </Badge>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-[#00d4ff]">
              {currentXP.toLocaleString()}
            </div>
            <div className="text-xs text-[#94a3b8]">
              / {maxXP.toLocaleString()} XP
            </div>
          </motion.div>
        </div>

        {/* 经验条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              升级进度
            </span>
            <span className="text-[#00d4ff] font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress
              value={progress}
              className="h-3 bg-[#1e3a5f]"
            />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span>还需 {maxXP - currentXP} XP 升级</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              下一级: {level + 1}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
