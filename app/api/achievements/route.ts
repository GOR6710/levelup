import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeAchievements, getAchievements, checkTaskAchievements, checkLevelAchievements } from '@/lib/store'

// GET /api/achievements - 获取所有成就
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'system'
    
    // 初始化默认成就
    await initializeAchievements(userId)
    
    const achievements = await getAchievements()
    
    return NextResponse.json({
      success: true,
      achievements
    })
  } catch (error) {
    console.error('获取成就失败:', error)
    return NextResponse.json(
      { success: false, error: '获取成就失败' },
      { status: 500 }
    )
  }
}

// POST /api/achievements/check - 检查成就进度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, value } = body

    let unlockedAchievements: any[] = []

    if (type === 'task') {
      unlockedAchievements = await checkTaskAchievements(value)
    } else if (type === 'level') {
      unlockedAchievements = await checkLevelAchievements(value)
    }

    return NextResponse.json({
      success: true,
      unlocked: unlockedAchievements,
      count: unlockedAchievements.length
    })
  } catch (error) {
    console.error('检查成就失败:', error)
    return NextResponse.json(
      { success: false, error: '检查成就失败' },
      { status: 500 }
    )
  }
}
