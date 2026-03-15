# AGENTS.md - EncourageMe Project Guide

> This file contains essential information for AI coding agents working on this project.
> 本文件包含供 AI 编程助手使用的项目关键信息。

---

## Project Overview / 项目概述

**EncourageMe** (`minimal-fullstack-seed`) 是一个极简但功能完整的全栈种子项目，用于展示现代 Web 开发的两种核心数据同步模式（Pull vs Push）。

**核心功能：**
- 用户输入想法，AI（Kimi）生成温暖的鼓励语
- 实时多端同步（WebSocket）
- 想法的增删查操作
- 用户自定义 API Key（存储在本地）

**总代码量：** 约 800 行 TypeScript

---

## Technology Stack / 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | 全栈框架（App Router） |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.x | 类型系统 |
| Tailwind CSS | 4.x | 样式框架 |
| Supabase | 2.98.0 | 数据库 + 实时订阅 |
| OpenAI SDK | 6.27.0 | 调用 Kimi API |

---

## Project Structure / 项目结构

```
encourage-me-v0/
├── app/
│   ├── api/thoughts/route.ts    # API 路由：GET / POST / DELETE
│   ├── globals.css              # 全局样式 + Tailwind 导入
│   ├── layout.tsx               # 根布局（Geist 字体）
│   └── page.tsx                 # 主页面（核心逻辑）
├── components/
│   ├── ThoughtInput.tsx         # 想法输入表单
│   ├── ThoughtCard.tsx          # 想法卡片展示（含删除）
│   ├── EncouragementModal.tsx   # 鼓励语弹窗
│   └── ApiKeyInput.tsx          # API Key 设置组件
├── lib/
│   ├── supabase.ts              # 客户端 Supabase 实例
│   └── supabase-server.ts       # 服务端 Supabase 实例
├── .env.example                 # 环境变量模板
├── next.config.ts               # Next.js 配置（standalone 输出）
├── tsconfig.json                # TypeScript 配置
├── postcss.config.mjs           # PostCSS 配置（Tailwind v4）
└── eslint.config.mjs            # ESLint 配置
```

---

## Build & Development Commands / 构建与开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

**开发服务器地址：** http://localhost:3000

---

## Environment Variables / 环境变量

创建 `.env.local` 文件：

```bash
# 必需：Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 可选：备用 Kimi API Key
MOONSHOT_API_KEY=sk-your-moonshot-api-key
```

**重要：** 以 `NEXT_PUBLIC_` 开头的变量会在构建时嵌入到客户端代码中。

---

## Database Setup / 数据库初始化

在 Supabase SQL Editor 中执行：

```sql
CREATE TABLE thoughts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  encouragement text NOT NULL
);

-- 允许匿名访问（教学用途）
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON thoughts
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- 启用实时推送
ALTER PUBLICATION supabase_realtime ADD TABLE thoughts;
```

---

## Architecture Patterns / 架构模式

### 1. 双数据同步模式（教学核心）

项目同时实现了两种数据同步方式，便于对比学习：

**拉模型（Pull/Polling）- HTTP 请求：**
```typescript
// 方式一：页面加载时一次性获取
useEffect(() => {
  fetchThoughts()  // GET /api/thoughts
}, [])

// 提交后，手动更新本地状态
setThoughts(prev => [newThought, ...prev])
```

**推模型（Push/Realtime）- WebSocket：**
```typescript
// 方式二：建立 WebSocket 长连接
const channel = supabase
  .channel('thoughts-channel')
  .on('postgres_changes', { event: 'INSERT', table: 'thoughts' }, 
    (payload) => {
      // 任何设备插入数据，自动推送到所有客户端
      setThoughts(prev => [payload.new, ...prev])
    }
  )
  .subscribe()
```

**当前默认使用推模型**，但代码中保留了拉模型的注释实现。

### 2. 双 Supabase 客户端模式

- **`lib/supabase.ts`** - 浏览器端使用，无环境变量检查
- **`lib/supabase-server.ts`** - 服务端使用（API 路由），有环境变量检查

### 3. API Key 安全策略

