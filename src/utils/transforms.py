from datetime import datetime


def from_string_to_datetime(string_format_time: str) -> datetime:
    if len(string_format_time) < 19:  # 解决 00 秒的问题
        string_format_time += ':00'
    datetime_format_time = string_format_time.replace("T", " ")
    return datetime.strptime(datetime_format_time, '%Y-%m-%d %H:%M:%S')
