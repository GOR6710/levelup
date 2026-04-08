#!/bin/bash
# LevelUp v3.0 每小时进度汇报脚本

PROJECT_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"
LOG_FILE="/tmp/levelup-v3-progress.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] 开始生成进度报告..." >> $LOG_FILE

cd $PROJECT_DIR

# 获取进度统计
if [ -f feature_list_v3.json ]; then
  TOTAL=$(cat feature_list_v3.json | grep '"id": "v3-' | wc -l)
  COMPLETED=$(cat feature_list_v3.json | grep '"passes": true' | wc -l)
  PERCENTAGE=$((COMPLETED * 100 / TOTAL))
  
  # 找到当前进行的任务
  CURRENT_TASK=$(cat feature_list_v3.json | grep -B 5 '"passes": false' | grep '"id":' | head -1 | cut -d'"' -f4)
  CURRENT_DESC=$(cat feature_list_v3.json | grep -A 10 '"passes": false' | grep '"description":' | head -1 | cut -d'"' -f4)
  
  # 计算剩余时间
  START_TIME=$(date -d "2026-04-08 02:00:00" +%s)
  NOW=$(date +%s)
  DEADLINE=$(date -d "2026-04-09 02:00:00" +%s)
  ELAPSED=$((NOW - START_TIME))
  REMAINING=$((DEADLINE - NOW))
  ELAPSED_HOURS=$((ELAPSED / 3600))
  REMAINING_HOURS=$((REMAINING / 3600))
  
  # 生成报告
  REPORT="🚀 LevelUp v3.0 进度报告

⏰ 时间: $TIMESTAMP
📊 总体进度: $COMPLETED/$TOTAL ($PERCENTAGE%)
⏱️ 已用时间: ${ELAPSED_HOURS}小时
⏳ 剩余时间: ${REMAINING_HOURS}小时

🎯 当前任务: $CURRENT_TASK
📝 $CURRENT_DESC

📈 最近完成:
$(git log --oneline -5 2>/dev/null || echo "无提交记录")

💪 继续加油！"

  echo "$REPORT" >> $LOG_FILE
  
  # 发送 Telegram 消息
  curl -s -X POST "https://api.telegram.org/bot8351771348:AAEnflYuy7QPbt0J9suUN4yDOBbL65Ez588/sendMessage" \
    -d "chat_id=8701705615" \
    -d "text=$REPORT" >> $LOG_FILE 2>&1
  
  echo "[$TIMESTAMP] 报告已发送" >> $LOG_FILE
else
  echo "[$TIMESTAMP] 错误: feature_list_v3.json 不存在" >> $LOG_FILE
fi
