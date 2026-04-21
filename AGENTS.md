# 需求管理系统 (Requirement Management System)

## 项目概览

基于 Next.js 16 + React 19 + shadcn/ui 的研发需求管理系统。

## 技术栈

- **框架**: Next.js 16.2.0 (App Router)
- **UI库**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS 4
- **语言**: TypeScript 5
- **包管理**: pnpm

## 开发命令

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动开发服务器 (端口 5000)
pnpm build      # 生产构建
pnpm lint       # 代码检查
```

## 目录结构

```
app/
├── page.tsx                    # 首页 (重定向到 /login)
├── login/page.tsx              # 登录页面
├── workspace/page.tsx          # 工作台
├── requirements/               # 需求管理
├── projects/                   # 项目管理
├── tasks/page.tsx             # 任务管理
components/
├── admin-layout.tsx           # 后台管理布局
├── requirements-table.tsx     # 需求表格组件
├── requirement-form-dialog.tsx # 需求表单对话框
lib/
├── mock-data.ts               # 模拟数据
├── types.ts                  # 类型定义
└── utils.ts                   # 工具函数
```

## 登录页面功能

- 邮箱/密码登录
- 密码显示/隐藏切换
- 记住我选项
- 忘记密码链接
- 登录验证
- 测试账号: `admin@example.com` / `admin123`

## 注意事项

- Next.js 使用 Turbopack 构建，开发时无需额外配置
- 所有使用 `useSearchParams` 的组件已包装在 Suspense boundary 中
- 登录后自动跳转到 `/workspace`
