# Minimal Fullstack Seed 🌱

> 一个极简但功能完整的全栈种子项目，展示了现代 Web 开发的两种核心数据同步模式。

---

## 📚 为什么叫 "Minimal Fullstack Seed"?

这个项目 intentionally 保持**极小**（Minimal）的代码量，但同时包含了一个全栈应用所需的**完整闭环**：

- ✅ **前端界面** - React + TypeScript + TailwindCSS
- ✅ **后端 API** - Next.js App Router
- ✅ **数据库** - Supabase PostgreSQL
- ✅ **实时同步** - WebSocket / 传统 HTTP
- ✅ **AI 集成** - 大模型 API 调用

它的意义在于：**用不到 1000 行代码，展示全栈开发的核心模式**。

---

## 🎓 核心教学价值：两种数据同步模式

本项目最独特的设计是**同时实现了两种与后端同步数据的方式**，便于对比学习：

### 1️⃣ 拉模型（Pull/Polling）- 传统 HTTP 请求
```typescript
// 方式一：页面加载时一次性获取
useEffect(() => {
  fetchThoughts()  // GET /api/thoughts
}, [])

// 提交后，手动更新本地状态
setThoughts(prev => [newThought, ...prev])
```
**特点**: 简单直观，但无法实现多端实时同步

### 2️⃣ 推模型（Push/Realtime）- WebSocket 订阅
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
**特点**: 真正的实时同步，但增加了连接管理的复杂度

### 📊 两种模式对比

| 维度 | 拉模型 (HTTP) | 推模型 (WebSocket) |
|------|---------------|-------------------|
| **连接方式** | 短连接，用完即断 | 长连接，持续保持 |
| **数据更新** | 需手动刷新 | 自动实时推送 |
| **多端同步** | ❌ 无法实现 | ✅ 所有客户端同步 |
| **资源消耗** | 低 | 较高（需维护连接）|
| **代码复杂度** | 简单 | 需处理订阅/取消订阅 |
| **适用场景** | 低频更新、简单应用 | 协作工具、实时应用 |

> 💡 **教学提示**: 本项目默认使用推模型，但代码中保留了拉模型的注释实现，方便对比学习。

---

## ✨ 功能特性

### 已实现的核心功能

- 🔐 **用户认证** - 基于 Supabase Auth 的邮箱 + 密码注册/登录
- 💭 **记录想法** - 简洁优雅的输入体验
- 🔑 **用户自定义 API Key** - 每个用户使用自己的 Kimi API Key（存储在本地）
- 🤖 **AI 鼓励生成** - 基于 Kimi 大模型的个性化鼓励语
- ⚡ **实时同步** - 多端实时更新，无需刷新
- 🗑️ **数据管理** - 支持删除历史记录
- 💎 **现代 UI** - 玻璃态设计 + 流畅动画

### 技术亮点

| 技术 | 用途 | 学习价值 |
|------|------|----------|
| Next.js App Router | 全栈框架 | 前后端同构开发 |
| Supabase Auth | 用户认证 | 现代身份验证系统 |
| Supabase Realtime | 数据库 + 实时订阅 | 现代 BaaS 服务使用 |
| WebSocket | 实时数据同步 | 实时应用架构 |
| localStorage | 本地状态持久化 | 客户端存储策略 |
| AI API 集成 | 大模型调用 | AIGC 应用开发 |

---

## 🚀 快速开始

### 1. 使用此模板创建你的项目

```bash
# 克隆项目
git clone <your-repo-url> my-app
cd my-app

# 安装依赖
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写你的配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 备用 Kimi API Key（可选）
MOONSHOT_API_KEY="sk-your-moonshot-api-key"
```

> 💡 **获取 Supabase 凭证**：Supabase Dashboard → Project Settings → API

### 3. 启用 Supabase Auth

1. 进入 Supabase Dashboard → **Authentication** → **Providers**
2. 确保 **Email**  provider 已启用
3. 开发阶段建议关闭 **Confirm email**（用户可立即登录）

### 4. 初始化数据库

在 Supabase SQL Editor 中执行：

