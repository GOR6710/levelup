import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

// Calculate level from XP
export function calculateLevel(totalXP: number): { level: number; currentXP: number; nextLevelXP: number } {
  let level = 1
  let xpNeeded = 100
  let remainingXP = totalXP

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded
    level++
    xpNeeded = Math.floor(xpNeeded * 1.2)
  }

  return {
    level,
    currentXP: remainingXP,
    nextLevelXP: xpNeeded,
  }
}

// Get level color class
export function getLevelColorClass(level: number): string {
  if (level >= 100) return "level-gold"
  if (level >= 61) return "level-purple"
  if (level >= 31) return "level-blue"
  if (level >= 11) return "level-green"
  return "level-white"
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "刚刚"
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return formatDate(date)
}
