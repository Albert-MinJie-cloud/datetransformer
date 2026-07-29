# DataTransformer - 达人数据提取与分析平台

从多个 Excel 报名表中提取达人数据（微信号、小红书信息、粉丝数等），存入数据库，并提供可视化分析仪表盘。

## 项目结构

```
├── main.py              # 数据提取脚本：Excel → SQLite
├── db.py                # 数据库操作
├── extractor.py         # Excel 读取与列映射
├── normalizer.py        # 数据清洗（粉丝数标准化等）
├── file_configs.py      # 每个 Excel 文件的列映射配置
├── schema.py            # 数据库建表 DDL
├── server/
│   └── main.py          # FastAPI 后端（本地开发用）
├── worker/
│   └── src/index.ts     # Cloudflare Worker（Hono）
├── frontend/
│   └── src/             # React + Vite + TailwindCSS 前端
└── data.db              # SQLite 数据库（本地）
```

## 本地运行

### 1. 提取数据

```bash
uv run python main.py
```

将当前目录下的 Excel 文件提取到 `data.db`。

### 2. 启动仪表盘

```bash
# 终端 1 - 后端
uv run uvicorn server.main:app --reload --port 8000

# 终端 2 - 前端
cd frontend && npm install && npm run dev
```

浏览器打开 `http://localhost:5173`。

---

## 部署到 Cloudflare

### 前置条件

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 第一步：创建 D1 数据库

```bash
cd worker
npx wrangler d1 create creators-db
```

输出示例：

```
✅ Created database 'creators-db' with id <database_id>
```

将输出的 `database_id` 填入 `worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "creators-db"
database_id = "<database_id>"   # ← 替换这里
```

### 第二步：初始化表结构

```bash
npx wrangler d1 execute creators-db --file=schema.sql
```

### 第三步：导入数据

```bash
npx wrangler d1 execute creators-db --file=seed.sql
```

> seed.sql 约 500KB，包含 1097 条达人记录。

### 第四步：部署 Worker（后端 API）

```bash
npx wrangler deploy
```

部署成功后会输出 Worker URL，例如：

```
https://creator-worker.your-username.workers.dev
```

### 第五步：部署前端（Cloudflare Pages）

```bash
cd ../frontend
npm install
npm run build
npx wrangler pages deploy dist/
```

### 第六步：更新前端 API 地址

修改 `frontend/src/api.ts` 中的 `BASE` 常量，将 `your-subdomain` 替换为实际的 Worker URL：

```ts
const BASE = import.meta.env.PROD
  ? "https://creator-worker.your-username.workers.dev/api"
  : "/api";
```

修改后重新构建并部署：

```bash
npm run build
npx wrangler pages deploy dist/
```

### 更新数据

当有新的 Excel 数据需要导入时：

```bash
# 1. 本地重新生成 seed.sql
uv run python -c "
import sqlite3
db = sqlite3.connect('../data.db')
# ... 重新导出 seed.sql
"

# 2. 执行导入
npx wrangler d1 execute creators-db --file=seed.sql
```

---

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/stats/overview` | 总览统计（总人数、有粉丝数、中位粉丝数） |
| `GET /api/stats/followers` | 粉丝量分布和量级分布 |
| `GET /api/sources` | 各来源文件达人数量 |
| `GET /api/creators` | 达人列表（分页、筛选、排序） |

### 查询参数

`GET /api/creators` 支持：

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | int | 页码，默认 1 |
| `page_size` | int | 每页条数，默认 20，最大 100 |
| `source_file` | string | 按来源文件筛选 |
| `follower_min` | int | 最低粉丝数 |
| `follower_max` | int | 最高粉丝数 |
| `keyword` | string | 搜索微信号/昵称 |
| `sort_by` | string | 排序字段：`id` / `followers_count` / `created_at` |
| `sort_order` | string | `asc` 或 `desc` |
