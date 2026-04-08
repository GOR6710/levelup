# LevelUp Function Calling 架构文档

## 核心原理

Function Calling 让 AI 从"说话"变成"做事"。

### 传统 AI 交互
```
用户: 创建一个任务
AI: 好的，已创建任务 ← 只是文本回复，没有实际操作
```

### Function Calling 交互
```
用户: 创建一个任务
AI: → 调用 create_task() 函数
   → 插入数据库
   → 返回成功结果
   → 界面自动刷新
```

## 工作流程

1. **定义工具** - 告诉 AI 有哪些函数可用
2. **用户输入** - 发送消息给 AI
3. **AI 分析** - 判断是否需要调用工具
4. **执行函数** - 后端真正执行操作
5. **返回结果** - 更新界面并通知用户

## 已实现的工具函数

| 函数名 | 功能 | 参数 |
|--------|------|------|
| create_task | 创建任务 | title, type, difficulty, description |
| delete_task | 删除任务 | task_id |
| complete_task | 完成任务 | task_id |
| update_user_stats | 更新属性 | stat_name, value |
| get_current_state | 获取状态 | 无 |
| generate_learning_plan | 生成学习计划 | subject, difficulty |

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript
- **后端**: Next.js API Routes
- **AI**: OpenRouter (Gemini 2.0 Flash)
- **数据库**: SQLite + Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS

## 数据流

```
用户输入 → AI API → Function Call → 数据库操作 → 返回结果 → UI更新
```

## 版本历史

- v1.0.0: 基础功能
- v1.1.0: AI 对话 + 任务管理
- v1.2.0: AI 意图识别
- v1.3.0: Function Calling 架构
- v1.4.0: SQLite 数据库持久化
