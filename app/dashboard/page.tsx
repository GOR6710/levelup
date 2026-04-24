'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LevelUpAPI } from '@/shared/api/client';
import type { Task, UserStats, Stat } from '@/shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const sdk = new LevelUpAPI(API_BASE_URL, getToken);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tasksRes, statsRes] = await Promise.all([
        sdk.getTasks(),
        sdk.getStats()
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data || []);
      } else {
        setError(tasksRes.error || '加载任务失败');
      }

      if (statsRes.success) {
        setStats(statsRes.data?.stats || []);
        setUserStats(statsRes.data?.userStats || null);
      } else {
        setError(statsRes.error || '加载统计失败');
      }
    } catch (err: any) {
      setError(err.message || '加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (completingTask) return; // 防止重复点击
    
    setCompletingTask(taskId);
    try {
      const result = await sdk.updateTask(taskId, { completed: true });
      if (result.success) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
        loadData();
      }
    } catch (error) {
      console.error('完成任务失败:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-red-500';
      case 'daily': return 'bg-teal-500';
      case 'side': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return '主线';
      case 'daily': return '日常';
      case 'side': return '支线';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white relative overflow-hidden">
      {/* 成功动画 */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl text-2xl font-bold animate-bounce">
            ✅ 任务完成！+XP
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-[#0f2642] border-b border-[#1e3a5f] px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">LevelUp</h1>
          <div className="flex items-center gap-4">
            {userStats && (
              <div className="bg-cyan-500 text-black px-4 py-1 rounded-full font-bold">
                Lv.{userStats.level}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 任务列表 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">任务列表</h2>
              <button
                onClick={loadData}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                🔄 刷新
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">📋</div>
                <div className="text-gray-400">暂无任务</div>
                <div className="text-gray-500 text-sm mt-1">添加你的第一个任务开始升级吧！</div>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-[#0f2642] border border-[#1e3a5f] rounded-lg p-4 hover:border-cyan-500/50 transition-colors ${
                    task.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${getTaskTypeColor(task.type)} text-white text-xs px-2 py-1 rounded`}>
                          {getTaskTypeLabel(task.type)}
                        </span>
                        {task.completed && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            已完成
                          </span>
                        )}
                      </div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>💪 {task.xp} XP</span>
                        {task.dueDate && (
                          <span>📅 {new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                    {!task.completed && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completingTask === task.id}
                        className="ml-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {completingTask === task.id ? '完成中...' : '完成'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 属性面板 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">属性面板</h2>
            
            {userStats && (
              <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">等级</span>
                  <span className="text-cyan-400 font-bold">Lv.{userStats.level}</span>
                </div>
                <div className="w-full bg-[#1e3a5f] rounded-full h-2 mb-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${(userStats.currentXP / userStats.maxXP) * 100}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-400">
                  {userStats.currentXP} / {userStats.maxXP} XP
                </div>
              </div>
            )}

            {stats.length === 0 ? (
              <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">📊</div>
                <div className="text-gray-400">暂无属性数据</div>
              </div>
            ) : (
              stats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-[#0f2642] border border-[#1e3a5f] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-white font-medium">{stat.name}</span>
                    </div>
                    <span className="text-cyan-400 font-bold">{stat.value}</span>
                  </div>
                  <div className="w-full bg-[#1e3a5f] rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(stat.value / stat.maxValue) * 100}%`,
                        backgroundColor: stat.color 
                      }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {stat.value} / {stat.maxValue}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
