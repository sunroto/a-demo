# 默写应用（Write From Memory）

一个内置默写题目的练习应用：选择题目后凭记忆默写，提交后系统自动与原文做字符级比对，逐字高亮正确 / 错字 / 漏字，并给出正确率和历史记录。

## 技术栈

- 前端：Vue 3 + TypeScript + Vite（Vue Router）
- 后端：Node.js + Express + TypeScript + better-sqlite3（SQLite）

## 目录结构

```
.
├── server/          # 后端 Express 服务（端口 3000）
│   ├── data/        # seed.sql 种子数据；dictation.db 运行时生成（不提交）
│   └── src/         # 路由、数据库初始化、判分 service
└── web/             # 前端 Vue 应用（Vite，/api 代理到后端）
    └── src/         # 页面、组件、路由、API 封装
```

## 本地启动

需要 Node.js（建议 LTS 版本）。

```bash
# 启动后端（首次启动自动建表并写入种子题目）
cd server && npm install && npm run dev

# 另开终端，启动前端
cd web && npm install && npm run dev
```

然后在浏览器打开 Vite 输出的本地地址（默认 http://localhost:5173）。

## 功能概述

- **选择默写题目**：题目列表只展示标题，不显示原文。
- **默写提交**：在输入框中凭记忆默写并提交。
- **逐字高亮结果**：按字符标记正确、错字、漏字。
- **正确率与历史记录**：每次提交计算正确率并保存，可按题目查看历史。

题目原文由种子数据（`server/data/seed.sql`）预置，应用不提供题目录入功能。

更多开发约定见 [AGENTS.md](./AGENTS.md)。
