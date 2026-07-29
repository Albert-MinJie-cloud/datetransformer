import sqlite3
from math import sqrt
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Creator Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).parent.parent / "data.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/api/stats/overview")
def stats_overview():
    db = get_db()
    total = db.execute("SELECT COUNT(*) FROM creators").fetchone()[0]
    with_followers = db.execute(
        "SELECT COUNT(*) FROM creators WHERE followers_count IS NOT NULL AND followers_count > 0 AND followers_count < 100000000"
    ).fetchone()[0]

    # 中位数用 SQL 近似
    median_row = db.execute("""
        SELECT followers_count FROM creators
        WHERE followers_count IS NOT NULL AND followers_count > 0 AND followers_count < 100000000
        ORDER BY followers_count
        LIMIT 1 OFFSET (SELECT COUNT(*) FROM creators
            WHERE followers_count IS NOT NULL AND followers_count > 0 AND followers_count < 100000000) / 2
    """).fetchone()
    median = median_row[0] if median_row else 0

    db.close()
    return {
        "total_creators": total,
        "total_with_followers": with_followers,
        "median_followers": median,
    }


@app.get("/api/stats/followers")
def stats_followers():
    db = get_db()

    # FIX: Use explicit column references with table prefix to avoid ambiguity
    brackets = [
        (0, 1000),
        (1000, 5000),
        (5000, 10000),
        (10000, 50000),
        (50000, 100000),
        (100000, 500000),
        (500000, 1000000),
        (1000000, 100000000),
    ]
    distribution = []
    for low, high in brackets:
        cnt = db.execute(
            "SELECT COUNT(*) FROM creators WHERE followers_count >= ? AND followers_count < ?",
            (low, high),
        ).fetchone()[0]
        label = f"{low//10000}w-{high//10000}w" if low >= 10000 else f"{low}-{high}"
        distribution.append({"range": label, "count": cnt})

    # 量级分类（过滤掉异常值）
    ranges = [
        ("< 5k", "followers_count > 0 AND followers_count < 5000"),
        ("5k - 1w", "followers_count >= 5000 AND followers_count < 10000"),
        ("1w - 5w", "followers_count >= 10000 AND followers_count < 50000"),
        ("5w - 100w", "followers_count >= 50000 AND followers_count < 1000000"),
        ("> 100w", "followers_count >= 1000000 AND followers_count < 100000000"),
    ]
    range_data = []
    for label, condition in ranges:
        cnt = db.execute(
            f"SELECT COUNT(*) FROM creators WHERE {condition}"
        ).fetchone()[0]
        range_data.append({"label": label, "count": cnt})

    db.close()
    return {"distribution": distribution, "ranges": range_data}


@app.get("/api/sources")
def sources():
    db = get_db()
    rows = db.execute("""
        SELECT source_file, COUNT(*) as cnt
        FROM creators
        GROUP BY source_file
        ORDER BY cnt DESC
    """).fetchall()
    db.close()
    return [{"source_file": r["source_file"], "count": r["cnt"]} for r in rows]


@app.get("/api/creators")
def creators(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source_file: str | None = None,
    follower_min: int | None = None,
    follower_max: int | None = None,
    keyword: str | None = None,
    sort_by: str = "id",
    sort_order: str = "desc",
):
    db = get_db()

    allowed_sort = {"id", "followers_count", "created_at"}
    if sort_by not in allowed_sort:
        sort_by = "id"
    if sort_order not in ("asc", "desc"):
        sort_order = "desc"

    conditions = []
    params = {}

    if source_file:
        conditions.append("source_file = :source_file")
        params["source_file"] = source_file

    if follower_min is not None:
        conditions.append("followers_count >= :follower_min")
        params["follower_min"] = follower_min

    if follower_max is not None:
        conditions.append("followers_count <= :follower_max")
        params["follower_max"] = follower_max

    if keyword:
        conditions.append(
            "(wechat_id LIKE :kw OR wechat_nickname LIKE :kw OR xhs_nickname LIKE :kw OR xhs_account_id LIKE :kw)"
        )
        params["kw"] = f"%{keyword}%"

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    total = db.execute(
        f"SELECT COUNT(*) FROM creators {where}", params
    ).fetchone()[0]

    offset = (page - 1) * page_size
    params["limit"] = page_size
    params["offset"] = offset

    rows = db.execute(
        f"SELECT * FROM creators {where} ORDER BY {sort_by} {sort_order} LIMIT :limit OFFSET :offset",
        params,
    ).fetchall()

    db.close()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": [dict(r) for r in rows],
    }
