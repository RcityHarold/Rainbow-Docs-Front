# Rainbow Docs Frontend

> 🌈 基于 React + TypeScript + Ant Design 的现代化文档管理系统前端

## 📋 项目简介

Rainbow Docs Frontend 是一个功能完善的文档管理系统前端，采用现代化的技术栈构建，提供直观易用的用户界面和丰富的文档编辑功能。

### 核心特性

- 🚀 **现代化技术栈**: React 18 + TypeScript + Vite + Ant Design
- 📝 **富文本编辑**: 集成 Markdown 编辑器，支持实时预览
- 🏗️ **组件化架构**: 模块化设计，易于维护和扩展
- 🎨 **精美UI设计**: 基于 Ant Design 和 Tailwind CSS
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🔐 **安全认证**: JWT 认证 + 权限管理
- ⚡ **高性能**: Vite 构建工具，开发体验极佳
- 🌙 **主题支持**: 支持亮色/暗色主题切换

## 🛠️ 技术栈

### 核心框架
- **React 18**: 前端框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 构建工具和开发服务器

### UI 框架
- **Ant Design**: 企业级 UI 组件库
- **Tailwind CSS**: 实用优先的 CSS 框架
- **@ant-design/icons**: 图标库

### 状态管理
- **Zustand**: 轻量级状态管理库

### 路由
- **React Router**: 客户端路由

### 编辑器
- **@uiw/react-md-editor**: Markdown 编辑器

### 网络请求
- **Axios**: HTTP 客户端

### 工具库
- **dayjs**: 日期时间处理
- **classnames**: CSS 类名工具

## 📁 项目结构

```
Rainbow-Docs-Front/
├── public/                     # 静态资源
├── src/
│   ├── components/             # 组件目录
│   │   ├── layout/            # 布局组件
│   │   ├── ui/                # 基础UI组件
│   │   ├── editor/            # 编辑器组件
│   │   ├── docs/              # 文档相关组件
│   │   └── common/            # 通用组件
│   ├── pages/                 # 页面组件
│   │   ├── auth/              # 认证页面
│   │   ├── document/          # 文档页面
│   │   ├── space/             # 空间页面
│   │   └── profile/           # 个人资料页面
│   ├── stores/                # 状态管理
│   │   ├── authStore.ts       # 认证状态
│   │   └── docStore.ts        # 文档状态
│   ├── services/              # API服务
│   │   ├── api.ts             # API基础配置
│   │   ├── authService.ts     # 认证服务
│   │   └── documentService.ts # 文档服务
│   ├── types/                 # TypeScript类型定义
│   ├── utils/                 # 工具函数
│   ├── hooks/                 # 自定义Hooks
│   └── assets/                # 静态资源
├── package.json               # 项目配置
├── vite.config.ts            # Vite配置
├── tailwind.config.js        # Tailwind配置
├── tsconfig.json             # TypeScript配置
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

## 🎯 运行模式说明

Rainbow Docs Frontend 支持与后端的智能集成，可以自动检测系统安装状态并显示相应界面。

### 🔄 安装状态检测机制

前端通过 API 请求自动检测系统状态：

```javascript
// 自动检测安装状态
const response = await fetch('/api/install/status')
const data = await response.json()

if (!data.data.is_installed) {
  // 🔧 显示安装向导界面 (InstallWizard)
  return <InstallWizard />
} else {
  // 📚 显示正常文档管理界面
  return <NormalApp />
}
```

### 📋 前后端协作说明

#### API 请求路由
- **前端访问**: `/api/install/status`
- **代理转发**: `http://localhost:3000/api/install/status`
- **后端检查**: `.rainbow_docs_installed` 文件状态

#### Vite 代理配置
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // 后端地址
      changeOrigin: true,
    },
  },
}
```

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

#### 方式一：配合后端安装向导测试
```bash
# 1. 启动后端（安装模式）
cd ../Rainbow-Docs
cargo run --features installer

# 2. 启动前端（新终端）
npm run dev

# 3. 浏览器访问 http://localhost:5173
# 4. 前端自动检测并显示安装向导
```

#### 方式二：独立前端开发
```bash
# 启动开发服务器
npm run dev

# 或使用 yarn
yarn dev
```

访问 http://localhost:5173 查看应用

**注意**: Vite 默认端口是 5173，如果需要修改可在 `vite.config.ts` 中配置。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 🛠️ 构建脚本使用

项目提供了便捷的构建脚本：

```bash
# 构建安装版本前端
./build.sh installer

# 构建生产版本前端
./build.sh production

# 启动开发服务器
./build.sh dev
```

## ⚙️ 配置说明

### 环境变量

创建 `.env.local` 文件配置环境变量：

```env
# API 基础路径
VITE_API_BASE_URL=http://localhost:8080/api

