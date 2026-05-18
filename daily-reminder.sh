#!/bin/bash
# ==========================================
#  LevelUp - 每日工作提醒系统
# ==========================================
# 用途：每天早上 8 点发送消息提醒开始工作
# 下午 2 点生成报告并发送汇报

WORK_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"
REPORT_DIR="/home/gorden/.openclaw/workspace/reports"
LOG_FILE="/tmp/levelup-daily-$(date +%Y-%m-%d).log"

# 日志函数
echo_log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 记录开始
echo_log "=========================================="
echo_log "  LevelUp 每日工作提醒系统"
echo_log "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo_log "=========================================="

# 检查时间
current_hour=$(date +%H)

if [ "$current_hour" == "08" ]; then
    echo_log "🌅 早上 8 点 - 发送开始工作提醒"
    # 这里可以添加发送消息的命令
    echo "开始工作提醒" > /tmp/levelup-start-work.flag
    
elif [ "$current_hour" == "14" ]; then
    echo_log "🌆 下午 2 点 - 生成工作报告"
    
    # 生成报告
    report_file="$REPORT_DIR/$(date +%Y-%m-%d)-daily-report.md"
    
    cd "$WORK_DIR"
    
    cat > "$report_file" << EOF
# LevelUp 每日工作报告

**日期**: $(date '+%Y-%m-%d')  
**报告时间**: $(date '+%H:%M:%S')

## 项目状态
- **Web (levelup)**: $(git log -1 --format="%h %s" 2>/dev/null || echo "无法获取")
- **构建状态**: $(if [ -d ".next" ]; then echo "✅ 已构建"; else echo "❌ 未构建"; fi)

## 今日工作
- 等待用户指令进行优化迭代

## 四个仓库状态
- **Web**: $(git log -1 --format="%h %s" 2>/dev/null || echo "无法获取")
- **SDK**: $(cd /tmp/levelup-sdk 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")
- **Mobile**: $(cd /tmp/levelup-mobile 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")
- **HarmonyOS**: $(cd /tmp/levelup-harmony 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")

## 明日计划
- 继续优化迭代四个仓库
- 检查 TypeScript 编译错误
- 更新过期依赖

---
*由 LevelUp 每日工作系统生成*
EOF
    
    echo_log "✅ 报告已生成: $report_file"
    echo "工作汇报完成" > /tmp/levelup-report-done.flag
    
else
    echo_log "⏰ 非工作时间，跳过"
fi

echo_log "=========================================="
