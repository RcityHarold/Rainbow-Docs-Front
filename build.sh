#!/bin/bash

# Rainbow-Docs 前端构建脚本

set -e

BUILD_TYPE="${1:-production}"

echo "🚀 开始构建 Rainbow-Docs 前端 ($BUILD_TYPE 版本)..."

# 检查 Node.js 环境
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

case "$BUILD_TYPE" in
    "installer")
        echo "📦 构建安装版本前端..."
        # 如果需要特殊的安装版本构建，可以在这里添加特殊逻辑
        # 例如设置环境变量或使用不同的配置文件
        VITE_BUILD_TYPE=installer npm run build
        echo "✅ 安装版本前端构建完成"
        echo "📁 构建文件位置: dist/"
        ;;
    "production")
        echo "📦 构建生产版本前端..."
        npm run build
        echo "✅ 生产版本前端构建完成"
        echo "📁 构建文件位置: dist/"
        ;;
    "dev")
        echo "🔧 启动开发服务器..."
        npm run dev
        ;;
    *)
        echo "❌ 未知的构建类型: $BUILD_TYPE"
        echo "可用选项: installer, production, dev"
        exit 1
        ;;
esac

if [ "$BUILD_TYPE" != "dev" ]; then
    echo ""
    echo "🎉 前端构建完成!"
    echo "💡 静态文件已生成到 dist/ 目录"
    echo "   可以部署到任何静态文件服务器或集成到后端项目中"
fi