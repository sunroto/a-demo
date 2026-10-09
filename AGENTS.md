# AGENTS.md

本文件是本仓库的开发指南，供 AI 编码助手与开发者参考。代码尚在实现中，以下内容描述目标架构与约定。

## 项目简介

默写应用：系统内置默写题目（原文），用户选择题目后凭记忆默写并提交，服务端将默写内容与原文做**字符级比对**，返回逐字高亮结果（正确 / 错字 / 漏字）并统计正确率，同时记录历史。

- 题目（原文）为**预置内容**，不面向用户录入；通过数据库种子数据（`server/data/seed.sql`）在启动时写入。
- API 层只提供题目的**只读**接口，不提供题目的增删改。
- 用户流程：选择题目 → 默写输入 → 提交 → 查看逐字比对高亮结果和正确率 → 查看历史记录。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 前端 `web/` | Vue 3 + TypeScript + Vite + Vue Router |
| 后端 `server/` | Node.js + Express + TypeScript + better-sqlite3 |
| 数据库 | SQLite，文件位于 `server/data/dictation.db`（不提交） |

不使用 Spring / Java。

## 目录结构

```
.
├── AGENTS.md
├── README.md
├── server/                  # 后端：Express + TS + better-sqlite3
│   ├── data/
│   │   ├── seed.sql         # 题目种子数据（提交到仓库）
│   │   └── dictation.db     # SQLite 数据库文件（运行时生成，git 忽略）
│   ├── src/
│   │   ├── index.ts         # 入口：启动 Express（端口 3000）
│   │   ├── db.ts            # 打开数据库、自动建表、执行种子数据
│   │   ├── routes/          # REST 路由（texts、attempts）
│   │   └── services/        # 业务逻辑，含判分（字符级 diff）模块
│   ├── package.json
│   └── tsconfig.json
└── web/                     # 前端：Vue 3 + TS + Vite
    ├── src/
    │   ├── api/             # 调用后端 /api 的封装
    │   ├── router/          # Vue Router 路由
    │   ├── views/           # 页面：题目列表、默写、结果、历史
    │   ├── components/      # 组件：如逐字高亮结果组件
    │   └── main.ts
    ├── vite.config.ts       # dev proxy：/api -> http://localhost:3000
    ├── package.json
    └── tsconfig.json
```

## 常用命令

后端（`server/`）：

```bash
cd server
npm install        # 安装依赖
npm run dev        # 开发模式启动（端口 3000，启动时自动建表并执行种子数据）
npm run build      # 编译 TypeScript
npm run lint       # 代码检查
npm test           # 运行测试
```

前端（`web/`）：

```bash
cd web
npm install        # 安装依赖
npm run dev        # 启动 Vite 开发服务器（/api 代理到 3000 端口）
npm run build      # 类型检查并构建生产包
npm run lint       # 代码检查
npm test           # 运行测试
```

## 架构约定

### 后端 REST API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/texts` | 题目列表。**只返回 id、title 等元信息，不返回原文 `content`**，防止默写时作弊查看。 |
| `POST` | `/api/attempts` | 提交默写。请求体 `{ text_id, input }`。服务端从库中读取原文，与 `input` 做字符级 diff，返回标记数组与正确率，并写入 `attempts` 表。 |
| `GET` | `/api/attempts?text_id=` | 历史记录，按 `text_id` 过滤，按时间倒序。 |

`POST /api/attempts` 响应示例：

```json
{
  "id": 12,
  "text_id": 1,
  "score": 0.92,
  "marks": [
    { "char": "床", "status": "correct" },
    { "char": "前", "status": "wrong", "input": "钱" },
    { "char": "明", "status": "missing" }
  ],
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

- `status` 取值：`correct`（正确）、`wrong`（错字）、`missing`（漏字）。
- `score` 为正确率，取值 0–1（正确字数 / 原文字数）。

### 约定要点

- 判分逻辑（字符级 diff 与正确率计算）放在独立的 service 模块（如 `server/src/services/scoring.ts`），路由层只负责参数校验与调用，便于单元测试。
- 原文只在服务端参与比对；任何接口都不应在默写前把原文返回给前端。
- 题目数据只通过种子数据维护，API 不提供题目写接口。
- 前端开发时通过 Vite dev proxy 将 `/api` 转发到 Express（`http://localhost:3000`），前端代码中统一使用相对路径 `/api/...`。

## 代码规范

- TypeScript 开启 `strict` 模式，避免 `any`。
- Vue 使用组合式 API + `<script setup lang="ts">`。
- 提交前运行 `npm run lint`（前后端分别执行），有测试的模块同时运行 `npm test`。
- 提交 `package-lock.json`；不要提交 `server/data/*.db*` 等数据库文件。

## 数据表说明

### `texts`（题目）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | INTEGER PRIMARY KEY | 主键 |
| `title` | TEXT NOT NULL | 题目标题 |
| `content` | TEXT NOT NULL | 原文（仅服务端使用） |
| `created_at` | TEXT | 创建时间 |

### `attempts`（默写记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | INTEGER PRIMARY KEY | 主键 |
| `text_id` | INTEGER NOT NULL | 关联 `texts.id` |
| `input` | TEXT NOT NULL | 用户默写内容 |
| `score` | REAL NOT NULL | 正确率（0–1） |
| `created_at` | TEXT | 提交时间 |

服务启动时自动执行 `CREATE TABLE IF NOT EXISTS` 建表，并执行 `server/data/seed.sql` 写入预置题目（种子脚本需幂等，如使用 `INSERT OR IGNORE`）。
