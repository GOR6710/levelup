#!/bin/bash
# ==========================================
#  LevelUp - 每日自动化工作 Harness
# ==========================================
# 用途：每天早上 8 点自动启动，下午 2 点自动汇报
# 用法：bash daily-harness.sh [start|stop|status|report]

set -e

WORK_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"
REPORT_DIR="/home/gorden/.openclaw/workspace/reports"
LOG_FILE="/tmp/levelup-daily-$(date +%Y-%m-%d).log"
PID_FILE="/tmp/levelup-daily.pid"

# 确保目录存在
mkdir -p "$REPORT_DIR"

cd "$WORK_DIR"

echo_log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

start_work() {
    echo_log "=========================================="
    echo_log "  LevelUp 每日工作开始 - $(date '+%Y-%m-%d %H:%M')"
    echo_log "=========================================="
    
    # 记录 PID
    echo $$ > "$PID_FILE"
    
    # 1. 环境检查
    echo_log "[1/5] 环境检查..."
    
    # 检查 Git 状态
    if git status --short | grep -q .; then
        echo_log "  ⚠️  工作区有未提交更改"
        git status --short | head -5 | sed 's/^/     /' | tee -a "$LOG_FILE"
    else
        echo_log "  ✅ 工作区干净"
    fi
    
    # 检查依赖
    if [ -d "node_modules" ]; then
        echo_log "  ✅ node_modules 已存在"
    else
        echo_log "  📦 安装依赖..."
        npm install >> "$LOG_FILE" 2>&1
    fi
    
    # 2. 同步检查
    echo_log "[2/5] 同步检查..."
    
    # 拉取最新代码
    echo_log "  拉取最新代码..."
    git pull origin master >> "$LOG_FILE" 2>&1 || true
    
    # 3. 构建检查
    echo_log "[3/5] 构建检查..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        echo_log "  ✅ 构建成功"
    else
        echo_log "  ❌ 构建失败，需要修复"
    fi
    
    # 4. 开始工作循环
    echo_log "[4/5] 开始工作循环..."
    echo_log "  工作时段: 08:00 - 14:00"
    echo_log "  每 30 分钟检查一次任务状态"
    
    # 工作循环
    while true; do
        current_hour=$(date +%H)
        current_min=$(date +%M)
        
        # 检查是否到达结束时间 (14:00)
        if [ "$current_hour" -ge 14 ]; then
            echo_log "  到达结束时间，生成报告..."
            generate_report
            break
        fi
        
        # 每 30 分钟执行一次优化
        if [ "$current_min" == "00" ] || [ "$current_min" == "30" ]; then
            echo_log "  执行优化检查..."
            run_optimization
        fi
        
        # 检查是否被中断
        if [ ! -f "$PID_FILE" ]; then
            echo_log "  检测到中断信号，停止工作"
            break
        fi
        
        # 每分钟检查一次
        sleep 60
    done
}

run_optimization() {
    echo_log "  [优化] 检查 TypeScript 错误..."
    if npx tsc --noEmit >> "$LOG_FILE" 2>&1; then
        echo_log "  ✅ TypeScript 无错误"
    else
        error_count=$(grep -c "error TS" /tmp/tsc-errors.log 2>/dev/null || echo "0")
        echo_log "  ⚠️  发现 $error_count 个 TypeScript 错误"
    fi
    
    echo_log "  [优化] 检查依赖更新..."
    npm outdated > /tmp/outdated.log 2>&1 || true
    outdated_count=$(wc -l < /tmp/outdated.log)
    if [ "$outdated_count" -gt 0 ]; then
        echo_log "  📦 有 $outdated_count 个依赖可更新"
    fi
    
    # 检查四个仓库同步状态
    echo_log "  [优化] 检查仓库同步..."
    check_repo_sync
}

