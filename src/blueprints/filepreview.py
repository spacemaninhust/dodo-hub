import json
import logging

from flask import request, Blueprint, session, jsonify, make_response

from src.models import User, Question
import src.utils.user as u_utils
import src.utils.collection as c_utils
import src.utils.submit as s_utils

filepreview_bp = Blueprint('filepreview', __name__)


def get_username_from_session(url_of_request: str):
    username = session.get('username')
    if username is None:
        logging.error(f"Unlogin user behavior at {url_of_request}.")
    return username


# Question 类型反映射表，将填空、单选、多选、文件题类型映射到 1, 2, 3, 4
question_type_stoi_trans = {
    Question.FILL_IN: 1,
    Question.SINGLE_CHOICE: 2,
    Question.MULTI_CHOICE: 3,
    Question.FILE_UPLOAD: 4
}


def question_type_stoi(q_type_str: str) -> int:
    return question_type_stoi_trans[q_type_str]


@filepreview_bp.route('/preview/<int:s_id>')
def preview_submission(s_id: int):
    submission = s_utils.get_submission(s_id)
    if submission is None:
        err_msg = f'Error: submission {s_id} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # ! 根据 s_id 获取 c_id
    collection = submission.collection
    c_id = collection.id
    print(f'submission id: {s_id}\tcollection id: {c_id}')
    # TODO 返回预览信息
    # * 获取收集 head 相关信息
    collection_info_dict = c_utils.get_collection_info(collection)
    # ! DEBUG
    print('collection_info_dict')
    print(collection_info_dict)
    # ! DEBUG
    # * 获取收集 questions 相关信息
    questions_info_dict_list = c_utils.get_questions_info_of_collection(collection, with_answer=True)
    print('questions_info_dict_list')
    print(questions_info_dict_list)
    # * 获取提交 submission 中的内容
    # TODO
    answers_info_dict_list = list()
    for submit_content_info in submission.submit_content_infos:
        answers_info_dict = dict()
        answers_info_dict['Result'] = str(submit_content_info.result)
        answers_info_dict['Seqnum'] = int(submit_content_info.question.seq_num)
        answers_info_dict_list.append(answers_info_dict)
    answers_info_dict_list.sort(key=lambda k: k['Seqnum'])
    # ! DEBUG
    print('answers_info_dict_list')
    print(answers_info_dict_list)
    # ! DEBUG
    # 返回响应
    result = jsonify(data={
        'collection_info': collection_info_dict,
        'questions_info': questions_info_dict_list,
        'answers_info': answers_info_dict_list,
    })
    response = make_response(result)
    return response
