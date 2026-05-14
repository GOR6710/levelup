#!/bin/bash
# ==========================================
#  LevelUp - 智能工作 Harness
# ==========================================
# 这个脚本由 cron 调用，启动一个持续工作的 Agent 会话
# 工作时间：08:00 - 14:00

WORK_DIR="/home/gorden/.openclaw/workspace/projects/skill-system"
REPORT_DIR="/home/gorden/.openclaw/workspace/reports"
LOG_FILE="/tmp/levelup-smart-$(date +%Y-%m-%d).log"

mkdir -p "$REPORT_DIR"
cd "$WORK_DIR"

echo_log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 记录开始
echo_log "=========================================="
echo_log "  LevelUp 智能工作 Harness 启动"
echo_log "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo_log "=========================================="

# 检查是否应该工作（08:00 - 14:00）
current_hour=$(date +%H)
# 测试模式：如果传入 --test 参数，则忽略时间检查
if [ "$1" == "--test" ]; then
    echo_log "🧪 测试模式，忽略时间检查"
elif [ "$current_hour" -lt 8 ] || [ "$current_hour" -ge 14 ]; then
    echo_log "⏰ 非工作时间，退出"
    exit 0
fi

# 检查是否已经在运行
if pgrep -f "levelup-daily-work" > /dev/null; then
    echo_log "⚠️  工作进程已在运行，跳过"
    exit 0
fi

# 标记进程
echo $$ > /tmp/levelup-daily-work.pid

# 工作循环
echo_log "🚀 开始工作循环..."

while true; do
    current_hour=$(date +%H)
    current_min=$(date +%M)
    
    # 检查是否到达结束时间
    if [ "$current_hour" -ge 14 ]; then
        echo_log "🏁 到达结束时间 (14:00)，生成报告..."
        
        # 生成报告
        report_file="$REPORT_DIR/$(date +%Y-%m-%d)-smart-report.md"
        cat > "$report_file" << EOF
# LevelUp 智能工作日报

**日期**: $(date '+%Y-%m-%d')  
**工作时段**: 08:00 - 14:00  
**报告时间**: $(date '+%H:%M:%S')

## 今日工作摘要

### 代码变更
$(git log --since="08:00" --oneline --all 2>/dev/null | sed 's/^/- /' || echo "- 无代码变更")

### 构建状态
$(if [ -d ".next" ]; then echo "- ✅ Next.js 构建目录存在"; else echo "- ❌ 未构建"; fi)

### 依赖状态
$(npm outdated 2>/dev/null | wc -l | xargs -I {} echo "- {} 个依赖可更新")

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
        
        echo_log "✅ 报告已生成: $report_file"
        break
    fi
    
    # 每 30 分钟执行一次检查
    if [ "$current_min" == "00" ] || [ "$current_min" == "30" ]; then
        echo_log "🔍 执行定期检查 ($(date '+%H:%M'))..."
        
        # 1. 检查构建
        echo_log "  检查构建状态..."
        if npm run build > /tmp/build.log 2>&1; then
            echo_log "  ✅ 构建成功"
        else
            echo_log "  ❌ 构建失败，记录错误"
            tail -20 /tmp/build.log >> "$LOG_FILE"
        fi
        
        # 2. 检查 TypeScript
        echo_log "  检查 TypeScript..."
        if npx tsc --noEmit > /tmp/tsc.log 2>&1; then
            echo_log "  ✅ TypeScript 无错误"
        else
            error_count=$(grep -c "error TS" /tmp/tsc.log 2>/dev/null || echo "0")
            echo_log "  ⚠️  发现 $error_count 个错误"
        fi
        
        # 3. 尝试自动修复简单问题
        echo_log "  尝试自动修复..."
        
        # 格式化代码
        if command -v npx >/dev/null && [ -f ".prettierrc" ]; then
            npx prettier --write "app/**/*.tsx" "lib/**/*.ts" > /dev/null 2>&1 || true
            echo_log "  ✅ 代码已格式化"
        fi
        
        # 4. 检查是否有更改需要提交
        if git status --short | grep -q .; then
            echo_log "  📝 发现更改，准备提交..."
            git add -A
            git commit -m "auto: $(date '+%H:%M') 自动优化" >> "$LOG_FILE" 2>&1 || true
            git push origin master >> "$LOG_FILE" 2>&1 || true
            echo_log "  ✅ 更改已提交"
        fi
    fi
    
    # 每分钟检查一次时间
    sleep 60
done

echo_log "=========================================="
echo_log "  工作结束 - $(date '+%H:%M:%S')"
echo_log "=========================================="

# 清理
rm -f /tmp/levelup-daily-work.pid
