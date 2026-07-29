"""
每个 Excel 文件的配置：
- header_row: 表头所在行号 (1-based)
- data_start_row: 数据起始行号 (1-based)
- columns: {目标字段: 表头关键词}
- fan_unit: "absolute" | "wan"
- has_wechat_nickname: bool
- has_xhs_account_id: bool
"""

FILE_CONFIGS = {
    # ===== 类型 A：第1行说明，第2行表头 =====
    "小火车3期达人名单.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "wechat_id": "微信号",
            "baby_age": "宝宝月龄",
        },
        "fan_unit": "absolute",
    },
    "小红书置换活动信息表.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "账号名称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量（万）",  # 表头写万，但值是绝对数
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "工程车置换.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "六面体置换.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "推车报名表单.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "小火车报名表.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页连接",  # 注意：是"连接"不是"链接"
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "棉柔巾报名表.xlsx": {
        "header_row": 2,
        "data_start_row": 3,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页连接",  # 注意：是"连接"不是"链接"
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    # ===== 类型 C 特殊：5月新品，第3行是产品子标题 =====
    "5月新品体验达人合作报名表.xlsx": {
        "header_row": 2,
        "data_start_row": 4,
        "columns": {
            "wechat_nickname": "微信昵称",
            "wechat_id": "微信号",
            "xhs_nickname": "小红书昵称",
            "xhs_account_id": "小红书ID",
            "homepage_link": "主页链接",
            "followers_count": "粉丝数（万）",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    # ===== 类型 B：第1行即表头 =====
    "平衡车报名表单.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "幸运兔待筛达人表单.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "推荐达人信息填写.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "xhs_nickname": "小红书昵称",
            "wechat_id": "微信号",
            "homepage_link": "主页链接",
            "followers_count": "粉丝量",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "开心农场置换报名表2群.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "wechat_nickname": "微信昵称",
            "wechat_id": "微信号",
            "xhs_nickname": "小红书昵称",
            "xhs_account_id": "小红书ID",
            "homepage_link": "主页链接",
            "followers_count": "粉丝数（万）",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "跳舞猫置换报名表1群.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "wechat_nickname": "微信昵称",
            "wechat_id": "微信号",
            "xhs_nickname": "小红书昵称",
            "xhs_account_id": "小红书ID",
            "homepage_link": "主页链接",
            "followers_count": "粉丝数（万）",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "S级小火车社群置换报名表【1群】.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "wechat_nickname": "微信昵称",
            "wechat_id": "微信号",
            "xhs_nickname": "小红书昵称",
            "xhs_account_id": "小红书ID",
            "homepage_link": "主页链接",
            "followers_count": "粉丝数（万）",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
    "S级小火车社群置换报名表【2群】.xlsx": {
        "header_row": 1,
        "data_start_row": 2,
        "columns": {
            "wechat_nickname": "微信昵称",
            "wechat_id": "微信号",
            "xhs_nickname": "小红书昵称",
            "xhs_account_id": "小红书ID",
            "homepage_link": "主页链接",
            "followers_count": "粉丝数（万）",
            "baby_age": "宝宝年龄",
        },
        "fan_unit": "absolute",
    },
}

# 达人属性表单独处理，不走主流程
ANALYTICS_FILES = ["达人属性表.xlsx"]