check_repo_sync() {
    repos=(
        "levelup-sdk:https://github.com/GOR6710/levelup-sdk"
        "levelup-mobile:https://github.com/GOR6710/levelup-mobile"
        "levelup-harmony:https://github.com/GOR6710/levelup-harmony"
    )
    
    for repo in "${repos[@]}"; do
        name=$(echo "$repo" | cut -d: -f1)
        url=$(echo "$repo" | cut -d: -f2-)
        
        if [ -d "/tmp/$name" ]; then
            cd "/tmp/$name"
            git fetch origin >> "$LOG_FILE" 2>&1 || true
            behind=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo "0")
            if [ "$behind" -gt 0 ]; then
                echo_log "  ⚠️  $name 落后 $behind 个提交"
            fi
        fi
    done
    
    cd "$WORK_DIR"
}

generate_report() {
    echo_log "[5/5] 生成工作报告..."
    
    report_file="$REPORT_DIR/$(date +%Y-%m-%d)-work-report.md"
    
    cat > "$report_file" << EOF
# LevelUp 每日工作报告

**日期**: $(date '+%Y-%m-%d')  
**工作时段**: 08:00 - 14:00  
**生成时间**: $(date '+%H:%M:%S')

## 工作摘要

### 项目状态
- **Web (levelup)**: $(git log -1 --format="%h %s" 2>/dev/null || echo "无提交")
- **构建状态**: $(if [ -f ".next/build-manifest.json" ]; then echo "✅ 已构建"; else echo "❌ 未构建"; fi)

### 今日改进
$(git log --since="08:00" --oneline 2>/dev/null | sed 's/^/- /' || echo "- 无新提交")

### 问题记录
$(if [ -f "/tmp/tsc-errors.log" ] && [ -s "/tmp/tsc-errors.log" ]; then
    echo "- TypeScript 错误:"
    head -5 /tmp/tsc-errors.log | sed 's/^/  - /'
else
    echo "- 无 TypeScript 错误"
fi)

### 同步状态
$(check_sync_status)

## 明日计划
- [ ] 继续优化 Web 项目
- [ ] 同步 SDK 类型定义
- [ ] 检查 Mobile 和 HarmonyOS 项目

---
*报告由 LevelUp 自动化 Harness 生成*
EOF

    echo_log "  ✅ 报告已生成: $report_file"
    
    # 尝试发送通知
    if command -v notify-send >/dev/null 2>&1; then
        notify-send "LevelUp" "每日工作报告已生成" 2>/dev/null || true
    fi
}

check_sync_status() {
    echo "- SDK: $(if [ -d "/tmp/levelup-sdk" ]; then echo "✅ 已同步"; else echo "❌ 未同步"; fi)"
    echo "- Mobile: $(if [ -d "/tmp/levelup-mobile" ]; then echo "✅ 已同步"; else echo "❌ 未同步"; fi)"
    echo "- HarmonyOS: $(if [ -d "/tmp/levelup-harmony" ]; then echo "✅ 已同步"; else echo "❌ 未同步"; fi)"
}

stop_work() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        echo_log "停止工作进程 (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        rm -f "$PID_FILE"
        echo_log "✅ 工作已停止"
    else
        echo_log "⚠️  没有找到运行中的工作进程"
    fi
}

show_status() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "状态: 🟢 工作中 (PID: $pid)"
            echo "开始时间: $(stat -c %y "$PID_FILE" 2>/dev/null || echo "未知")"
            echo "日志文件: $LOG_FILE"
            if [ -f "$LOG_FILE" ]; then
                echo "最近日志:"
                tail -5 "$LOG_FILE" | sed 's/^/  /'
            fi
        else
            echo "状态: ⚠️  PID 文件存在但进程未运行"
            rm -f "$PID_FILE"
        fi
    else
        echo "状态: 🔴 未运行"
    fi
}

# 主逻辑
case "${1:-start}" in
    start)
        if [ -f "$PID_FILE" ]; then
            echo_log "⚠️  工作进程已在运行"
            show_status
            exit 1
        fi
        start_work
        ;;
    stop)
        stop_work
        ;;
    status)
        show_status
        ;;
    report)
        generate_report
        ;;
    *)
        echo "用法: $0 [start|stop|status|report]"
        exit 1
        ;;
esac