```
用户输入 API Key
      │
      ▼
┌─────────────────┐
│  localStorage   │  ← 仅存储在浏览器本地
│   (客户端)       │
└────────┬────────┘
         │ POST 请求 (HTTPS 加密)
         ▼
┌─────────────────┐
│   API 路由      │  ← Next.js Server Side
│   (服务端)      │
└────────┬────────┘
         │ 调用 Kimi API
         ▼
┌─────────────────┐
│   Moonshot      │  ← AI 服务提供商
└─────────────────┘
```

---

## Code Style Guidelines / 代码风格指南

### 文件约定
- 所有组件文件使用 `'use client'` 指令（当前项目无 SSR 需求）
- TypeScript 严格模式已启用
- 使用路径别名 `@/*` 导入模块

### 命名规范
- 组件：PascalCase（如 `ThoughtCard.tsx`）
- 工具函数：camelCase
- 类型/接口：PascalCase

### 样式约定
- 使用 Tailwind CSS 工具类
- 保持温暖明亮的主题（粉色、紫色、琥珀色渐变）
- 玻璃态设计（glassmorphism）：`bg-white/70 backdrop-blur-md`
- 禁用暗色模式（`globals.css` 中覆盖）

### 注释规范
- 所有注释使用中文
- 关键逻辑添加日志：`console.log('[标签] 描述')`

---

## Key Implementation Details / 关键实现细节

### API 路由 (`app/api/thoughts/route.ts`)

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/thoughts` | 获取所有想法（按时间倒序） |
| POST | `/api/thoughts` | 创建想法 + 调用 Kimi 生成鼓励语 |
| DELETE | `/api/thoughts?id={id}` | 删除指定想法 |

### AI 提示词

系统提示词（`app/api/thoughts/route.ts` 第 64 行）：
```
你是一位温暖、善解人意的鼓励者。根据用户的想法，用中文给出一句简短、温暖、有力量的鼓励语（50字以内）。风格要温馨治愈。只返回鼓励语本身，不要有多余解释。
```

### 时间格式化 (`components/ThoughtCard.tsx`)

- 小于 1 分钟："刚刚"
- 小于 60 分钟：`{n}分钟前`
- 小于 24 小时：`{n}小时前`
- 小于 7 天：`{n}天前`
- 否则：日期格式（如 "2024/3/15"）

---

## Testing Strategy / 测试策略

**当前状态：** 本项目暂无自动化测试。

**手动测试清单：**
1. 输入想法，点击 "Encourage Me" 按钮
2. 验证弹窗显示 AI 生成的鼓励语
3. 验证想法卡片出现在列表中
4. 打开另一浏览器窗口，验证实时同步
5. 点击删除按钮，验证删除功能

**建议添加的测试：**
- API 路由单元测试（使用 `jest` + `node-mocks-http`）
- 组件测试（使用 `@testing-library/react`）

---

## Deployment / 部署

### Vercel（推荐）

1. Fork 项目到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 一键部署

**注意：** 部署前确保在 Supabase 中允许 Vercel 域名访问（Settings → API → Website URL）。

### Docker 部署

项目配置了 `output: 'standalone'`，适合 Docker 部署：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Common Issues / 常见问题

### 1. 实时同步不工作
- 检查 Supabase Realtime 是否启用：`ALTER PUBLICATION supabase_realtime ADD TABLE thoughts;`
- 检查浏览器控制台 WebSocket 连接状态

### 2. Kimi API 调用失败
- 确认 API Key 有效
- 检查是否设置了 `MOONSHOT_API_KEY` 或用户是否提供了自己的 Key

### 3. 构建失败
- 确保环境变量已设置（特别是 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）

---

## Extension Ideas / 扩展建议

基于此种子项目可扩展的功能：

- [ ] 用户认证（Supabase Auth）
- [ ] 用户隔离（只看自己的记录）
- [ ] 编辑已发布的想法
- [ ] 点赞/收藏功能
- [ ] 图片上传支持
- [ ] 情绪分析图表
- [ ] 在线用户列表
- [ ] 协作编辑功能

---

## File Line Counts / 文件代码行数

```
app/page.tsx              203
app/api/thoughts/route.ts 149
components/ThoughtCard.tsx 124
components/ApiKeyInput.tsx 105
components/EncouragementModal.tsx 95
components/ThoughtInput.tsx 80
app/layout.tsx             34
app/globals.css            61
lib/supabase-server.ts     18
lib/supabase.ts             8
```

---

*Last updated: 2026-03-15*
