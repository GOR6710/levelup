'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LevelUpSDK } from '../../../shared/sdk';
import type { Task, UserStats, Stat } from '../../../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const sdk = new LevelUpSDK({
    baseURL: API_BASE_URL,
    getToken,
  });

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
      const [tasksRes, statsRes] = await Promise.all([
        sdk.getTasks(),
        sdk.getStats(),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data || []);
      }

      if (statsRes.success) {
        setStats(statsRes.data?.stats || []);
        setUserStats(statsRes.data?.userStats || null);
      }
    } catch (err) {
      setError('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const result = await sdk.completeTask(taskId);
    if (result.success) {
      loadData();
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
    <div className="min-h-screen bg-[#0a1628] text-white">
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* XP Progress */}
        {userStats && (
          <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-xl p-6 mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-white">经验值</span>
              <span className="text-cyan-400">
                {userStats.currentXP} / {userStats.maxXP}
              </span>
            </div>
            <div className="w-full bg-[#1e3a5f] rounded-full h-3">
              <div
                className="bg-cyan-400 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(userStats.currentXP / userStats.maxXP) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-400">
              <span>🔥 连续 {userStats.streakDays} 天</span>
              <span>⚡ 总战力 {userStats.totalPower}</span>
              <span>🏆 成就 {userStats.achievementsCount}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stats Section */}
          <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">属性</h2>
            <div className="space-y-4">
              {stats.map((stat) => {
                const percentage = (stat.value / stat.maxValue) * 100;
                return (
                  <div key={stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2">
                        <span>{stat.icon}</span>
                        <span>{stat.name}</span>
                      </span>
                      <span className="text-cyan-400">{stat.value}</span>
                    </div>
                    <div className="w-full bg-[#1e3a5f] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-[#0f2642] border border-[#1e3a5f] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">任务</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => !task.completed && handleCompleteTask(task.id)}
                  className={`p-4 rounded-lg border border-[#1e3a5f] cursor-pointer transition-all ${
                    task.completed
                      ? 'opacity-50 bg-[#1a3a5f]'
                      : 'hover:border-cyan-400 hover:bg-[#1e3a5f]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`font-bold ${
                        task.completed ? 'line-through text-gray-400' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded text-black font-bold ${getTaskTypeColor(
                        task.type
                      )}`}
                    >
                      {getTaskTypeLabel(task.type)}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">+{task.xp} XP</span>
                    <span className="text-gray-500 capitalize">{task.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
