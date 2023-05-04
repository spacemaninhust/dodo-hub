from src.models import Answer
from src.extensions import db

""" 调试信息 """


def show_answer():
    pass


""" 字段获取 """


def get_answer(answer_id: int):
    target_answer = Answer.query.filter_by(id=answer_id).first()
    return target_answer


def get_ans_option(answer):
    return answer.ans_option if answer is not None else None


def get_ans_option_byid(answer_id: int):
    target_answer = get_answer(answer_id)
    return get_ans_option(target_answer)


def get_question_of_answer(answer):
    return answer.question if answer is not None else None


def get_question_of_answer_byid(answer_id: int):
    target_answer = get_answer(answer_id)
    return get_question_of_answer(target_answer)


""" 数据库交互 """


def create_answer(ans_option: str, commit: bool = False):
    new_answer = Answer()
    new_answer.set_ans_option(ans_option)
    db.session.add(new_answer)
    db.session.commit()
    if commit:
        db.session.add(new_answer)
        db.session.commit()
    return new_answer
