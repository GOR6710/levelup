#!/bin/bash
# LevelUp v3.0 初始化脚本
# 每个会话开始前运行，5秒恢复上下文

echo "🚀 LevelUp v3.0 - 尽善尽美版"
echo "================================"
echo ""

# 检查项目目录
cd /home/gorden/.openclaw/workspace/projects/skill-system

echo "📁 项目位置: $(pwd)"
echo ""

# 显示项目状态
echo "📊 项目状态:"
echo "--------------------------------"

# 检查 git 状态
if [ -d .git ]; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  COMMIT=$(git log -1 --pretty=format:"%h %s" 2>/dev/null || echo "no commits")
  echo "  Git 分支: $BRANCH"
  echo "  最新提交: $COMMIT"
else
  echo "  ⚠️  未初始化 Git"
fi

# 检查 Node.js 项目
if [ -f package.json ]; then
  PROJECT_NAME=$(cat package.json | grep '"name"' | head -1 | cut -d'"' -f4)
  VERSION=$(cat package.json | grep '"version"' | head -1 | cut -d'"' -f4)
  echo "  项目名称: $PROJECT_NAME"
  echo "  当前版本: $VERSION"
fi

echo ""
echo "📈 v3.0 进度统计:"
echo "--------------------------------"

# 统计 feature_list_v3.json
if [ -f feature_list_v3.json ]; then
  TOTAL=$(cat feature_list_v3.json | grep '"id": "v3-' | wc -l)
  COMPLETED=$(cat feature_list_v3.json | grep '"passes": true' | wc -l)
  PERCENTAGE=$((COMPLETED * 100 / TOTAL))
  
  echo "  总任务数: $TOTAL"
  echo "  已完成: $COMPLETED"
  echo "  进度: $PERCENTAGE%"
  echo ""
  
  # 显示下一个任务
  echo "🎯 下一个任务:"
  echo "--------------------------------"
  
  # 找到第一个未完成的任务
  NEXT_TASK=$(cat feature_list_v3.json | grep -A 10 '"passes": false' | grep '"id":' | head -1 | cut -d'"' -f4)
  NEXT_DESC=$(cat feature_list_v3.json | grep -A 10 '"passes": false' | grep '"description":' | head -1 | cut -d'"' -f4)
  
  if [ ! -z "$NEXT_TASK" ]; then
    echo "  ID: $NEXT_TASK"
    echo "  描述: $NEXT_DESC"
  else
    echo "  🎉 所有任务已完成！"
  fi
else
  echo "  ⚠️  feature_list_v3.json 不存在"
fi

echo ""
echo "📝 最近进度:"
echo "--------------------------------"
if [ -f progress_v3.txt ]; then
  tail -10 progress_v3.txt
else
  echo "  暂无进度记录"
fi

echo ""
echo "⚡ 建议操作:"
echo "--------------------------------"
echo "  1. 阅读 progress_v3.txt 了解上次工作"
echo "  2. 查看 feature_list_v3.json 确认当前任务"
echo "  3. 开始执行下一个 feature"
echo "  4. 完成后更新 passes: true"
echo "  5. git commit && git push"
echo "  6. 更新 progress_v3.txt"
echo ""
echo "🚀 准备就绪，开始工作！"
