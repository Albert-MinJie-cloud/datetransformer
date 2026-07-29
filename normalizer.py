import re


def clean_text(value):
    """去除首尾空白和换行符，空值返回 None。"""
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)
    value = value.strip().replace("\n", "").replace("\r", "")
    if value == "":
        return None
    return value


def clean_wechat_id(value):
    """清洗微信号：去空白，float 类型的 .0 后缀去掉。"""
    if value is None:
        return None
    if isinstance(value, float) and value == int(value):
        value = int(value)
    value = str(value).strip()
    if value == "":
        return None
    return value


def normalize_followers(raw_value, fan_unit):
    """
    标准化粉丝数为绝对整数。

    处理场景：
    - None → None
    - "1.5w" / "5.2万" → 提取数字 × 10000
    - "9300相机出图" → 正则提取前导数字
    - 数值 + fan_unit='wan' → ×10000
    - 数值 + fan_unit='absolute' → 直接取整
    """
    if raw_value is None:
        return None

    if isinstance(raw_value, str):
        raw_value = raw_value.strip()
        if raw_value == "":
            return None

        # 匹配 "1.5w" / "5.2万" / "1.1万" 等格式
        m = re.match(r"^([\d.]+)\s*[w万萬]$", raw_value)
        if m:
            return int(float(m.group(1)) * 10000)

        # 提取前导数字（处理 "9300相机出图" 等脏数据）
        m = re.match(r"^([\d.]+)", raw_value)
        if m:
            raw_value = float(m.group(1))
        else:
            return None

    try:
        value = float(raw_value)
    except (ValueError, TypeError):
        return None

    if fan_unit == "wan":
        value = value * 10000

    return int(value)


def normalize_baby_age(value):
    """标准化宝宝年龄文本：'X月龄' → 'X个月'。"""
    text = clean_text(value)
    if text is None:
        return None
    text = text.replace("月龄", "个月")
    return text
