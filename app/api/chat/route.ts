import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  getTasks, 
  getUserState, 
  addTask, 
  deleteTaskById, 
  completeTaskById, 
  updateStat,
  getState 
} from '@/lib/store'

// 初始化 OpenAI 客户端 (OpenRouter)
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://levelup.app',
    'X-Title': 'LevelUp AI Assistant'
  }
})

export async function POST(request: Request) {
  let userMessage = ''
  
  try {
    const { message, confirmedAction, actionResult } = await request.json()
    userMessage = message || ''
    
    // 如果有确认的操作结果，执行确认
    if (confirmedAction && actionResult?.confirmed) {
      if (confirmedAction.action === 'delete_task' && confirmedAction.params?.task_id) {
        const deleted = await deleteTaskById(confirmedAction.params.task_id)
        if (deleted) {
          return NextResponse.json({
            type: 'action',
            action: 'delete_task',
            result: { success: true, deleted },
            message: `✅ 任务「${deleted.title}」已删除！`
          })
        }
      }
    }
    
    // 获取当前状态
    const currentState = await getState()
    
    // 构建系统提示 - 让 AI 返回 JSON 格式的命令
    const systemPrompt = `你是 LevelUp 游戏化成长系统的 AI 助手。

当前用户状态：
- 等级: ${currentState.userState.level} | XP: ${currentState.userState.currentXP}/${currentState.userState.maxXP}
- 连胜: ${currentState.userState.streak}天 | 成就: ${currentState.userState.achievements}个
- 属性: ${currentState.userState.stats.map(s => `${s.name}${s.value}`).join('/')}

当前任务列表：
${currentState.tasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.type}, ${t.difficulty}, +${t.xp}XP) ID:${t.id}`).join('\n')}

可用操作：
1. create_task - 创建任务 (参数: title, type: daily/main/side, difficulty: easy/medium/hard)
2. delete_task - 删除任务 (参数: task_id) - 需要先询问确认
3. complete_task - 完成任务 (参数: task_id)
4. generate_plan - 生成学习计划 (参数: subject, difficulty)

重要规则：
- 当用户要求创建任务、删除任务、完成任务或制定计划时，必须返回 JSON 命令
- 删除任务前必须先询问用户确认
- 回复格式：如果是操作，返回 {"action": "操作名", "params": {...}, "message": "给用户看的消息"}
- 如果只是聊天，直接回复文本，不要返回 JSON

