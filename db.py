import sqlite3

from schema import ALL_STATEMENTS


def init_db(db_path):
    """创建数据库表及索引。返回 connection 对象。"""
    conn = sqlite3.connect(db_path)
    for stmt in ALL_STATEMENTS:
        conn.execute(stmt)
    conn.commit()
    return conn


def insert_creator(conn, record):
    """
    插入一条达人记录（去重：同一 xhs_nickname + wechat_id 只保留一条）。

    返回 True 表示插入成功，False 表示因重复被跳过。
    """
    sql = """
    INSERT OR IGNORE INTO creators
        (wechat_id, wechat_nickname, xhs_nickname, xhs_account_id,
         homepage_link, followers_count, baby_age, source_file, source_row)
    VALUES
        (:wechat_id, :wechat_nickname, :xhs_nickname, :xhs_account_id,
         :homepage_link, :followers_count, :baby_age, :source_file, :source_row)
    """
    cursor = conn.execute(sql, record)
    return cursor.rowcount > 0


def insert_analytics(conn, records):
    """批量插入达人属性分析数据。"""
    sql = """
    INSERT INTO creator_analytics
        (creator_name, followers_count, tier, persona,
         account_attr, fan_portrait, notes_portrait,
         cpe, sponsored_notes, viral_rate, source_file, source_row)
    VALUES
        (:creator_name, :followers_count, :tier, :persona,
         :account_attr, :fan_portrait, :notes_portrait,
         :cpe, :sponsored_notes, :viral_rate, :source_file, :source_row)
    """
    count = 0
    for record in records:
        conn.execute(sql, record)
        count += 1
    conn.commit()
    return count


def get_stats(conn):
    """获取数据库统计信息。"""
    creators_count = conn.execute(
        "SELECT COUNT(*) FROM creators"
    ).fetchone()[0]
    analytics_count = conn.execute(
        "SELECT COUNT(*) FROM creator_analytics"
    ).fetchone()[0]
    return {"creators": creators_count, "analytics": analytics_count}
