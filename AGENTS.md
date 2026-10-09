# AGENTS.md

本文件是本仓库的开发指南，供 AI 编码助手与开发者参考。代码尚在实现中，以下内容描述目标架构与约定；「实现状态」一节列出当前已实现的部分。

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

### 版本锁定

Node.js **≥ 22**（根目录 `.nvmrc` 为 `22`，`server/` 与 `web/` 的 `package.json` 中 `engines.node` 为 `>=22`）。

`web/`：

| 包 | 版本 |
| --- | --- |
| `vue` | `^3.5.0` |
| `vue-router` | `^4.5.0` |
| `vite` | `^7.0.0` |
| `@vitejs/plugin-vue` | `^6.0.0` |
| `typescript` | `~5.9.0` |
| `vue-tsc` | `^3.0.0` |

`server/`：

| 包 | 版本 |
| --- | --- |
| `express` | `^5.0.0` |
| `better-sqlite3` | `^12.0.0` |
| `tsx` | `^4.19.0` |
| `typescript` | `~5.9.0` |
| `@types/express` | `^5.0.0` |
| `@types/node` | `^22.0.0` |
| `@types/better-sqlite3` | `^9.6.0` |

升级上述依赖的主版本前需同步更新本表与 README。

## 目录结构

```
.
├── .nvmrc                   # Node.js 版本（22）
├── AGENTS.md
├── README.md
├── server/                  # 后端：Express + TS + better-sqlite3
│   ├── data/
│   │   ├── seed.sql         # 题目种子数据（每次启动幂等执行，提交到仓库）
│   │   ├── seed-attempts.sql  # 示例默写记录（仅首次初始化数据库时执行）
│   │   └── dictation.db     # SQLite 数据库文件（运行时生成，git 忽略）
│   ├── src/
│   │   ├── index.ts         # 入口：打开数据库并启动 Express（端口 3000）
│   │   ├── app.ts           # 创建 Express 应用、挂载路由与错误处理
│   │   ├── db.ts            # 打开数据库、自动建表、执行种子数据
│   │   ├── routes/          # REST 路由（attempts；后续 texts）
│   │   └── services/        # 业务逻辑，含判分（字符级 diff）模块（待实现）
│   ├── package.json
│   └── tsconfig.json
└── web/                     # 前端：Vue 3 + TS + Vite
    ├── public/
    ├── src/
    │   ├── api/             # 调用后端 /api 的封装与类型（如 Attempt）
    │   ├── router/          # Vue Router 路由
    │   ├── views/           # 页面：HomeView（默写记录列表）；后续题目列表、默写、结果
    │   ├── components/      # 组件：如逐字高亮结果组件（待实现）
    │   ├── App.vue
    │   └── main.ts
    ├── index.html
    ├── vite.config.ts       # dev proxy：/api -> http://localhost:3000
    ├── package.json
    └── tsconfig*.json
```

## 常用命令

后端（`server/`）：

```bash
cd server && npm install && npm run dev   # 开发模式启动（端口 3000，启动时自动建表并执行种子数据）
npm run build      # 编译 TypeScript 到 dist/
npm start          # 运行编译产物
npm run lint       # 类型检查（tsc --noEmit）
```

前端（`web/`）：

```bash
cd web && npm install && npm run dev      # 启动 Vite 开发服务器（http://localhost:5173，/api 代理到 3000 端口）
npm run build      # 类型检查并构建生产包
npm run lint       # 类型检查（vue-tsc -b）
```

暂未配置 ESLint 与测试框架；`npm run lint` 目前为 TypeScript 类型检查。判分 service 实现时需补充 `npm test`。

## 实现状态

- 已实现：建表与种子数据、`GET /api/attempts`（全部记录列表）、前端首页 `/`（默写记录列表，含加载中 / 空态 / 错误态）。
- 待实现：`GET /api/texts`、`POST /api/attempts`（判分）、`GET /api/attempts?text_id=` 过滤、题目列表 / 默写 / 结果页面。

## 架构约定

### 后端 REST API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/texts` | 题目列表。**只返回 id、title 等元信息，不返回原文 `content`**，防止默写时作弊查看。 |
| `POST` | `/api/attempts` | 提交默写。请求体 `{ text_id, input }`。服务端从库中读取原文，与 `input` 做字符级 diff，返回标记数组与正确率，并写入 `attempts` 表。 |
| `GET` | `/api/attempts` | 默写记录列表（JOIN `texts`），按 `created_at` 倒序。可选 `?text_id=` 按题目过滤（过滤待实现）。 |

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

`GET /api/attempts` 响应示例（不含 `input` 与原文）：

```json
[
  { "id": 5, "title": "相思", "score": 0.9167, "created_at": "2026-10-08T10:20:00.000Z" }
]
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
- 后端为 ESM（`"type": "module"`，`module: nodenext`），相对导入需带 `.js` 后缀（如 `./db.js`）。
- 提交前运行 `npm run lint`（前后端分别执行），有测试的模块同时运行 `npm test`。
- 提交 `package-lock.json`；不要提交 `server/data/*.db*` 等数据库文件。

## 数据表说明

### `texts`（题目）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | INTEGER PRIMARY KEY | 主键 |
| `title` | TEXT NOT NULL | 题目标题 |
| `content` | TEXT NOT NULL | 原文（仅服务端使用） |
| `created_at` | TEXT NOT NULL | 创建时间（ISO 8601 UTC，默认当前时间） |

### `attempts`（默写记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | INTEGER PRIMARY KEY | 主键 |
| `text_id` | INTEGER NOT NULL | 关联 `texts.id` |
| `input` | TEXT NOT NULL | 用户默写内容 |
| `score` | REAL NOT NULL | 正确率（0–1） |
| `created_at` | TEXT NOT NULL | 提交时间（ISO 8601 UTC，默认当前时间） |

服务启动时（`server/src/db.ts`）自动执行 `CREATE TABLE IF NOT EXISTS` 建表，并执行 `server/data/seed.sql` 写入预置题目（种子脚本需幂等，使用 `INSERT OR IGNORE`）。`server/data/seed-attempts.sql` 中的示例默写记录**仅在首次初始化**（`texts` 表为空）时写入，因此清空 `attempts` 表后重启不会被重新填充。如需恢复初始数据，删除 `server/data/dictation.db*` 后重启即可。
