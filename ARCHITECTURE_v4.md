# LevelUp 全平台部署规划

## 目标
- **截止日期**: 2026年4月15日
- **平台**: Android, iOS, HarmonyOS, Web
- **核心**: 统一后端 (Neon PostgreSQL)
- **登录**: 多平台账号系统

## 架构设计

### 后端 (共享)
- **数据库**: Neon PostgreSQL (已有)
- **API**: Next.js API Routes → 后续迁移到独立后端
- **认证**: JWT + OAuth (GitHub/Google/Apple/华为账号)
- **文件存储**: Cloudflare R2 / AWS S3

### 前端 (各平台)
```
levelup-shared/          # 共享代码库
├── shared/
│   ├── api/            # API 客户端
│   ├── types/          # TypeScript 类型
│   ├── stores/         # 状态管理
│   └── components/     # 跨平台组件

levelup-web/            # Web端 (Next.js)
levelup-android/        # Android (React Native)
levelup-ios/            # iOS (React Native)
levelup-harmony/        # 鸿蒙 (ArkTS/Flutter)
```

## 每日任务规划 (4月8日-15日)

### Phase 1: 基础架构 (4月8-9日)
- [ ] 统一登录系统 (OAuth + JWT)
- [ ] API 标准化
- [ ] 共享代码库搭建

### Phase 2: Web端完善 (4月9-10日)
- [ ] Web端登录集成
- [ ] PWA 完整支持
- [ ] 离线数据同步

### Phase 3: React Native (4月10-12日)
- [ ] Android 应用
- [ ] iOS 应用
- [ ] 共享业务逻辑

### Phase 4: 鸿蒙适配 (4月12-13日)
- [ ] HarmonyOS 应用
- [ ] 方舟引擎适配

### Phase 5: 测试优化 (4月13-15日)
- [ ] 跨平台数据同步测试
- [ ] 性能优化
- [ ] 发布准备

## 文档规划
- `OPTIMIZATION_PLAN_v3.md` - v3.0 优化方案
- `OPTIMIZATION_PLAN_v4.md` - 全平台部署方案
- `DAILY_LOG_2026-04-08.md` - 每日进展
- `DAILY_LOG_2026-04-09.md` - 每日进展
- ...

## GitHub 仓库
- `GOR6710/levelup` - Web端 (已有)
- `GOR6710/levelup-android` - Android
- `GOR6710/levelup-ios` - iOS  
- `GOR6710/levelup-harmony` - 鸿蒙
- `GOR6710/levelup-shared` - 共享代码
- `GOR6710/levelup-backend` - 独立后端 (可选)
