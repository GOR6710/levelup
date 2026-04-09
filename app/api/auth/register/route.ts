import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokens, hashPassword, comparePassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user with initial stats
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        provider: 'email',
        stats: {
          create: {
            level: 1,
            currentXP: 0,
            maxXP: 100,
            totalPower: 0,
            achievementsCount: 0,
            streakDays: 0
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true
      }
    })

    // Generate tokens
    const tokens = generateTokens({ userId: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      data: {
        user,
        tokens
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
