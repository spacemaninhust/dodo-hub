import os
import logging
import shutil
from datetime import datetime
from typing import Optional

import flask
from flask import jsonify, make_response

from src.models import Collection, User, Question
from src.extensions import db

from src.utils.question import create_question
import src.utils.question as q_utils
import src.utils.option as o_utils
import src.utils.transforms as t_utils

server_url = "47.115.214.209:5000"

""" 调试信息 """


def show_collection():
    pass


""" 字段获取 """


def get_collection(collection_id: int):
    target_collection = Collection.query.filter_by(id=collection_id).first()
    return target_collection


def is_valid_collection(collection):
    return collection.is_valid() if collection is not None else False


def is_valid_collection_byid(collection_id: int):
    target_collection = get_collection(collection_id)
    return is_valid_collection(target_collection)


def get_questions_of_collection(collection):
    return collection.questions if collection is not None else list()


def get_questions_of_collection_byid(collection_id: int):
    target_collection = get_collection(collection_id)
    return get_questions_of_collection(target_collection)


def get_creator(collection):
    return collection.creator if collection is not None else None


def get_creator_byid(collection_id: int):
    target_collection = get_collection(collection_id)
    return get_creator(target_collection)


def get_namelist(collection):
    return collection.namelist if collection is not None else list()


def get_namelist_byid(collection_id):
    target_collection = get_collection(collection_id)
    return get_namelist(target_collection)


def get_submission_count(collection):
    if collection is None:
        return None
    submissions = collection.submissions
    return len(submissions)


def get_submission_count_byid(collection_id: int):
    collection = get_collection(collection_id)
    return get_submission_count(collection)


def get_deadline_countdown(collection):
    if collection is None:
        return None
    cur_time = datetime.now()
    return collection.end_date - cur_time


def get_deadline_countdown_byid(collection_id: int):
    collection = get_collection(collection_id)
    return get_deadline_countdown(collection)


""" 数据库交互 """


def create_collection(title: str, collector_name: str, description: str, deadline: datetime,
                      question_info_list: list, commit: bool = False):
    new_collection = Collection()
    new_collection.set_title(title)
    new_collection.set_collector_name(collector_name)
    new_collection.set_description(description)
    new_collection.set_status(Collection.SAVED)
    new_collection.set_start_date()
    new_collection.set_end_date(deadline)
    # TODO 添加 questions，调用 utils.question 的相关函数 -ing
    for q_seq_num, question_info in enumerate(question_info_list):
        # ! DEBUG
        # print(question_info)
        # print(type(question_info))
        # q_seq_num = int(question_info['id'])
        q_type = int(question_info['value'])
        q_require = int(question_info['require'])
        q_info = question_info['content']
        # print("q_seq_num: {}, type: {}".format(q_seq_num, type(q_seq_num)))
        # print("q_type: {}, type: {}".format(q_type, type(q_type)))
        # print("q_info: {}, type: {}".format(q_info, type(q_info)))
        q_title = q_info['title']
        q_description = q_info['description']
        q_ans_list = q_info['ans']
        q_option_content_dict = {
            '1': q_info['A'],
            '2': q_info['B'],
            '3': q_info['C'],
            '4': q_info['D']
        }
        # ! DEBUG
        # TODO 补充 question 信息
        new_question = create_question(
            seq_num=q_seq_num + 1,
            q_type=q_type,
            require=q_require,
            title=q_title,
            description=q_description,
            ans_list=q_ans_list,
            option_dict=q_option_content_dict,
            commit=True
        )
        # * 与 new_collection 建立关联
        new_collection.questions.append(new_question)
        new_question.collection_id = new_collection.id
    # 执行添加收集操作
    if commit:
        db.session.add(new_collection)
        db.session.commit()
    return new_collection


def stop_collection(collection):
    if collection is None:
        return None
    # * 收集状态修改为 FINISHED
    collection.status = Collection.FINISHED
    # * 截止时间修改为当前时刻
    new_end_date = datetime.now()
    collection.end_date = new_end_date
    # * 执行状态修改
    db.session.commit()
    return True


def stop_collection_byid(collection_id: int):
    collection = get_collection(collection_id)
    return stop_collection(collection)


def delete_subdir(parent_dir: str, sub_dir: str):
    """

    Args:
        parent_dir: 上级目录
        sub_dir: 待删除的子目录

    Returns:
        __type__: None
    """
    subdir_path = os.path.join(parent_dir, sub_dir)
    if os.path.exists(subdir_path) and os.path.isdir(subdir_path):
        shutil.rmtree(subdir_path)
        print(f'Remove collection_path {subdir_path}')
    else:
        print(f'Path {subdir_path} not exists or is not a directory!')


def delete_collection(collection):
    collection_path = collection.collection_path
    try:
        print("col_path to be removed: ", collection_path)
        delete_subdir(os.path.dirname(collection_path), os.path.basename(collection_path))
    except IOError:
        logging.error(f"Remove collection_path failed! collection_id: {collection.id}\tpath: {collection_path}")
        return 0
    # * 执行删除收集操作
    db.session.delete(collection)
    db.session.commit()
    return 1


