#!/bin/bash

# LevelUp 进度报告脚本
# 每小时运行一次

LOG_FILE="/tmp/levelup-progress.log"
PROJECT_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"

echo "========== LevelUp 进度报告 $(date) ==========" >> $LOG_FILE

cd $PROJECT_DIR

# 检查服务器状态
echo "1. 服务器状态:" >> $LOG_FILE
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ 开发服务器运行正常" >> $LOG_FILE
else
    echo "   ❌ 开发服务器未运行" >> $LOG_FILE
fi

# 检查 Git 状态
echo "" >> $LOG_FILE
echo "2. Git 状态:" >> $LOG_FILE
git status --short >> $LOG_FILE 2>&1 || echo "   Git 错误" >> $LOG_FILE

# 检查最近的提交
echo "" >> $LOG_FILE
echo "3. 最近提交:" >> $LOG_FILE
git log --oneline -3 >> $LOG_FILE 2>&1 || echo "   无提交记录" >> $LOG_FILE

# 推送到 GitHub
echo "" >> $LOG_FILE
echo "4. 推送到 GitHub:" >> $LOG_FILE
if git push origin main >> $LOG_FILE 2>&1; then
    echo "   ✅ 推送成功" >> $LOG_FILE
else
    echo "   ⚠️ 推送失败或无需推送" >> $LOG_FILE
fi

echo "" >> $LOG_FILE
echo "==========================================" >> $LOG_FILE
echo "" >> $LOG_FILE

# 显示报告
cat $LOG_FILE | tail -30