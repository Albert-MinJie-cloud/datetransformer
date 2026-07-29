CREATE_CREATORS_TABLE = """
CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wechat_id       TEXT,
    wechat_nickname TEXT,
    xhs_nickname    TEXT,
    xhs_account_id  TEXT,
    homepage_link   TEXT,
    followers_count INTEGER,
    baby_age        TEXT,
    source_file     TEXT NOT NULL,
    source_row      INTEGER,
    created_at      TEXT DEFAULT (datetime('now'))
);
"""

CREATE_CREATORS_INDEX = """
CREATE UNIQUE INDEX IF NOT EXISTS idx_xhs_nickname_wechat
    ON creators(xhs_nickname, wechat_id)
    WHERE xhs_nickname IS NOT NULL AND xhs_nickname != ''
      AND wechat_id IS NOT NULL AND wechat_id != '';
"""

CREATE_ANALYTICS_TABLE = """
CREATE TABLE IF NOT EXISTS creator_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_name     TEXT,
    followers_count  INTEGER,
    tier             TEXT,
    persona          TEXT,
    account_attr     TEXT,
    fan_portrait     TEXT,
    notes_portrait   TEXT,
    cpe              REAL,
    sponsored_notes  INTEGER,
    viral_rate       REAL,
    source_file      TEXT NOT NULL,
    source_row       INTEGER
);
"""

ALL_STATEMENTS = [CREATE_CREATORS_TABLE, CREATE_CREATORS_INDEX, CREATE_ANALYTICS_TABLE]
