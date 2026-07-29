from pathlib import Path

from db import get_stats, init_db, insert_analytics, insert_creator
from extractor import extract_analytics_file, extract_file
from file_configs import FILE_CONFIGS
from normalizer import (
    clean_text,
    clean_wechat_id,
    normalize_baby_age,
    normalize_followers,
)


def build_record(raw, config, filename):
    """将原始提取数据清洗为数据库记录。"""
    return {
        "wechat_id": clean_wechat_id(raw.get("wechat_id")),
        "wechat_nickname": clean_text(raw.get("wechat_nickname")),
        "xhs_nickname": clean_text(raw.get("xhs_nickname")),
        "xhs_account_id": clean_text(raw.get("xhs_account_id")),
        "homepage_link": clean_text(raw.get("homepage_link")),
        "followers_count": normalize_followers(
            raw.get("followers_count"), config["fan_unit"]
        ),
        "baby_age": normalize_baby_age(raw.get("baby_age")),
        "source_file": filename,
        "source_row": raw["_source_row"],
    }


def main():
    base_dir = Path(__file__).parent

    # 1. 初始化数据库
    db_path = base_dir / "data.db"
    conn = init_db(str(db_path))
    print(f"数据库已初始化: {db_path}")

    # 2. 处理报名表
    stats = {"files": 0, "total_rows": 0, "inserted": 0, "skipped": 0, "errors": 0}

    for filename, config in FILE_CONFIGS.items():
        filepath = base_dir / filename
        if not filepath.exists():
            print(f"  [警告] 文件不存在: {filename}")
            continue

        stats["files"] += 1
        file_inserted = 0
        file_total = 0

        try:
            for raw in extract_file(filepath, config):
                file_total += 1
                try:
                    record = build_record(raw, config, filename)
                    if insert_creator(conn, record):
                        file_inserted += 1
                        stats["inserted"] += 1
                    else:
                        stats["skipped"] += 1
                except Exception as e:
                    stats["errors"] += 1
                    print(f"  [错误] {filename} 第{raw['_source_row']}行: {e}")

            conn.commit()
            stats["total_rows"] += file_total
            print(f"  {filename}: {file_total} 行, 插入 {file_inserted}")

        except Exception as e:
            stats["errors"] += 1
            print(f"  [错误] 解析文件失败 {filename}: {e}")

    # 3. 处理达人属性表
    analytics_file = base_dir / "达人属性表.xlsx"
    if analytics_file.exists():
        try:
            analytics_records = extract_analytics_file(analytics_file)
            count = insert_analytics(conn, analytics_records)
            print(f"  达人属性表.xlsx: {count} 行 -> creator_analytics")
        except Exception as e:
            print(f"  [错误] 处理达人属性表失败: {e}")

    # 4. 输出统计
    db_stats = get_stats(conn)
    conn.close()

    print()
    print("=" * 50)
    print(f"处理完成! 文件数: {stats['files']}")
    print(f"  总行数: {stats['total_rows']}")
    print(f"  成功插入: {stats['inserted']}")
    print(f"  跳过(重复): {stats['skipped']}")
    print(f"  错误: {stats['errors']}")
    print(f"数据库: {db_path}")
    print(f"  creators 表: {db_stats['creators']} 条")
    print(f"  creator_analytics 表: {db_stats['analytics']} 条")
    print("=" * 50)


if __name__ == "__main__":
    main()
