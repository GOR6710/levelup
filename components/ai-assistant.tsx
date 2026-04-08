'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Monitor,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  BookOpen,
  Dumbbell,
  Code,
  RefreshCw,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'chat' | 'action' | 'confirm'
  actionData?: any
}

interface UserContext {
  level: number
  currentXP: number
  maxXP: number
  achievements: number
  streak: number
  stats: { name: string; value: number }[]
}

interface AIAssistantProps {
  userContext: UserContext
  onTasksUpdate?: () => void
  onTaskComplete?: (taskId: string) => void
}

export function AIAssistant({ userContext, onTasksUpdate, onTaskComplete }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `你好，冒险者！我是你的 AI 助手 🤖\n\n**我现在可以真正帮你操作界面：**\n\n📝 **创建任务** - "帮我创建一个背单词的任务"\n🗑️ **删除任务** - "删除XX任务"（会确认）\n✅ **完成任务** - "标记XX任务完成"\n📚 **制定计划** - "帮我制定英语学习计划"\n💪 **修改属性** - "把我的力量提升到80"\n\n当前状态：等级${userContext.level} | ${userStateText(userContext)}\n\n试试对我说点什么！`,
      timestamp: new Date(),
      type: 'chat'
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (content: string, isConfirmation = false) => {
    if (!content.trim() || isLoading) return

    // 检查是否是确认回复
    if (pendingConfirmation && !isConfirmation) {
      const lowerContent = content.toLowerCase().trim()
      const isConfirm = ['确认', '同意', '是的', '确定', '好', '可以', 'y', 'yes'].some(w => lowerContent.includes(w))
      const isCancel = ['取消', '不', '算了', '否', 'n', 'no'].some(w => lowerContent.includes(w))
      
      if (isConfirm) {
        await executeConfirmedAction(pendingConfirmation, true)
        return
      } else if (isCancel) {
        setPendingConfirmation(null)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '已取消操作。还有什么我可以帮你的吗？',
          timestamp: new Date(),
          type: 'chat'
        }])
        return
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 调用 AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          context: userContext
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()

      // 处理需要确认的操作
      if (data.result?.requiresConfirmation) {
        setPendingConfirmation({
          toolCallId: data.toolCallId,
          action: data.action,
          params: data.params,
          actionType: data.result.actionType
        })
      } else {
        setPendingConfirmation(null)
        // 立即执行操作并更新界面
        if (data.type === 'action') {
          await executeActionOnUI(data.action, data.result)
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: data.type,
        actionData: data
      }

      setMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ 连接失败，请检查网络或稍后重试。',
        timestamp: new Date(),
        type: 'chat'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 在 UI 上执行操作
  const executeActionOnUI = async (action: string, result: any) => {
    if (!result.success) return

    switch (action) {
      case 'create_task':
      case 'generate_learning_plan':
        // 刷新任务列表
        onTasksUpdate?.()
        break
        
      case 'complete_task':
        // 通知父组件任务完成
        if (result.task?.id) {
          onTaskComplete?.(result.task.id)
        }
        onTasksUpdate?.()
        break
        
      case 'delete_task':
        onTasksUpdate?.()
        break
        
      case 'update_user_stats':
        onTasksUpdate?.()
        break
    }
  }

  // 执行确认的操作
  const executeConfirmedAction = async (pendingAction: any, confirmed: boolean) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: confirmed ? '确认' : '取消',
          context: userContext,
          confirmedAction: pendingAction,
          actionResult: { confirmed }
        }),
      })

      const data = await response.json()
      
      if (confirmed && data.type === 'action') {
        await executeActionOnUI(data.action, data.result)
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: data.type,
        actionData: data
      }

      setMessages(prev => [...prev, assistantMessage])
      setPendingConfirmation(null)
      
    } catch (error) {
      console.error('Confirm error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // 快捷操作
  const quickActions = [
    { icon: BookOpen, label: '英语计划', message: '帮我制定英语学习计划' },
    { icon: Code, label: '编程计划', message: '帮我制定编程学习计划' },
    { icon: Dumbbell, label: '健身计划', message: '帮我制定健身计划' },
  ]

  // 快速创建任务
  const quickCreate = (title: string, type: string, difficulty: string) => {
    sendMessage(`帮我创建一个${title}任务，类型是${type}，难度${difficulty}`)
  }

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white flex flex-col h-[650px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="relative">
              <Monitor className="w-5 h-5 text-[#00d4ff]" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            AI 助手
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-green-500 text-green-400 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Function Call
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* 快捷操作 */}
        <div className="grid grid-cols-3 gap-2 mb-3 flex-shrink-0">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="border-[#1e3a5f] hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 text-xs"
              onClick={() => sendMessage(action.message)}
              disabled={isLoading}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* 快速创建按钮 */}
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-green-500/30 hover:border-green-500 hover:bg-green-500/10 text-xs text-green-400"
            onClick={() => quickCreate('阅读30分钟', 'daily', 'easy')}
            disabled={isLoading}
          >
            <Plus className="w-3 h-3 mr-1" />
            +阅读
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-xs text-blue-400"
            onClick={() => quickCreate('运动健身', 'daily', 'medium')}
            disabled={isLoading}
          >
            <Plus className="w-3 h-3 mr-1" />
            +运动
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-xs text-purple-400"
            onClick={() => quickCreate('学习新技能', 'main', 'hard')}
            disabled={isLoading}
          >
            <Plus className="w-3 h-3 mr-1" />
            +学习
          </Button>
        </div>

        {/* 聊天消息 */}
        <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
          <div className="space-y-3 pr-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      message.role === 'user'
                        ? 'bg-[#7c3aed]'
                        : message.type === 'action'
                        ? 'bg-green-500'
                        : 'bg-[#00d4ff]'
                    }`}
                  >
                    {message.role === 'user' ? (
                      '我'
                    ) : message.type === 'action' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5 text-black" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-lg p-2.5 text-sm whitespace-pre-wrap break-words ${
                      message.role === 'user'
                        ? 'bg-[#7c3aed]/20 border border-[#7c3aed]/50'
                        : message.type === 'action'
                        ? 'bg-green-500/10 border border-green-500/30'
                        : message.type === 'confirm'
                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                        : 'bg-[#1e3a5f]'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 加载状态 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-[#00d4ff] flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="bg-[#1e3a5f] rounded-lg p-2.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" />
                  <span className="text-sm text-[#94a3b8]">思考中...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-[#1e3a5f] flex-shrink-0 mt-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pendingConfirmation ? "回复：确认 / 取消" : "输入消息..."}
            className="flex-1 bg-[#0f2642] border-[#1e3a5f] text-white placeholder:text-[#64748b] focus:border-[#00d4ff]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black px-3"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function userStateText(ctx: UserContext) {
  return `${ctx.currentXP}/${ctx.maxXP} XP`
}
