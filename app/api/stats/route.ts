import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'levelup-secret-key';

function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 获取用户统计
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        stats: true,
        tasks: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 计算等级信息
    const userXP = user.stats?.currentXP || 0;
    const level = Math.floor(userXP / 1000) + 1;
    const currentXP = userXP % 1000;
    const maxXP = 1000;

    // 计算连续天数
    const completedTasks = user.tasks.filter(t => t.completed);
    const streakDays = completedTasks.length > 0 ? 7 : 0; // 简化计算

    const userStats = {
      level,
      currentXP,
      maxXP,
      totalPower: user.stats.reduce((sum, s) => sum + s.value, 0),
      achievementsCount: completedTasks.length,
      streakDays,
    };

    const stats = user.stats.map(stat => ({
      name: stat.name,
      value: stat.value,
      maxValue: stat.maxValue,
      icon: stat.icon,
      color: stat.color,
    }));

    return NextResponse.json({
      success: true,
      data: {
        userStats,
        stats,
      },
    });
  } catch (error: any) {
    console.error('获取统计错误:', error);
    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    );
  }
}
