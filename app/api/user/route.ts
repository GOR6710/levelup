import { NextResponse } from 'next/server'
import { getUserState, updateUserState, updateStat } from '@/lib/store'

// 获取用户状态
export async function GET() {
  const state = await getUserState()
  return NextResponse.json(state)
}

// 更新用户状态
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { level, currentXP, maxXP, achievements, streak, stats } = body
    
    const updates: any = {}
    if (level !== undefined) updates.level = level
    if (currentXP !== undefined) updates.currentXP = currentXP
    if (maxXP !== undefined) updates.maxXP = maxXP
    if (achievements !== undefined) updates.achievements = achievements
    if (streak !== undefined) updates.streak = streak
    if (stats) updates.stats = stats
    
    const newState = await updateUserState(updates)
    
    return NextResponse.json({ 
      success: true, 
      userState: newState,
      message: '用户状态更新成功！'
    })
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 更新单个属性
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { statName, value } = body
    
    const success = await updateStat(statName, value)
    
    if (!success) {
      return NextResponse.json({ error: '属性不存在' }, { status: 404 })
    }
    
    const userState = await getUserState()
    const stat = userState.stats.find(s => s.name === statName)
    
    return NextResponse.json({ 
      success: true, 
      stat,
      message: `${statName} 更新为 ${stat?.value}！`
    })
  } catch (error) {
    return NextResponse.json({ error: '更新属性失败' }, { status: 500 })
  }
}
