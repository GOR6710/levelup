import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'levelup-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token 必填' },
        { status: 400 }
      );
    }

    // 验证 refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

    // 检查数据库中是否存在
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token 已过期' },
        { status: 401 }
      );
    }

    // 生成新的 access token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken,
        },
      },
    });
  } catch (error: any) {
    console.error('刷新 Token 错误:', error);
    return NextResponse.json(
      { success: false, error: 'Token 无效' },
      { status: 401 }
    );
  }
}
