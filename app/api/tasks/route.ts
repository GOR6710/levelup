import { NextResponse } from 'next/server'
import { 
  getTasks, 
  getUserState, 
  addTask, 
  deleteTaskById, 
  completeTaskById, 
  updateStat,
  getState 
} from '@/lib/store'

// 获取所有任务
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  const state = await getState()
  let result = state.tasks
  if (type) {
    result = state.tasks.filter(t => t.type === type)
  }
  
  return NextResponse.json({ tasks: result, userState: state.userState })
}

// 创建新任务
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, type = 'daily', difficulty = 'medium', xp } = body
    
    if (!title) {
      return NextResponse.json({ error: '任务名称不能为空' }, { status: 400 })
    }
    
    // 计算 XP
    const xpValue = xp || { easy: 100, medium: 200, hard: 500 }[difficulty as string] || 200
    
    const newTask = await addTask({
      title,
      description: description || '',
      type: type as any,
      difficulty: difficulty as any,
      xp: xpValue,
      completed: false,
    })
    
    return NextResponse.json({ 
      success: true, 
      task: newTask,
      message: `任务「${title}」创建成功！获得潜力 XP: +${xpValue}`
    })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 })
  }
}

// 更新任务
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, updates } = body
    
    if (!id) {
      return NextResponse.json({ error: '任务ID不能为空' }, { status: 400 })
    }
    
    // 处理任务完成
    if (updates?.completed === true) {
      const completedTask = await completeTaskById(id)
      if (!completedTask) {
        return NextResponse.json({ error: '任务不存在' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        task: completedTask,
        message: `任务「${completedTask.title}」已完成！获得 ${completedTask.xp} XP`
      })
    }
    
    return NextResponse.json({ 
      success: true,
      message: `任务更新成功！`
    })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: '更新任务失败' }, { status: 500 })
  }
}

// 删除任务
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: '任务ID不能为空' }, { status: 400 })
    }
    
    const deletedTask = await deleteTaskById(id)
    if (!deletedTask) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      deletedTask,
      message: `任务「${deletedTask.title}」已删除`
    })
  } catch (error) {
    return NextResponse.json({ error: '删除任务失败' }, { status: 500 })
  }
}
