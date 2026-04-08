'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  Bot, 
  Trophy, 
  User 
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'dashboard' | 'tasks' | 'ai' | 'achievements' | 'profile'

interface MobileNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs = [
  { id: 'dashboard' as Tab, label: '概览', icon: LayoutDashboard },
  { id: 'tasks' as Tab, label: '任务', icon: Target },
  { id: 'ai' as Tab, label: 'AI助手', icon: Bot },
  { id: 'achievements' as Tab, label: '成就', icon: Trophy },
  { id: 'profile' as Tab, label: '我的', icon: User },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-lg border-t border-[#1e3a5f] lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive 
                  ? "bg-[#00d4ff]/10 text-[#00d4ff]" 
                  : "text-[#64748b] hover:text-[#94a3b8]"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive && "drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]"
                )} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive && "text-[#00d4ff]"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00d4ff]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-[#0a1628]" />
    </motion.nav>
  )
}

export type { Tab }
