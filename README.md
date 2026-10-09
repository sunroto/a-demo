# 默写应用（Write From Memory）

一个内置默写题目的练习应用：选择题目后凭记忆默写，提交后系统自动与原文做字符级比对，逐字高亮正确 / 错字 / 漏字，并给出正确率和历史记录。

## 技术栈

- Node.js ≥ 22（见 `.nvmrc`）
- 前端：Vue 3（`^3.5.0`）+ Vue Router（`^4.5.0`）+ Vite（`^7.0.0`）+ `@vitejs/plugin-vue`（`^6.0.0`）+ TypeScript（`~5.9.0`）+ vue-tsc（`^3.0.0`）
- 后端：Express（`^5.0.0`）+ better-sqlite3（`^12.0.0`）+ tsx（`^4.19.0`）+ TypeScript（`~5.9.0`）；类型包 `@types/express ^5.0.0`、`@types/node ^22.0.0`、`@types/better-sqlite3 ^9.6.0`

## 目录结构

```
.
├── .nvmrc           # Node.js 版本（22）
├── server/          # 后端 Express 服务（端口 3000）
│   ├── data/        # seed.sql / seed-attempts.sql 种子数据；dictation.db 运行时生成（不提交）
│   └── src/         # 入口、数据库初始化、路由（后续加入判分 service）
└── web/             # 前端 Vue 应用（Vite，/api 代理到后端）
    └── src/         # api/ 封装、router/、views/（HomeView 默写记录列表）
```

## 本地启动

需要 Node.js ≥ 22（可执行 `nvm use` 读取 `.nvmrc`）。

```bash
# 启动后端（首次启动自动建表并写入种子题目）
cd server && npm install && npm run dev

# 另开终端，启动前端
cd web && npm install && npm run dev
```

然后在浏览器打开 Vite 输出的本地地址（默认 http://localhost:5173），首页展示默写记录列表（题目、正确率、提交时间）。

首次启动会写入示例默写记录；如需恢复初始数据，停止后端并删除 `server/data/dictation.db*` 后重新启动。

## 功能概述

当前已实现：首页默写记录列表（`GET /api/attempts`）。以下为规划中的完整功能：

- **选择默写题目**：题目列表只展示标题，不显示原文。
- **默写提交**：在输入框中凭记忆默写并提交。
- **逐字高亮结果**：按字符标记正确、错字、漏字。
- **正确率与历史记录**：每次提交计算正确率并保存，可按题目查看历史。

题目原文由种子数据（`server/data/seed.sql`）预置，应用不提供题目录入功能。

更多开发约定见 [AGENTS.md](./AGENTS.md)。
