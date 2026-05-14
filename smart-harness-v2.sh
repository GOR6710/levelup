#!/bin/bash
# ==========================================
#  LevelUp - 智能工作 Harness (测试版)
# ==========================================
# 用途：每天早上 8 点自动启动，下午 2 点自动汇报
# 测试命令：bash smart-harness-v2.sh --test

set -e

WORK_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"
REPORT_DIR="/home/gorden/.openclaw/workspace/reports"
LOG_FILE="/tmp/levelup-smart-$(date +%Y-%m-%d).log"
PID_FILE="/tmp/levelup-daily-work.pid"

# 确保目录存在
mkdir -p "$REPORT_DIR"

# 日志函数
echo_log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 执行实际工作
do_work() {
    echo_log "🔍 执行工作检查..."
    
    # 1. 检查 Git 状态
    echo_log "  [1/4] 检查 Git 状态..."
    if git status --short | grep -q .; then
        echo_log "  ⚠️  工作区有未提交更改"
    else
        echo_log "  ✅ 工作区干净"
    fi
    
    # 2. 检查构建状态（只在整点检查，避免太频繁）
    if [ "$(date +%M)" == "00" ]; then
        echo_log "  [2/4] 检查构建状态..."
        if npm run build > /tmp/build.log 2>&1; then
            echo_log "  ✅ 构建成功"
        else
            echo_log "  ❌ 构建失败"
            tail -5 /tmp/build.log | sed 's/^/     /' | tee -a "$LOG_FILE"
        fi
    fi
    
    # 3. 检查 TypeScript（只在半点检查）
    if [ "$(date +%M)" == "30" ]; then
        echo_log "  [3/4] 检查 TypeScript..."
        if npx tsc --noEmit > /tmp/tsc.log 2>&1; then
            echo_log "  ✅ TypeScript 无错误"
        else
            error_count=$(grep -c "error TS" /tmp/tsc.log 2>/dev/null || echo "0")
            echo_log "  ⚠️  发现 $error_count 个错误"
        fi
    fi
    
    # 4. 检查依赖（只在 9:00 检查）
    if [ "$(date +%H:%M)" == "09:00" ]; then
        echo_log "  [4/4] 检查依赖更新..."
        npm outdated > /tmp/outdated.log 2>&1 || true
        outdated_count=$(wc -l < /tmp/outdated.log)
        if [ "$outdated_count" -gt 0 ]; then
            echo_log "  📦 有 $outdated_count 个依赖可更新"
        fi
    fi
    
    echo_log "  ✅ 本次检查完成"
}

# 生成报告
generate_report() {
    echo_log "📝 生成工作报告..."
    
    report_file="$REPORT_DIR/$(date +%Y-%m-%d)-smart-report.md"
    
    cat > "$report_file" << EOF
# LevelUp 智能工作日报

**日期**: $(date '+%Y-%m-%d')  
**工作时段**: 08:00 - 14:00  
**报告时间**: $(date '+%H:%M:%S')  
**工作迭代**: $iteration 次

## 今日工作摘要

### 项目状态
- **Web (levelup)**: $(git log -1 --format="%h %s" 2>/dev/null || echo "无法获取")
- **构建状态**: $(if [ -d ".next" ]; then echo "✅ 已构建"; else echo "❌ 未构建"; fi)

### 代码变更
$(git log --since="08:00" --oneline 2>/dev/null | sed 's/^/- /' || echo "- 无代码变更")

### 问题记录
$(if [ -f "/tmp/tsc.log" ] && grep -q "error TS" /tmp/tsc.log 2>/dev/null; then
    echo "- TypeScript 错误:"
    grep "error TS" /tmp/tsc.log | head -3 | sed 's/^/  - /'
else
    echo "- 无 TypeScript 错误"
fi)

## 同步检查

### 四个仓库状态
- **Web (levelup)**: $(git log -1 --format="%h %s" 2>/dev/null || echo "无法获取")
- **SDK**: $(cd /tmp/levelup-sdk 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")
- **Mobile**: $(cd /tmp/levelup-mobile 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")
- **HarmonyOS**: $(cd /tmp/levelup-harmony 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null || echo "未克隆")

## 明日建议
- [ ] 检查 TypeScript 编译错误
- [ ] 更新过期依赖
- [ ] 同步四个仓库的接口定义

---
*由 LevelUp 智能 Harness 自动生成*
EOF
    
    echo_log "  ✅ 报告已生成: $report_file"
    
    # 显示报告摘要
    echo_log ""
    echo_log "📊 报告摘要:"
    head -20 "$report_file" | sed 's/^/  /' | tee -a "$LOG_FILE"
}

# 清理函数
cleanup() {
    echo_log "🧹 清理资源..."
    rm -f "$PID_FILE"
    exit 0
}

# 设置信号处理
trap cleanup EXIT TERM INT

# 记录开始
echo_log "=========================================="
echo_log "  LevelUp 智能工作 Harness 启动"
echo_log "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo_log "=========================================="

# 检查是否应该工作（08:00 - 14:00）
current_hour=$(date +%H)
if [ "$1" == "--test" ]; then
    echo_log "🧪 测试模式，忽略时间检查"
    # 测试模式只运行 2 分钟
    TEST_MODE=true
    END_HOUR=99  # 不会触发结束
elif [ "$current_hour" -lt 8 ] || [ "$current_hour" -ge 14 ]; then
    echo_log "⏰ 非工作时间 (当前 $current_hour:00)，退出"
    exit 0
else
    TEST_MODE=false
    END_HOUR=14
fi

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    old_pid=$(cat "$PID_FILE")
    if ps -p "$old_pid" > /dev/null 2>&1; then
        echo_log "⚠️  工作进程已在运行 (PID: $old_pid)，跳过"
        exit 0
    else
        echo_log "🧹 清理过期的 PID 文件"
        rm -f "$PID_FILE"
    fi
fi

# 标记进程
echo $$ > "$PID_FILE"
echo_log "📝 PID 已记录: $$"

cd "$WORK_DIR"

# 工作循环
echo_log "🚀 开始工作循环..."
echo_log "  工作目录: $WORK_DIR"

iteration=0
while true; do
    iteration=$((iteration + 1))
    current_hour=$(date +%H)
    current_min=$(date +%M)
    
    echo_log "🔄 工作迭代 #$iteration ($(date '+%H:%M'))"
    
    # 测试模式：2 分钟后退出
    if [ "$TEST_MODE" == "true" ] && [ "$iteration" -ge 2 ]; then
        echo_log "🧪 测试模式结束 (运行了 2 分钟)"
        generate_report
        break
    fi
    
    # 检查是否到达结束时间
    if [ "$current_hour" -ge "$END_HOUR" ] && [ "$TEST_MODE" == "false" ]; then
        echo_log "🏁 到达结束时间 ($END_HOUR:00)，生成报告..."
        generate_report
        break
    fi
    
    # 执行工作
    do_work
    
    # 等待 1 分钟
    echo_log "⏳ 等待 1 分钟..."
    sleep 60
done

echo_log "=========================================="
echo_log "  工作结束 - $(date '+%H:%M:%S')"
echo_log "=========================================="

# 清理由 trap 处理