```sql
-- 想法表
CREATE TABLE thoughts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  encouragement text NOT NULL
);

-- 允许匿名访问（如需用户隔离，请参考进阶配置）
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON thoughts
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 启用实时推送
ALTER PUBLICATION supabase_realtime ADD TABLE thoughts;
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问：
- 🏠 **首页**: http://localhost:3000
- 🔐 **登录**: http://localhost:3000/login
- 📝 **注册**: http://localhost:3000/signup

---

## 🌱 基于此 Seed 可扩展更多功能

这是一个 intentionally minimal 的**种子项目**，你可以在此基础上添加：

### 🔐 用户系统（已部分实现）
- [x] ✅ 添加 Supabase Auth 用户认证
- [ ] 实现用户隔离（只看自己的记录）
- [ ] 添加用户资料页面
- [ ] 添加删除账号功能

### 🎨 功能增强
- [ ] 编辑已发布的想法
- [ ] 点赞/收藏鼓励语
- [ ] 图片上传支持
- [ ] 分享功能（生成卡片图）

### 🔄 更多实时场景
- [ ] 正在输入提示（Typing Indicator）
- [ ] 在线用户列表
- [ ] 协作编辑功能

### 📊 数据可视化
- [ ] 情绪分析图表
- [ ] 鼓励语词云
- [ ] 时间轴展示

### 🌍 部署与运维
- [ ] Docker 容器化
- [ ] 测试用例（Jest + React Testing Library）
- [ ] CI/CD 流水线
- [ ] 性能监控

---

## 📁 项目结构

```
minimal-fullstack-seed/
├── app/
│   ├── (auth)/                # 认证路由组
│   │   ├── layout.tsx         # 认证页面布局
│   │   ├── login/             # 登录页 (/login)
│   │   │   └── page.tsx
│   │   └── signup/            # 注册页 (/signup)
│   │       └── page.tsx
│   ├── api/thoughts/          # API 路由（RESTful 设计）
│   │   └── route.ts           # GET / POST / DELETE
│   ├── globals.css            # 全局样式 + Tailwind
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 首页（包含两种同步模式）
├── components/
│   ├── ThoughtInput.tsx       # 输入组件
│   ├── ThoughtCard.tsx        # 卡片组件（含删除）
│   ├── EncouragementModal.tsx # 弹窗组件
│   └── ApiKeyInput.tsx        # API Key 配置组件
├── lib/
│   ├── supabase.ts            # 客户端 Supabase 实例
│   └── supabase-server.ts     # 服务端 Supabase 实例
├── .env.example               # 环境变量模板
├── .env.local                 # 本地环境变量（需创建）
├── next.config.ts             # Next.js 配置
└── README.md                  # 本文件
```

**总代码量**: ~1000 行，每个文件都清晰易懂。

---

## 🔌 核心实现解析

### 数据流架构

```
┌─────────────┐     POST /api/thoughts      ┌─────────────┐
│   用户输入   │ ───────────────────────────> │  Next.js    │
│  + API Key   │                             │   API 路由   │
└─────────────┘                             └──────┬──────┘
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          │                        │                        │
                          ▼                        ▼                        ▼
                   ┌─────────────┐        ┌─────────────┐          ┌─────────────┐
                   │   Kimi AI   │        │  Supabase   │          │  WebSocket  │
                   │  生成鼓励语  │        │   数据库    │          │  Realtime   │
                   └──────┬──────┘        └──────┬──────┘          └──────┬──────┘
                          │                        │                        │
                          └────────────────────────┼────────────────────────┘
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          │                        │                        │
                          ▼                        ▼                        ▼
                    [用户设备 A]              [用户设备 B]              [用户设备 C]
                   （实时推送更新）            （实时推送更新）           （实时推送更新）
```

### API Key 安全策略

```
用户输入 API Key
      │
      ▼
┌─────────────────┐
│  localStorage   │  ← 仅存储在浏览器本地
│   (客户端)      │
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
│    (第三方)     │
└─────────────────┘
```

---

## 📝 环境变量

| 变量名 | 必填 | 用途 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `MOONSHOT_API_KEY` | ❌ | 备用 Kimi API Key（可选）|

---

## 🚢 部署

### Vercel（推荐）

1. Fork 本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量
4. 一键部署

> ⚠️ **注意**: 部署前确保在 Supabase 中允许 Vercel 域名访问（Settings → API → Website URL）。

---

## 🎓 学习路径建议

如果你是全栈初学者，建议按以下顺序阅读代码：

1. **`app/page.tsx`** - 理解组件结构和状态管理
2. **`components/ThoughtInput.tsx`** - 学习表单处理
3. **`app/api/thoughts/route.ts`** - 了解 API 路由和 AI 集成
4. **`lib/supabase.ts`** - 理解 Supabase 客户端配置
5. **对比 `page.tsx` 中的两种同步模式** - 深入理解实时应用架构

---

**建议**: 如果你基于此 Seed 构建了更有趣的项目，欢迎分享你的扩展！

---

Made with 💛 as a teaching resource.
