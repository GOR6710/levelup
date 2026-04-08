'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Target,
  Calendar,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Trophy,
  Filter,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

export interface Task {
  id: string
  title: string
  description: string
  type: 'main' | 'daily' | 'side'
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  completed: boolean
  completedAt?: Date
}

interface TaskSystemProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onTaskComplete: (task: Task) => void
}

const typeConfig = {
  main: { label: '主线', color: 'bg-purple-500', icon: Target },
  daily: { label: '日常', color: 'bg-blue-500', icon: Calendar },
  side: { label: '支线', color: 'bg-green-500', icon: Zap },
}

const difficultyConfig = {
  easy: { label: '简单', color: 'text-green-400', xp: 100 },
  medium: { label: '中等', color: 'text-yellow-400', xp: 200 },
  hard: { label: '困难', color: 'text-red-400', xp: 500 },
}

export function TaskSystem({ tasks, onTasksChange, onTaskComplete }: TaskSystemProps) {
  const [filter, setFilter] = useState<'all' | 'main' | 'daily' | 'side'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // 新任务表单
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'daily' as const,
    difficulty: 'medium' as const,
  })

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    // 类型过滤
    if (filter !== 'all' && task.type !== filter) return false
    
    // 状态过滤
    if (statusFilter === 'completed' && !task.completed) return false
    if (statusFilter === 'pending' && task.completed) return false
    
    // 搜索过滤
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  // 添加任务
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('请输入任务名称')
      return
    }

    const xpMap = { easy: 100, medium: 200, hard: 500 }
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          xp: xpMap[newTask.difficulty],
        }),
      })

      if (!response.ok) throw new Error('创建失败')

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        onTasksChange([data.task, ...tasks])
        setNewTask({ title: '', description: '', type: 'daily', difficulty: 'medium' })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      toast.error('创建任务失败')
    }
  }

  // 完成任务
  const handleComplete = async (task: Task) => {
    if (task.completed) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          updates: { completed: true, completedAt: new Date() }
        }),
      })

      if (!response.ok) throw new Error('更新失败')

      onTaskComplete(task)
      
      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, completed: true, completedAt: new Date() } : t
      )
      onTasksChange(updatedTasks)
    } catch (error) {
      toast.error('完成任务失败')
    }
  }

  // 删除任务
  const handleDelete = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`/api/tasks?id=${taskToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        onTasksChange(tasks.filter(t => t.id !== taskToDelete.id))
        setIsDeleteDialogOpen(false)
        setTaskToDelete(null)
      }
    } catch (error) {
      toast.error('删除任务失败')
    }
  }

  // 编辑任务
  const handleEdit = async () => {
    if (!editingTask) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask.id,
          updates: editingTask
        }),
      })

      if (!response.ok) throw new Error('更新失败')

      toast.success('任务更新成功！')
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id ? editingTask : t
      )
      onTasksChange(updatedTasks)
      setIsEditDialogOpen(false)
      setEditingTask(null)
    } catch (error) {
      toast.error('更新任务失败')
    }
  }

  return (
    <Card className="bg-[#0a1628] border-[#1e3a5f] text-white h-[650px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00d4ff]" />
            任务系统
            <Badge variant="outline" className="ml-2 border-[#1e3a5f] text-[#94a3b8]">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black">
                <Plus className="w-4 h-4 mr-1" />
                新建
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a1628] border-[#1e3a5f] text-white">
              <DialogHeader>
                <DialogTitle>创建新任务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-[#94a3b8]">任务名称</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="输入任务名称..."
                    className="bg-[#0f2642] border-[#1e3a5f] mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[#94a3b8]">任务描述</label>
                  <Input
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="输入任务描述..."
                    className="bg-[#0f2642] border-[#1e3a5f] mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#94a3b8]">任务类型</label>
                    <Select
                      value={newTask.type}
                      onValueChange={(value: any) => setNewTask({ ...newTask, type: value })}
                    >
                      <SelectTrigger className="bg-[#0f2642] border-[#1e3a5f] mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f2642] border-[#1e3a5f]">
                        <SelectItem value="main">主线任务</SelectItem>
                        <SelectItem value="daily">日常任务</SelectItem>
                        <SelectItem value="side">支线任务</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-[#94a3b8]">难度</label>
                    <Select
                      value={newTask.difficulty}
                      onValueChange={(value: any) => setNewTask({ ...newTask, difficulty: value })}
                    >
                      <SelectTrigger className="bg-[#0f2642] border-[#1e3a5f] mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f2642] border-[#1e3a5f]">
                        <SelectItem value="easy">简单 (+100 XP)</SelectItem>
                        <SelectItem value="medium">中等 (+200 XP)</SelectItem>
                        <SelectItem value="hard">困难 (+500 XP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddTask}
                  className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建任务
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索任务..."
              className="pl-8 bg-[#0f2642] border-[#1e3a5f] text-sm"
            />
          </div>
          
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[100px] bg-[#0f2642] border-[#1e3a5f]">
              <Filter className="w-4 h-4 mr-1" />
              <span className="text-xs">{filter === 'all' ? '全部' : typeConfig[filter].label}</span>
            </SelectTrigger>
            <SelectContent className="bg-[#0f2642] border-[#1e3a5f]">
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="main">主线</SelectItem>
              <SelectItem value="daily">日常</SelectItem>
              <SelectItem value="side">支线</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 状态筛选标签 */}
        <div className="flex gap-2 mt-2">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              className={`text-xs ${
                statusFilter === status 
                  ? 'bg-[#00d4ff] text-black' 
                  : 'border-[#1e3a5f] text-[#94a3b8]'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' && '全部'}
              {status === 'pending' && '进行中'}
              {status === 'completed' && '已完成'}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task, index) => {
                const TypeIcon = typeConfig[task.type].icon
                const diff = difficultyConfig[task.difficulty]
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-[#1e3a5f]/30 border-[#1e3a5f]/50 opacity-60'
                        : 'bg-[#0f2642] border-[#1e3a5f] hover:border-[#00d4ff]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleComplete(task)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`w-4 h-4 ${
                            task.completed ? 'text-[#64748b]' : 'text-[#00d4ff]'
                          }`} />
                          <span className={`font-medium truncate ${
                            task.completed ? 'line-through text-[#64748b]' : ''
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-[#64748b] mt-1 truncate">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${diff.color} border-current`}
                          >
                            {diff.label} +{task.xp} XP
                          </Badge>
                          
                          <Badge 
                            variant="outline" 
                            className="text-xs border-[#1e3a5f] text-[#94a3b8]"
                          >
                            {typeConfig[task.type].label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-[#64748b] hover:text-[#00d4ff]"
                          onClick={() => {
                            setEditingTask(task)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-[#64748b] hover:text-red-400"
                          onClick={() => {
                            setTaskToDelete(task)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-[#64748b]">
                <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无任务</p>
                <p className="text-sm mt-1">点击"新建"创建第一个任务</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#0a1628] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#94a3b8]">任务名称</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="bg-[#0f2642] border-[#1e3a5f] mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm text-[#94a3b8]">任务描述</label>
                <Input
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="bg-[#0f2642] border-[#1e3a5f] mt-1"
                />
              </div>
              
              <Button 
                onClick={handleEdit}
                className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                保存修改
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#0a1628] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-[#94a3b8] mt-4">
            确定要删除任务「{taskToDelete?.title}」吗？此操作不可恢复。
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-[#1e3a5f]"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