def delete_collection_byid(collection_id: int):
    collection = get_collection(collection_id)
    stat_code = delete_collection(collection)
    return stat_code


def modify_collection(collection):
    pass


def modify_collection_byid(collection_id: int):
    collection = get_collection(collection_id)
    return collection


def modify_namelist(collection, new_name_list: list[str]):
    collection.set_namelist(new_name_list)
    db.session.add(collection)
    db.session.commit()


""" Table 关联 """


def add_collection_to_user(collection, user):
    # 将 collection 添加到 user 的 collections 中
    user.collections.append(collection)
    collection.creator = user
    collection.creator_id = user.id
    # * 执行添加收集操作
    db.session.add(user)
    db.session.commit()
    collection.set_collection_path()
    print(f'collection_path: {collection.collection_path}')
    db.session.add(collection)
    db.session.commit()
    for question in collection.questions:
        question.set_upload_path()
        db.session.add(question)
        db.session.commit()
        if question.q_type == Question.FILE_UPLOAD:
            print(f'question_upload_path: {question.upload_path}')
            if not os.path.exists(question.upload_path):
                os.mkdir(question.upload_path)
    return collection.id


""" 前后端交互 """


def create_collection_from_data(data_info: dict) -> Collection:
    """创建收集

    由前端传递的 data_info 信息创建一个新的 Collection 结构

    Args:
        data_info (dict): 前端传递的相关信息

    Returns:
        Collection: 新的 Collection 结构
    """
    # head_info 包含 title, collector, deadline, description 信息
    head_info = data_info['head']
    # question_info_list 包含题目的相关信息
    question_info_list = data_info['questions']
    # 将前端传递的 string 类型 deadline 转换为 datetime 类型
    deadline = t_utils.from_string_to_datetime(head_info['Deadline'])
    new_collection = create_collection(
        title=head_info['Title'],
        collector_name=head_info['Collector'],
        description=head_info['Description'],
        deadline=deadline,
        question_info_list=question_info_list
    )
    return new_collection


def modify_collection_from_data(data_info: dict, c_id: int) -> [Optional[Collection], list]:
    """

    Args:
        data_info: 前端数据信息
        c_id: 收集 collection id

    Returns:
        Collection: 修改后的 collection
        list: 修改后的 q_id 列表
    """
    head_info = data_info['head']
    question_info_list = data_info['questions']

    collection = get_collection(c_id)

    # * 修改 head 字段
    # collection.update({
    #     'title': head_info['Title'],
    #     'collector_name': head_info['Collector'],
    #     'description': head_info['Description'],
    #     'end_date': t_utils.from_string_to_datetime(head_info['Deadline']),
    # })
    collection.title = head_info['Title']
    collection.collector_name = head_info['Collector']
    collection.description = head_info['Description']
    collection.end_date = t_utils.from_string_to_datetime(head_info['Deadline'])
    # * 提交 collection 修改
    db.session.add(collection)
    db.session.commit()

    # TODO 修改 questions 内容
    # ! 创建一个 q_id_list 记录收到的 q_id，对于没有出现过的 q_id 视为被删除，在函数结束时返回
    q_id_list = list()
    for q_seq_num, question_info in enumerate(question_info_list):
        q_info = question_info['content']
        q_ans_list = q_info['ans']
        q_option_content_dict = {
            '1': q_info['A'],
            '2': q_info['B'],
            '3': q_info['C'],
            '4': q_info['D']
        }
        # ! NEW
        # TODO 判断是否有 qid
        if question_info['qid'] == '':
            # qid 不存在，是新增的题目，创建一个 new_question
            new_question = create_question(
                seq_num=q_seq_num + 1,
                q_type=int(question_info['value']),
                require=int(question_info['require']),
                title=q_info['title'],
                description=q_info['description'],
                ans_list=q_ans_list,
                option_dict=q_option_content_dict,
                commit=True
            )
            collection.questions.append(new_question)
        else:
            q_id = int(question_info['qid'])  # ! 用于数据库定位
            q_id_list.append(q_id)

            # * 找到要修改的 question
            question = q_utils.get_question(q_id)
            # question = Question.query.filter_by(id=q_id)
            if question is None:
                err_msg = f'question {q_id} not exists!'
                print(err_msg)
                logging.error(err_msg)
                return None
            # TODO 更新 question 的相关信息
            # question.update({
            #     'seq_num': q_seq_num,
            #     'title': q_info['title'],
            #     'description': q_info['description'],
            #     'require': int(question_info['require'])
            # })
            question.seq_num = q_seq_num
            question.title = q_info['title']
            question.description = q_info['description']
            question.require = int(question_info['require'])
            db.session.add(question)
            db.session.commit()

            if question.q_type == Question.FILE_UPLOAD:
                # 对于文件题，仅更新重命名规则
                new_rename_rule = ','.join(map(str, q_ans_list))
                # question.update({'rename_rule': new_rename_rule})
                question.rename_rule = new_rename_rule
                db.session.add(question)
                db.session.commit()
            else:
                # 对于非文件题，删除所有的选项，然后新建更新的选项
                # * 删除原选项
                for option in question.options:
                    db.session.delete(option)
                    db.session.commit()
                # * 新建新选项
                for k, v in q_option_content_dict.items():
                    new_option = o_utils.create_option(option_code=k, content=v)
                    question.options.append(new_option)

                # * 更新答案
                new_ans_option = ','.join(map(str, q_ans_list))
                # question.answer.update({'ans_option': new_ans_option})
                question.answer.ans_option = new_ans_option
                db.session.add(question.answer)
                db.session.commit()

            # 提交 question 修改
            db.session.add(question)
            db.session.commit()

    # 提交修改后的 collection
    db.session.add(collection)
    db.session.commit()
    # 返回 collection 和 q_id_list
    return collection, q_id_list


