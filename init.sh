#!/bin/bash
# LevelUp Task Harness 初始化脚本
# 运行此脚本检查项目状态

echo "=========================================="
echo "🎮 LevelUp Task Harness 初始化"
echo "=========================================="
echo ""

# 检查文件
echo "📁 检查 Harness 文件..."
if [ -f "task.json" ]; then
    echo "  ✅ task.json 存在"
else
    echo "  ❌ task.json 缺失"
fi

if [ -f "feature_list.json" ]; then
    echo "  ✅ feature_list.json 存在"
else
    echo "  ❌ feature_list.json 缺失"
fi

if [ -f "progress.txt" ]; then
    echo "  ✅ progress.txt 存在"
else
    echo "  ❌ progress.txt 缺失"
fi

echo ""
echo "📊 项目状态:"
echo "------------------------------------------"

# 统计功能完成情况
if [ -f "feature_list.json" ]; then
    TOTAL=$(grep -c '"id":' feature_list.json)
    COMPLETED=$(grep -c '"passes": true' feature_list.json)
    PENDING=$((TOTAL - COMPLETED))
    
    echo "  总功能数: $TOTAL"
    echo "  已完成: $COMPLETED"
    echo "  待完成: $PENDING"
    echo "  完成率: $((COMPLETED * 100 / TOTAL))%"
fi

echo ""
echo "📝 最近进度:"
echo "------------------------------------------"
if [ -f "progress.txt" ]; then
    tail -10 progress.txt
fi

echo ""
echo "🎯 下一步建议:"
echo "------------------------------------------"
if [ -f "feature_list.json" ]; then
    # 找到第一个未完成的 high priority 功能
    NEXT_FEATURE=$(grep -B 5 '"passes": false' feature_list.json | grep -E '"id"|"name"' | head -2 | tr '\n' ' ')
    if [ -n "$NEXT_FEATURE" ]; then
        echo "  建议开发: $NEXT_FEATURE"
    else
        echo "  🎉 所有功能已完成！"
    fi
fi

echo ""
echo "=========================================="
echo "使用方法:"
echo "  1. 读取 feature_list.json 找到下一个功能"
echo "  2. 开发该功能"
echo "  3. 更新 feature_list.json 的 passes 字段"
echo "  4. git commit"
echo "  5. 更新 progress.txt"
echo "=========================================="
