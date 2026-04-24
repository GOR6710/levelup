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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // 查找任务
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: decoded.userId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (task.completed) {
      return NextResponse.json(
        { success: false, error: '任务已完成' },
        { status: 400 }
      );
    }

    // 更新任务为完成状态
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // 更新用户 XP
    const userStat = await prisma.userStat.findUnique({
      where: { userId: decoded.userId },
    });

    let leveledUp = false;
    let newXP = (userStat?.currentXP || 0) + task.xp;
    let newLevel = userStat?.level || 1;
    const maxXP = userStat?.maxXP || 1000;

    // 检查是否升级
    while (newXP >= maxXP) {
      newXP -= maxXP;
      newLevel += 1;
      leveledUp = true;
    }

    await prisma.userStat.update({
      where: { userId: decoded.userId },
      data: {
        currentXP: newXP,
        level: newLevel,
        totalPower: { increment: task.xp },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        xpGained: task.xp,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      },
    });
  } catch (error: any) {
    console.error('完成任务错误:', error);
    return NextResponse.json(
      { success: false, error: '完成任务失败' },
      { status: 500 }
    );
  }
}
