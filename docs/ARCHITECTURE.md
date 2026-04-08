# Skill System - 架构设计文档

## 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js 14)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   页面路由    │  │   组件库     │  │   状态管理    │       │
│  │  App Router  │  │ shadcn/ui   │  │   Zustand    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   图表库     │  │   动画库     │  │   样式       │       │
│  │  Recharts   │  │Framer Motion│  │Tailwind CSS  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 层 (Next.js API)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  /api/user   │  │/api/attributes│  │ /api/skills │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  /api/tasks  │  │  /api/ai/*   │  │/api/progress │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    服务层 (Services)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  UserService │  │AttributeSvc  │  │ SkillService │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  TaskService │  │  AIService   │  │  XPService   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据层 (Prisma + PostgreSQL)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    User      │  │  Attribute   │  │    Skill     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Task      │  │Achievement   │  │   AIChat     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   外部服务集成                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  OpenAI API  │  │  NextAuth   │  │   Vercel     │       │
│  │  (AI助手)    │  │  (认证)      │  │  (部署)      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 2. 目录结构

```
skill-system/
├── docs/                          # 文档
│   ├── PRD.md                     # 产品需求文档
│   ├── ARCHITECTURE.md            # 架构设计文档 (本文件)
│   └── API.md                     # API 接口文档
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 认证相关页面组
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/           # 主面板页面组
│   │   │   ├── page.tsx           # 主面板首页
│   │   │   ├── attributes/
│   │   │   ├── skills/
│   │   │   ├── tasks/
│   │   │   └── achievements/
│   │   ├── api/                   # API 路由
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── user/
│   │   │   ├── attributes/
│   │   │   ├── skills/
│   │   │   ├── tasks/
│   │   │   ├── ai/
│   │   │   └── progress/
│   │   ├── layout.tsx             # 根布局
│   │   └── globals.css            # 全局样式
│   ├── components/                # 组件
│   │   ├── ui/                    # 基础 UI 组件 (shadcn)
│   │   ├── layout/                # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── dashboard/             # 面板相关组件
│   │   │   ├── StatsPanel.tsx     # 属性面板
│   │   │   ├── RadarChart.tsx     # 雷达图
│   │   │   ├── SkillTree.tsx      # 技能树
│   │   │   ├── XPBar.tsx          # 经验条
│   │   │   ├── TaskList.tsx       # 任务列表
│   │   │   └── LevelBadge.tsx     # 等级徽章
│   │   ├── ai/                    # AI 相关组件
│   │   │   ├── AIChat.tsx         # AI 聊天界面
│   │   │   ├── AIAssistant.tsx    # AI 助手面板
│   │   │   └── TypingIndicator.tsx
│   │   └── animations/            # 动画组件
│   │       ├── LevelUpAnimation.tsx
│   │       ├── ParticleEffect.tsx
│   │       └── GlowEffect.tsx
│   ├── lib/                       # 工具库
│   │   ├── prisma.ts              # Prisma 客户端
│   │   ├── auth.ts                # NextAuth 配置
│   │   ├── openai.ts              # OpenAI 客户端
│   │   ├── utils.ts               # 工具函数
│   │   └── constants.ts           # 常量
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useUser.ts
│   │   ├── useAttributes.ts
│   │   ├── useSkills.ts
│   │   ├── useTasks.ts
│   │   └── useAI.ts
│   ├── stores/                    # Zustand 状态管理
│   │   ├── userStore.ts
│   │   ├── dashboardStore.ts
│   │   └── aiStore.ts
│   ├── services/                  # 业务逻辑服务
│   │   ├── userService.ts
│   │   ├── attributeService.ts
│   │   ├── skillService.ts
│   │   ├── taskService.ts
│   │   ├── xpService.ts
│   │   └── aiService.ts
│   ├── types/                     # TypeScript 类型
│   │   ├── user.ts
│   │   ├── attribute.ts
│   │   ├── skill.ts
│   │   ├── task.ts
│   │   └── ai.ts
│   └── styles/                    # 样式文件
│       ├── theme.ts               # 主题配置
│       └── animations.ts          # 动画配置
├── prisma/
│   ├── schema.prisma              # 数据库模型
│   └── migrations/                # 数据库迁移
├── public/                        # 静态资源
│   ├── images/
│   ├── icons/
│   └── sounds/                    # 音效文件
├── tests/                         # 测试文件
├── .env.local                     # 环境变量
├── .env.example                   # 环境变量示例
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 3. 数据库模型详细设计

### 3.1 完整 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  level         Int       @default(1)
  totalXP       Int       @default(0)
  nextLevelXP   Int       @default(100)
  
  // 关联
  attributes    Attribute[]
  skills        Skill[]
  tasks         Task[]
  achievements  UserAchievement[]
  aiChats       AIChat[]
  activityLogs  ActivityLog[]
  
  // 时间戳
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  @@map("users")
}

// 属性模型
model Attribute {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String   // 力量、智力、敏捷等
  category    String   // physical, mental, social, professional, mental_state, life
  displayName String   // 显示名称
  icon        String   // 图标
  
  level       Int      @default(1)
  currentXP   Int      @default(0)
  maxXP       Int      @default(100)
  
  history     Json?    // { date: string, level: number, xp: number }[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, name])
  @@map("attributes")
}

// 技能模型
model Skill {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String
  description String?
  category    String   // programming, design, language, etc.
  icon        String?
  
  level       Int      @default(0)
  maxLevel    Int      @default(10)
  currentXP   Int      @default(0)
  maxXP       Int      @default(100)
  
  parentId    String?
  parent      Skill?   @relation("SkillTree", fields: [parentId], references: [id])
  children    Skill[]  @relation("SkillTree")
  
  unlocked    Boolean  @default(false)
  unlockRequirements Json? // 解锁条件
  
  dependencies String[] // 依赖的技能ID
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("skills")
}

// 任务模型
model Task {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  type        TaskType // daily, main, side, limited
  
  xpReward    Int      @default(10)
  attributeRewards Json? // { attributeId: xpGained }
  
  completed   Boolean  @default(false)
  completedAt DateTime?
  
  dueDate     DateTime?
  scheduledAt DateTime?
  
  recurrence  String?  // daily, weekly, monthly
  streak      Int      @default(0)
  maxStreak   Int      @default(0)
  
  priority    Priority @default(medium)
  tags        String[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("tasks")
}

enum TaskType {
  daily
  main
  side
  limited
}

enum Priority {
  low
  medium
  high
  urgent
}

// 成就模型
model Achievement {
  id          String   @id @default(cuid())
  name        String   @unique
  title       String
  description String
  icon        String
  category    String   // level, skill, streak, special
  condition   Json     // 解锁条件
  xpReward    Int      @default(0)
  
  users       UserAchievement[]
  
  createdAt   DateTime @default(now())
  
  @@map("achievements")
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  unlockedAt    DateTime    @default(now())
  
  @@unique([userId, achievementId])
  @@map("user_achievements")
}

// AI 聊天记录
model AIChat {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role      String   // user, assistant, system
  content   String
  metadata  Json?    // 额外的上下文信息
  
  createdAt DateTime @default(now())
  
  @@map("ai_chats")
}

// 活动日志
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        String   // task_complete, level_up, skill_unlock, achievement_unlock
  title       String
  description String?
  xpGained    Int      @default(0)
  metadata    Json?    // 相关数据
  
  createdAt   DateTime @default(now())
  
  @@map("activity_logs")
}
```

## 4. 核心业务流程

### 4.1 用户注册与初始化流程
```
1. 用户注册/登录 (NextAuth)
2. 创建用户记录
3. 初始化默认属性 (6大类别，每类4个子属性)
4. 初始化示例技能树
5. 生成欢迎任务
6. 跳转到主面板
```

### 4.2 任务完成与经验计算流程
```
1. 用户标记任务完成
2. 计算基础 XP 奖励
3. 计算属性 XP 奖励
4. 检查连续打卡 (streak)
5. 更新任务状态
6. 更新用户总 XP
7. 检查是否升级
8. 如果升级：触发升级动画 + AI 祝贺
9. 检查成就解锁
10. 记录活动日志
```

### 4.3 AI 助手交互流程
```
1. 用户发送消息
2. 保存用户消息到数据库
3. 构建上下文 (最近 10 条聊天记录 + 用户当前状态)
4. 调用 OpenAI API
5. 解析 AI 响应
6. 如果包含行动计划：解析并展示
7. 如果包含可视化建议：更新图表
8. 保存 AI 响应到数据库
9. 展示给用户
```

## 5. 关键技术决策

### 5.1 为什么选择 Next.js 14?
- App Router 提供更好的路由组织
- Server Components 减少客户端 JS
- 内置 API Routes 简化架构
- 优秀的 SSR/SSG 支持

### 5.2 为什么选择 shadcn/ui?
- 组件代码完全可控
- 基于 Radix UI，可访问性好
- 与 Tailwind CSS 完美集成
- 可以按需复制组件

### 5.3 为什么选择 Zustand?
- 比 Redux 简单，比 Context 性能好
- 支持持久化存储
- TypeScript 支持好
- 代码量少

### 5.4 为什么选择 PostgreSQL?
- 强大的 JSON 支持 (存储历史数据)
- 复杂查询性能好
- 与 Prisma 配合好
- 支持数组类型

## 6. 性能优化策略

### 6.1 前端优化
- 使用 Next.js Image 组件优化图片
- 组件懒加载 (dynamic import)
- 使用 React.memo 避免不必要重渲染
- 图表数据分页加载

### 6.2 后端优化
- Prisma 连接池
- API 响应缓存
- 数据库索引优化
- AI 调用结果缓存

### 6.3 数据库优化
- 为 userId 字段添加索引
- 为常用查询字段添加复合索引
- 定期归档旧的活动日志

## 7. 安全考虑

- 使用 NextAuth.js 处理认证
- API 路由添加身份验证
- 敏感操作添加 CSRF 保护
- 数据库连接使用环境变量
- AI API Key 妥善保管

## 8. 部署架构

```
Vercel (Frontend + API)
    │
    ├── Next.js 应用
    ├── Serverless Functions
    └── Edge Functions (可选)
    
Supabase / Railway (Database)
    │
    └── PostgreSQL + 自动备份
    
第三方服务
    ├── OpenAI API
    └── 可选：Redis (缓存)
```

---

**文档版本**: v1.0
**创建日期**: 2026-03-12
**作者**: AI Assistant (汤米)
