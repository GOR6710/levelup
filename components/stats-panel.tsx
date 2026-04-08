'use client'

import { motion } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dumbbell,
  Brain,
  Users,
  Code,
  Heart,
  Clock,
  Zap,
  Target,
} from 'lucide-react'

interface Attribute {
  name: string
  value: number
  maxValue: number
  icon: React.ReactNode
  color: string
}

const attributes: Attribute[] = [
  { name: '力量', value: 75, maxValue: 100, icon: <Dumbbell className="w-4 h-4" />, color: '#ff6b6b' },
  { name: '智力', value: 85, maxValue: 100, icon: <Brain className="w-4 h-4" />, color: '#4ecdc4' },
  { name: '社交', value: 60, maxValue: 100, icon: <Users className="w-4 h-4" />, color: '#ffe66d' },
  { name: '技能', value: 90, maxValue: 100, icon: <Code className="w-4 h-4" />, color: '#a8e6cf' },
  { name: '心理', value: 70, maxValue: 100, icon: <Heart className="w-4 h-4" />, color: '#ff8b94' },
  { name: '效率', value: 80, maxValue: 100, icon: <Clock className="w-4 h-4" />, color: '#c7ceea' },
]

const radarData = attributes.map(attr => ({
  subject: attr.name,
  A: attr.value,
  fullMark: 100,
}))

export function StatsPanel() {
  const totalPower = attributes.reduce((sum, attr) => sum + attr.value, 0)
  const avgPower = Math.round(totalPower / attributes.length)

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00d4ff]" />
            属性面板
          </CardTitle>
          <Badge variant="outline" className="border-[#00d4ff] text-[#00d4ff]">
            综合战力: {totalPower}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 雷达图 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="当前属性"
                dataKey="A"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="#00d4ff"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 属性列表 */}
        <div className="space-y-3">
          {attributes.map((attr, index) => (
            <motion.div
              key={attr.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2" style={{ color: attr.color }}>
                  {attr.icon}
                  <span>{attr.name}</span>
                </div>
                <span className="text-[#94a3b8]">
                  {attr.value} / {attr.maxValue}
                </span>
              </div>
              <Progress
                value={(attr.value / attr.maxValue) * 100}
                className="h-2 bg-[#1e3a5f]"
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