示例：
用户说"创建一个学习英语的任务" → {"action": "create_task", "params": {"title": "学习英语", "type": "daily", "difficulty": "medium"}, "message": "已为你创建英语学习任务！"}
用户说"你好" → 直接回复"你好！有什么我可以帮你的吗？"`;

    // 调用 OpenAI API (不使用工具调用，纯文本模式)
    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const aiResponse = completion.choices[0].message.content || ''
    
    // 尝试解析 JSON 命令
    try {
      // 提取 JSON 部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const command = JSON.parse(jsonMatch[0])
        
        if (command.action && command.params) {
          // 执行对应的操作
          const result = await executeCommand(command.action, command.params)
          
          return NextResponse.json({
            type: 'action',
            action: command.action,
            params: command.params,
            result: result,
            message: command.message || result.message || `已执行 ${command.action}`,
            requiresConfirmation: result.requiresConfirmation || false
          })
        }
      }
    } catch (e) {
      // 不是 JSON，当作普通文本回复
    }
    
    // 普通回复
    return NextResponse.json({
      type: 'chat',
      message: aiResponse
    })
    
  } catch (error) {
    console.error('AI API error:', error)
    
    // 降级到本地处理
    return handleLocalFallback(userMessage)
  }
}

// 执行命令
async function executeCommand(action: string, params: any) {
  switch (action) {
    case 'create_task':
      return createTask(params)
    case 'delete_task':
      return deleteTask(params)
    case 'complete_task':
      return completeTask(params)
    case 'generate_plan':
      return generateLearningPlan(params)
    default:
      return { success: false, message: '未知操作' }
  }
}

// 创建任务
async function createTask(args: any) {
  const xpMap = { easy: 100, medium: 200, hard: 500 }
  const newTask = await addTask({
    title: args.title,
    description: args.description || '',
    type: args.type || 'daily',
    difficulty: args.difficulty || 'medium',
    xp: xpMap[args.difficulty as keyof typeof xpMap] || 200,
    completed: false,
  })
  
  console.log('Created task:', newTask)
  
  return {
    success: true,
    task: newTask,
    message: `✅ 已创建任务「${args.title}」并添加到界面！`,
    requiresConfirmation: false
  }
}

// 删除任务（需要确认）
async function deleteTask(args: any) {
  const tasks = await getTasks()
  const task = tasks.find(t => t.id === args.task_id)
  if (!task) {
    return { success: false, message: '任务不存在' }
  }
  
  return {
    success: true,
    task: task,
    message: `⚠️ 确认删除任务「${task.title}」吗？\n\n回复"确认"执行删除，回复"取消"放弃操作。`,
    requiresConfirmation: true,
    actionType: 'delete'
  }
}

// 完成任务
async function completeTask(args: any) {
  const completed = await completeTaskById(args.task_id)
  if (!completed) {
    return { success: false, message: '任务不存在或已完成' }
  }
  
  return {
    success: true,
    task: completed,
    message: `🎉 任务已完成！获得 ${completed.xpGained} XP`,
    requiresConfirmation: false
  }
}

// 生成学习计划
async function generateLearningPlan(args: any) {
  const subject = args.subject || '学习'
  const difficulty = args.difficulty || 'medium'
  const xpMap = { easy: 100, medium: 200, hard: 500 }
  
  const plans: Record<string, any[]> = {
    '英语': [
      { title: '早晨口语练习', description: '每天练习口语30分钟', type: 'daily', difficulty },
      { title: '晚间阅读训练', description: '阅读英语文章30分钟', type: 'daily', difficulty },
      { title: '听力练习', description: '听英语播客或新闻', type: 'daily', difficulty: 'easy' },
      { title: '周末写作', description: '写一篇英语短文', type: 'side', difficulty: 'hard' },
    ],
    '编程': [
      { title: 'LeetCode 每日一题', description: '完成一道算法题', type: 'daily', difficulty },
      { title: '阅读技术文档', description: '学习新技术文档', type: 'daily', difficulty: 'easy' },
      { title: '项目实战', description: '开发一个小功能', type: 'main', difficulty: 'hard' },
    ],
    '健身': [
      { title: '晨跑5公里', description: '早晨跑步锻炼', type: 'daily', difficulty },
      { title: '力量训练', description: '健身房力量训练', type: 'side', difficulty: 'hard' },
      { title: '拉伸放松', description: '运动后拉伸', type: 'daily', difficulty: 'easy' },
    ]
  }
  
  const planTasks = plans[subject] || [
    { title: `${subject}基础学习`, description: `学习${subject}基础知识`, type: 'main', difficulty },
    { title: `${subject}每日练习`, description: `每天练习${subject}`, type: 'daily', difficulty },
  ]
  
  // 创建任务
  const createdTasks = []
  for (const p of planTasks) {
    const task = await addTask({
      title: p.title,
      description: p.description,
      type: p.type as any,
      difficulty: p.difficulty,
      xp: xpMap[p.difficulty as keyof typeof xpMap] || 200,
      completed: false,
    })
    createdTasks.push(task)
  }
  
  return {
    success: true,
    tasks: createdTasks,
    message: `📚 已为你创建 ${subject}学习计划，包含 ${createdTasks.length} 个任务！`,
    requiresConfirmation: false
  }
}

// 本地降级处理
async function handleLocalFallback(message: string) {
  const lowerMsg = message.toLowerCase()
  
  // 简单的本地意图识别
  if (lowerMsg.includes('创建') || lowerMsg.includes('添加')) {
    const title = message.replace(/.*(?:创建|添加|新建)/, '').replace(/任务/, '').trim() || '新任务'
    const result = await createTask({ title, type: 'daily', difficulty: 'medium' })
    return NextResponse.json({
      type: 'action',
      action: 'create_task',
      params: { title, type: 'daily', difficulty: 'medium' },
      result,
      message: result.message
    })
  }
  
  if (lowerMsg.includes('计划') && lowerMsg.includes('英语')) {
    const result = await generateLearningPlan({ subject: '英语' })
    return NextResponse.json({
      type: 'action',
      action: 'generate_learning_plan',
      params: { subject: '英语' },
      result,
      message: result.message
    })
  }
  
  return NextResponse.json({
    type: 'chat',
    message: '抱歉，AI 服务暂时不可用。请稍后再试，或者尝试说"创建一个任务"等简单指令。'
  })
}

// GET 方法 - 获取当前状态
export async function GET() {
  const state = await getState()
  return NextResponse.json(state)
}
