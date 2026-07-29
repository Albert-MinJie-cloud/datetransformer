import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// ---------- GET /api/stats/overview ----------
app.get("/api/stats/overview", async (c) => {
  const db = c.env.DB;

  const total = await db
    .prepare("SELECT COUNT(*) as cnt FROM creators")
    .first<{ cnt: number }>();

  const withFollowers = await db
    .prepare(
      "SELECT COUNT(*) as cnt FROM creators WHERE followers_count IS NOT NULL AND followers_count > 0 AND followers_count < 100000000"
    )
    .first<{ cnt: number }>();

  const halfIdx = Math.floor((withFollowers?.cnt ?? 0) / 2);
  const medianRow = await db
    .prepare(
      `SELECT followers_count FROM creators WHERE followers_count IS NOT NULL AND followers_count > 0 AND followers_count < 100000000 ORDER BY followers_count LIMIT 1 OFFSET ?`
    )
    .bind(halfIdx)
    .first<{ followers_count: number }>();

  return c.json({
    total_creators: total?.cnt ?? 0,
    total_with_followers: withFollowers?.cnt ?? 0,
    median_followers: medianRow?.followers_count ?? 0,
  });
});

// ---------- GET /api/stats/followers ----------
app.get("/api/stats/followers", async (c) => {
  const db = c.env.DB;

  const brackets = [
    [0, 1000],
    [1000, 5000],
    [5000, 10000],
    [10000, 50000],
    [50000, 100000],
    [100000, 500000],
    [500000, 1000000],
    [1000000, 100000000],
  ] as const;

  const distribution: { range: string; count: number }[] = [];
  for (const [low, high] of brackets) {
    const row = await db
      .prepare(
        "SELECT COUNT(*) as cnt FROM creators WHERE followers_count >= ? AND followers_count < ?"
      )
      .bind(low, high)
      .first<{ cnt: number }>();
    const label =
      low >= 10000
        ? `${low / 10000}w-${high / 10000}w`
        : `${low}-${high}`;
    distribution.push({ range: label, count: row?.cnt ?? 0 });
  }

  const rangeConditions = [
    ["< 5k", "followers_count > 0 AND followers_count < 5000"],
    ["5k - 1w", "followers_count >= 5000 AND followers_count < 10000"],
    ["1w - 5w", "followers_count >= 10000 AND followers_count < 50000"],
    ["5w - 100w", "followers_count >= 50000 AND followers_count < 1000000"],
    ["> 100w", "followers_count >= 1000000 AND followers_count < 100000000"],
  ];

  const ranges: { label: string; count: number }[] = [];
  for (const [label, condition] of rangeConditions) {
    const row = await db
      .prepare(`SELECT COUNT(*) as cnt FROM creators WHERE ${condition}`)
      .first<{ cnt: number }>();
    ranges.push({ label, count: row?.cnt ?? 0 });
  }

  return c.json({ distribution, ranges });
});

// ---------- GET /api/sources ----------
app.get("/api/sources", async (c) => {
  const db = c.env.DB;
  const result = await db
    .prepare(
      "SELECT source_file, COUNT(*) as cnt FROM creators GROUP BY source_file ORDER BY cnt DESC"
    )
    .all<{ source_file: string; cnt: number }>();
  return c.json(
    (result.results ?? []).map((r) => ({
      source_file: r.source_file,
      count: r.cnt,
    }))
  );
});

// ---------- GET /api/creators ----------
app.get("/api/creators", async (c) => {
  const db = c.env.DB;

  const page = Math.max(1, Number(c.req.query("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(c.req.query("page_size") || "20")));
  const sourceFile = c.req.query("source_file");
  const followerMin = c.req.query("follower_min");
  const followerMax = c.req.query("follower_max");
  const keyword = c.req.query("keyword");
  let sortBy = c.req.query("sort_by") || "id";
  let sortOrder = c.req.query("sort_order") || "desc";

  const allowedSort = new Set(["id", "followers_count", "created_at"]);
  if (!allowedSort.has(sortBy)) sortBy = "id";
  if (sortOrder !== "asc" && sortOrder !== "desc") sortOrder = "desc";

  const conditions: string[] = [];
  const params: any[] = [];

  if (sourceFile) {
    conditions.push("source_file = ?");
    params.push(sourceFile);
  }
  if (followerMin) {
    conditions.push("followers_count >= ?");
    params.push(Number(followerMin));
  }
  if (followerMax) {
    conditions.push("followers_count <= ?");
    params.push(Number(followerMax));
  }
  if (keyword) {
    conditions.push(
      "(wechat_id LIKE ? OR wechat_nickname LIKE ? OR xhs_nickname LIKE ? OR xhs_account_id LIKE ?)"
    );
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw, kw);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) as cnt FROM creators ${where}`)
    .bind(...params)
    .first<{ cnt: number }>();
  const total = countRow?.cnt ?? 0;

  const offset = (page - 1) * pageSize;
  const data = await db
    .prepare(
      `SELECT * FROM creators ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`
    )
    .bind(...params, pageSize, offset)
    .all();

  return c.json({
    total,
    page,
    page_size: pageSize,
    data: data.results ?? [],
  });
});

export default app;