# 应用标题
VITE_APP_TITLE=Rainbow Docs

# 是否启用开发工具
VITE_DEV_TOOLS=true
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

## 📖 主要功能模块

### 0. 🎯 安装向导系统
- ✅ **智能检测**: 自动检测系统安装状态
- ✅ **Web界面安装**: 类似 WordPress/Discuz 的安装体验
- ✅ **步骤式引导**: 5步完整安装流程
- ✅ **条件渲染**: 根据安装状态动态显示界面
- ✅ **配置验证**: 实时验证用户输入
- ✅ **错误处理**: 友好的错误提示和处理

#### 安装向导流程
1. **🔍 环境检查** - 检查系统环境和依赖
2. **🗄️ 数据库配置** - 配置 SurrealDB 连接
3. **👤 管理员账户** - 创建系统管理员账户  
4. **⚙️ 站点配置** - 配置站点基本信息
5. **✅ 完成安装** - 保存配置并初始化系统

#### 界面特性
- **响应式设计**: 适配桌面和移动端
- **进度指示器**: 清晰的步骤进度显示
- **表单验证**: 实时输入验证和错误提示
- **自动填充**: 智能的默认值和生成功能
- **一键重试**: 安装失败后的重试机制

### 1. 用户认证
- ✅ 登录/注册
- ✅ JWT 令牌管理
- ✅ 权限控制
- ✅ 用户信息管理

### 2. 文档管理
- ✅ 文档创建/编辑
- ✅ Markdown 编辑器
- ✅ 文档树形结构
- ✅ 版本历史
- ✅ 文档搜索

### 3. 空间管理
- ✅ 空间创建/管理
- ✅ 成员权限控制
- ✅ 空间设置

### 4. 协作功能
- ✅ 评论系统
- ✅ 文档分享
- ✅ 实时协作（开发中）

### 5. 文件管理
- ✅ 文件上传
- ✅ 图片预览
- ✅ 文件管理

## 🎨 UI 设计规范

### 设计原则
- **简洁直观**: 界面简洁，操作直观
- **一致性**: 保持设计语言的一致性
- **可访问性**: 支持键盘导航和屏幕阅读器
- **响应式**: 适配不同屏幕尺寸

### 颜色规范
```css
/* 主色调 */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* 灰色调 */
--gray-50: #f9fafb;
--gray-500: #6b7280;
--gray-900: #111827;
```

### 字体规范
- **主字体**: Inter (系统字体回退)
- **等宽字体**: JetBrains Mono (代码显示)

## 🔧 开发指南

### 组件开发规范

```typescript
// 组件模板
import React from 'react'
import type { ComponentProps } from './types'

interface MyComponentProps extends ComponentProps {
  title: string
  onAction?: () => void
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction,
  ...props 
}) => {
  return (
    <div {...props}>
      <h1>{title}</h1>
      {onAction && (
        <button onClick={onAction}>
          执行操作
        </button>
      )}
    </div>
  )
}

export default MyComponent
```

### 状态管理最佳实践

```typescript
// 使用 Zustand
import { create } from 'zustand'

interface Store {
  count: number
  increment: () => void
  decrement: () => void
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

### API 调用规范

```typescript
// 服务层
export const documentService = {
  getDocument: (id: string): Promise<ApiResponse<Document>> =>
    request.get(`/documents/${id}`),
    
  createDocument: (data: CreateDocumentRequest): Promise<ApiResponse<Document>> =>
    request.post('/documents', data),
}

// 组件中使用
const MyComponent = () => {
  const [loading, setLoading] = useState(false)
  
  const handleCreate = async (data: CreateDocumentRequest) => {
    setLoading(true)
    try {
      await documentService.createDocument(data)
      message.success('创建成功')
    } catch (error) {
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }
}
```

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 📦 部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 待办事项

- [ ] 完善文档编辑器功能
- [ ] 实现实时协作
- [ ] 添加暗色主题
- [ ] 优化移动端体验
- [ ] 增加单元测试覆盖率
- [ ] 添加国际化支持
- [ ] 性能优化

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 进行代码格式化
- 提交信息遵循 Conventional Commits 规范
- 所有组件必须有 TypeScript 类型定义
- 新功能需要添加对应的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [Vite](https://vitejs.dev/) - 前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

## 📞 联系我们

- 项目地址: [GitHub Repository](https://github.com/your-username/rainbow-docs-front)
- 问题反馈: [Issues](https://github.com/your-username/rainbow-docs-front/issues)
- 邮箱: support@rainbow-docs.com

---

**Rainbow Docs Frontend** - 让文档管理变得简单而优雅 ✨