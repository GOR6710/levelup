import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'levelup-secret-key';

// 验证 JWT Token
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

// 获取任务列表
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const completed = searchParams.get('completed');

    const where: any = { userId: decoded.userId };
    if (type) where.type = type;
    if (completed !== null) where.completed = completed === 'true';

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('获取任务错误:', error);
    return NextResponse.json(
      { success: false, error: '获取任务失败' },
      { status: 500 }
    );
  }
}

// 创建任务
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, type, difficulty, xp, dueDate } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: '标题和类型必填' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        difficulty: difficulty || 'medium',
        xp: xp || 100,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error('创建任务错误:', error);
    return NextResponse.json(
      { success: false, error: '创建任务失败' },
      { status: 500 }
    );
  }
}

// 更新任务 (完成任务)
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '任务 ID 必填' },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id, userId: decoded.userId },
      data: {
        ...updates,
        completedAt: updates.completed ? new Date() : null,
      },
    });

    // 如果任务完成，更新用户 XP
    if (updates.completed && !task.completed) {
      await prisma.userStat.update({
        where: { userId: decoded.userId },
        data: {
          currentXP: { increment: task.xp },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error('更新任务错误:', error);
    return NextResponse.json(
      { success: false, error: '更新任务失败' },
      { status: 500 }
    );
  }
}