def get_questions_info_of_collection(collection, with_answer: bool = False) -> list[dict]:
    if collection is None:
        return list()
    # 创建一个 question_info_dict_list
    question_info_dict_list = list()
    questions = get_questions_of_collection(collection)
    for question in questions:
        # 创建一个 question_info_dict
        question_info_dict = dict()
        question_info_dict['Qid'] = question.id
        question_info_dict['Seqnum'] = question.seq_num
        question_info_dict['Require'] = 1 if question.require else 0
        question_info_dict['Qtype'] = \
            1 if question.q_type == Question.FILL_IN else \
                2 if question.q_type == Question.SINGLE_CHOICE else \
                    3 if question.q_type == Question.MULTI_CHOICE else 4
        question_info_dict['Title'] = question.title
        question_info_dict['Description'] = question.description
        # # ! TEST
        # if with_answer:
        #     question_info_dict['Ans'] = list(map(int, str(question.answer).split(',')))
        # TODO 每个选项的内容 封装成 api 到 o_utils
        question_info_dict['Options'] = dict()
        option_code_stoi_trans = str.maketrans('1234', 'ABCD')
        for option in question.options:
            question_info_dict['Options'].update({
                str(option.option_code).translate(option_code_stoi_trans): option.content
            })  # TODO 转换为前端格式
        # ! TEST 统一处理答案和重命名规则
        if question.q_type == Question.FILE_UPLOAD:
            question_info_dict['Ans'] = list(map(int, str(question.rename_rule).split(',')))
        elif question.q_type != Question.FILE_UPLOAD and with_answer:
            question_info_dict['Ans'] = list(map(int, str(question.answer.ans_option).split(',')))
        # 添加到 question_info_dict_list
        question_info_dict_list.append(question_info_dict)
    # 返回 question_info_dict_list
    return question_info_dict_list


def get_questions_info_of_collection_byid(collection_id: int, with_answer: bool = False) -> list[dict]:
    collection = get_collection(collection_id)
    return get_questions_info_of_collection(collection, with_answer)


def get_collection_info(collection, with_sharelink: bool = False, with_submitcount: bool = False) -> dict:
    if collection is None:
        return dict()
    # 创建一个 collection_info_dict
    collection_info_dict = dict()
    collection_info_dict['Id'] = collection.id
    collection_info_dict['Title'] = collection.title
    collection_info_dict['Collector'] = collection.collector_name
    collection_info_dict['Description'] = collection.description
    collection_info_dict['Deadline'] = collection.end_date.strftime('%Y-%m-%d %H:%M:%S')
    if with_sharelink:
        collection_info_dict['Sharelink'] = server_url + '/#/File_submitting/' + str(collection.id)
    if with_submitcount:
        collection_info_dict['Submitcount'] = len(collection.submissions)
    # 返回 collection_info_dict
    return collection_info_dict


def get_collection_info_byid(collection_id: int, with_sharelink: bool = False, with_submitcount: bool = False) -> dict:
    collection = get_collection(collection_id)
    return get_collection_info(collection, with_sharelink, with_submitcount)


def make_collection_info_response(collection, with_answer: bool = False) -> Optional[flask.Response]:
    if collection is None:
        return None
    # 获取 collection 相关信息
    collection_info_dict = get_collection_info(collection)
    # 封装 question 相关信息
    question_info_dict_list = get_questions_info_of_collection(collection, with_answer)
    # 制作成 json 格式返回
    result = jsonify(
        data={
            'collection_info': collection_info_dict,
            'questions_info': question_info_dict_list,
            'data': 1
        }
    )
    response = make_response(result)
    return response


def make_collection_info_response_byid(collection_id: int, with_answer: bool = False) -> Optional[flask.Response]:
    collection = get_collection(collection_id)
    return make_collection_info_response(collection, with_answer)
