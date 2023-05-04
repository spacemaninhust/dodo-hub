from src.models import Option
from src.extensions import db


def show_option():
    pass


""" 字段获取 """


def get_option(option_id: int):
    target_option = Option.query.filter_by(id=option_id).first()
    return target_option


def get_content(option):
    return option.content if option is not None else None


def get_content_byid(option_id: int):
    target_option = get_option(option_id)
    return get_content(target_option)


def get_question_of_option(option):
    return option.question if option is not None else None


def get_question_of_option_byid(option_id: int):
    target_option = get_option(option_id)
    return get_question_of_option(target_option)


""" 数据库交互 """


def option_code_stoi(option_code_str: str) -> int:
    return int(option_code_str)


def create_option(option_code: str, content: str, commit: bool = False):
    new_option = Option()
    new_option.set_option_code(option_code_stoi(option_code))
    new_option.set_content(content)
    if commit:
        db.session.add(new_option)
        db.session.commit()
    return new_option
