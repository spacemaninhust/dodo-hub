from src.models import Question, Answer, Option
from src.extensions import db
import src.utils.answer as answer_utils
import src.utils.option as option_utils


def show_question():
    pass


def get_question(question_id: int):
    target_question = Question.query.filter_by(id=question_id).first()
    return target_question


def get_collection_of_question(question):
    return question.collection if question is not None else None


def get_collection_of_question_byid(question_id: int):
    target_question = get_question(question_id)
    return get_collection_of_question(target_question)


def get_answer_of_question(question):
    return question.answer if question is not None else None


def get_answer_of_question_byid(question_id: int):
    target_question = get_question(question_id)
    return get_answer_of_question(target_question)


def get_options_of_question(question):
    return question.options if question is not None else None


def get_options_of_question_byid(question_id: int):
    target_question = get_question(question_id)
    return get_options_of_question(target_question)


# Question 类型映射表，将 1, 2, 3, 4 映射到填空、单选、多选、文件题类型
question_type_itos_trans = {
    1: Question.FILL_IN,  # 简答
    2: Question.SINGLE_CHOICE,  # 单选
    3: Question.MULTI_CHOICE,  # 多选
    4: Question.FILE_UPLOAD  # 文件
}


def question_type_itos(q_type_int: int):
    return question_type_itos_trans[q_type_int]


""" 数据库交互 """


def create_question(seq_num: int,
                    q_type: int,
                    require: int,
                    title: str,
                    description: str,
                    ans_list: list,
                    option_dict: dict,
                    commit: bool = False):
    new_question = Question()
    # TODO 调用 Question 相关方法添加字段信息 -ing
    new_question.set_seq_num(seq_num)
    new_question.set_q_type(question_type_itos(q_type))
    new_question.set_require(require)
    new_question.set_title(title)
    new_question.set_description(description)
    db.session.add(new_question)
    db.session.commit()
    if new_question.q_type == Question.FILE_UPLOAD:
        # 对于文件题，ans 中存放的是重命名规则
        rename_rule = ','.join(map(str, ans_list))
        new_question.set_rename_rule(rename_rule)
        # TODO 上传路径设置
    else:
        # * 设置选项
        for k, v in option_dict.items():
            new_option = option_utils.create_option(option_code=k, content=v)
            # * 与 new_question 建立关联
            new_question.options.append(new_option)
            new_option.question_id = new_question.id
            db.session.add(new_option)
            db.session.commit()
        # * 设置答案
        # 答案按照 "A,B,C,D" 格式存储在 DB 中
        ans_option = ','.join(map(str, ans_list))
        new_answer = answer_utils.create_answer(ans_option)
        # * 与 new_question 建立关联
        new_question.answer = new_answer
        new_answer.question_id = new_question.id
        db.session.add(new_answer)
        db.session.commit()
        db.session.add(new_question)
        db.session.commit()
    if commit:
        db.session.add(new_question)
        db.session.commit()
    return new_question


def update_exists_questions(orig_q_id_list: list[int], new_q_id_list: list[int]):
    question_id_list_removable = list(set(orig_q_id_list) - set(new_q_id_list))
    for q_id in question_id_list_removable:
        question = get_question(q_id)
        db.session.delete(question)
        db.session.commit()
