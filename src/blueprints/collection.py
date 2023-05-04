import os
import json
import logging
from flask import request, render_template, redirect, url_for, Blueprint
from flask import make_response, jsonify
from flask import session
from flask_login import login_required

from werkzeug.utils import secure_filename

from src.models import Collection, User, Question, Submission, SubmitContentInfo
import src.utils.user as u_utils
import src.utils.collection as c_utils
import src.utils.question as q_utils
import src.utils.transforms as t_utils
import src.utils.file as f_utils

from src.extensions import cache, db

server_url = "47.115.214.209:5000"


def get_username_from_session(url_of_request: str):
    username = session.get('username')
    if username is None:
        logging.error(f"Unlogin user behavior at {url_of_request}.")
    return username


collection_bp = Blueprint('collection', __name__)


@collection_bp.route('/create', methods=['GET', 'POST'])
def create_collection():
    if request.method == 'POST':
        username = get_username_from_session(request.url)
        if username is None:
            return f"Error: unlogin user access {request.url}!"
        data = request.get_json()
        data_info = json.loads(data['data'])
        # * 创建一个新的 collection
        new_collection = c_utils.create_collection_from_data(data_info)
        # * 与 User 建立关联
        user = u_utils.get_user_by_name(username)
        # * collection ----> user.collections
        cur_c_id = c_utils.add_collection_to_user(new_collection, user)
        # TODO 返回 response
        # cur_share_link = '127.0.0.1:5000' + '/#/File_submitting/' + str(cur_c_id)
        cur_share_link = server_url + '/#/File_submitting/' + str(cur_c_id)
        result = jsonify(data={'data': 1, 'link': cur_share_link})
        response = make_response(result)
        # return "Create collection succeed!"
        return response
    return "Create collection."


@collection_bp.route('/edit/<int:c_id>', methods=['GET', 'POST'])
def edit_collection(c_id: int):
    if request.method == 'GET':
        response = c_utils.make_collection_info_response_byid(c_id, with_answer=True)
        if response is None:
            err_msg = f"Edit collection {c_id} failed!"
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        # 返回响应
        return response
    elif request.method == 'POST':
        # TODO 编辑收集
        data = request.get_json()
        data_info = json.loads(data['data'])
        # ! DEBUG
        print(f'Receive data from {request.url}')
        print(data_info)
        print(type(data_info))
        # ! DEBUG
        # ! TEST
        collection = c_utils.get_collection(c_id)
        orig_q_id_list = list()
        for question in collection.questions:
            orig_q_id_list.append(int(question.id))
        _, new_q_id_list = c_utils.modify_collection_from_data(data_info, c_id)
        # TODO 比较 q_id_list，删除多余的 q_id 对应的 question
        q_utils.update_exists_questions(orig_q_id_list, new_q_id_list)
        result = jsonify(data={'data': 1})
        response = make_response(result)
        return response
        # return "TODO: edit collection."
    return f'EDIT CID: {c_id} METHOD: {request.method}'


@collection_bp.route('/delete/<int:c_id>', methods=['GET', 'POST'])
def delete_collection(c_id: int):
    if request.method == 'POST':
        username = get_username_from_session(request.url)
        if username is None:
            return f"Error: unlogin user access {request.url}!"
        # 删除 c_id 对应的收集
        stat_code = c_utils.delete_collection_byid(c_id)
        # 返回响应
        result = jsonify(data={'data': stat_code})
        response = make_response(result)
        return response
        # return "Delete collection succeed!"
    return "Delete collection"


@collection_bp.route('/restart/<int:c_id>', methods=['GET', 'POST'])
def restart_collection(c_id: int):
    if request.method == 'GET':
        response = c_utils.make_collection_info_response_byid(c_id, with_answer=True)
        if response is None:
            err_msg = f"Restart collection {c_id} failed!"
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        # 返回响应
        return response
    elif request.method == 'POST':
        data = request.get_json()
        data_info = json.loads(data['data'])
        # ! DEBUG
        print(f'Receive data from {request.url}')
        print(data_info)
        print(type(data_info))
        # ! DEBUG
        return "TODO: restart collection."
    return f'RESTART CID: {c_id} METHOD: {request.method}'


@collection_bp.route('/copy/<int:c_id>', methods=['GET', 'POST'])
def copy_collection(c_id: int):
    if request.method == 'GET':
        response = c_utils.make_collection_info_response_byid(c_id, with_answer=True)
        if response is None:
            err_msg = f"Copy collection {c_id} failed!"
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        # 返回响应
        else:
            print(f"Copy collection {c_id}.")
            return response
    return f'COPY CID: {c_id} METHOD: {request.method}'


@collection_bp.route('/preview')
def preview_collection():
    username = get_username_from_session(request.url)
    if username is None:
        return f"Error: unlogin user access {request.url}!"
    # TODO 从请求中获取 collection_id
    # c_id = None
    # ! DEBUG
    c_id = 1
    collection = c_utils.get_collection(c_id)
    if collection is None:
        return f"Error: unknown collection id: {c_id}!"
    # 创建一个 collection_info_dict
    collection_info_dict = dict()
    collection_info_dict['Id'] = collection.id
    collection_info_dict['Title'] = collection.title
    collection_info_dict['Collector'] = collection.collector_name
    collection_info_dict['Deadline'] = collection.end_date  # TODO 转换为前端格式
    collection_info_dict['Status'] = collection.status  # TODO 转换为前端格式
    # TODO 封装 Question 相关信息
    question_info_dict_list = list()
    for question in collection.questions:
        # 创建一个新的 question_info_dict
        question_info_dict = dict()
        question_info_dict['Seqnum'] = question.seq_num
        question_info_dict['Qtype'] = question.q_type  # TODO 转换为前端格式
        question_info_dict['Title'] = question.title
        question_info_dict['Description'] = question.description
        question_info_dict['Answer'] = question.answer.ans_option  # TODO 转换为前端格式
        # 添加到 question_info_dict_list
        question_info_dict_list.append(question_info_dict)
    # TODO 制作成 json 格式并返回前端
    # ! DEBUG
    print(question_info_dict_list)
    for question_info_dict in question_info_dict_list:
        print(json.dumps(question_info_dict, indent=1))
    # ! DEBUG
    return "Preview collection."


@collection_bp.route('/submit/<int:c_id>', methods=['GET', 'POST'])
def submit_collection(c_id: int):
    collection = c_utils.get_collection(c_id)
    if collection is None:
        return f"Error: collection {c_id} not exist!"

    if request.method == 'GET':  # ? GET 请求，即将收集界面显示给用户
        # 创建一个 collection_info_dict
        collection_info_dict = dict()
        collection_info_dict['Id'] = collection.id
        collection_info_dict['Title'] = collection.title
        collection_info_dict['Collector'] = collection.collector_name
        collection_info_dict['Description'] = collection.description
        collection_info_dict['Deadline'] = collection.end_date.strftime('%Y-%m-%d %H:%M:%S')
        collection_info_dict['Status'] = collection.status  # TODO 转换为前端格式
        # TODO 封装 Question 相关信息
        question_info_dict_list = list()
        for question in collection.questions:
            # 创建一个新的 question_info_dict
            question_info_dict = dict()
            question_info_dict['Qid'] = question.id  # ! TEST add Qid
            question_info_dict['Seqnum'] = question.seq_num
            question_info_dict['Require'] = 1 if question.require else 0
            # question_info_dict['Qtype'] = question.q_type  # TODO 转换为前端格式
            question_info_dict['Qtype'] = \
                1 if question.q_type == Question.FILL_IN else \
                    2 if question.q_type == Question.SINGLE_CHOICE else \
                        3 if question.q_type == Question.MULTI_CHOICE else 4
            question_info_dict['Title'] = question.title
            print(question.description)
            question_info_dict['Description'] = question.description
            # question_info_dict['Answer'] = question.answer.ans_option  # TODO 转换为前端格式
            # TODO 每个选项的内容
            question_info_dict['Options'] = dict()
            option_code_stoi_trans = str.maketrans('1234', 'ABCD')
            for option in question.options:
                question_info_dict['Options'].update({
                    str(option.option_code).translate(option_code_stoi_trans): option.content
                })  # TODO 转换为前端格式
            # question_info_dict['Renamerule'] = [1, 2]  # TODO 转换为前端格式
            # question_info_dict['Renamerule'] = list(map(int, str(question.rename_rule).split(',')))
            # print(question.rename_rule)
            if question.q_type == Question.FILE_UPLOAD:
                # TODO 封装成 api 放到 transforms.py
                str_rename_rule = str(question.rename_rule)
                # print(type(str_rename_rule))
                # print(str_rename_rule)
                # question_info_dict['Renamerule'] = list(map(int, str_rename_rule.split(',')))
                question_info_dict['Renamerule'] = str_rename_rule
            else:
                question_info_dict['Renamerule'] = '0'
            # 添加到 question_info_dict_list
            question_info_dict_list.append(question_info_dict)
        # TODO 制作成 json 格式并返回前端
        # ! DEBUG
        # print(json.dumps(collection_info_dict))
        # print(question_info_dict_list)
        # for question_info_dict in question_info_dict_list:
        #     print(json.dumps(question_info_dict, indent=1))
        # ! DEBUG
        result = jsonify(
            data={
                'collection_info': collection_info_dict,
                'questions_info': question_info_dict_list,
                'data': 1
            })
        # print(collection_info_dict)
        # print(question_info_dict_list)
        # print({
        #         'collection_info': collection_info_dict,
        #         'questions_info': question_info_dict_list,
        #         'data': 1
        #     })
        response = make_response(result)
        return response
    else:  # ? POST 请求，即用户提交
        data = request.get_json()
        data_info = json.loads(data['data'])
        # ! DEBUG
        """
        {
            'data': '{
                "collection_info": {
                    "id": "1",
                    "SubmitTime": "2023-04-18 22:46:44"
                },
                "question_info": [
                    {
                        "Qtype": "1",
                        "Seqnum": "1",
                        "Ans": "这是简答"
                    },
                    {
                        "Qtype": "2",
                        "Seqnum": "2",
                        "Ans": "1"
                    },
                    {
                        "Qtype": "3",
                        "Seqnum": "3",
                        "Ans": "1,2"
                    },
                    {
                        "Qtype": "4",
                        "Seqnum": "4",
                        "Ans": ""
                    }
                ]
            }'
        }
        """
        # ! DEBUG
        print(data_info)
        collection_info_dict = data_info['collection_info']
        submission_info_dict_list = data_info['question_info']
        # ! DEBUG
        submit_time = collection_info_dict['SubmitTime']
        # TODO 如果用户未登录，submitter_name 为空，否则为登录的用户名
        submitter_name = "unknown"
        # ! TEST 创建一个 submission 记录提交
        submission = Submission()
        db.session.add(submission)
        db.session.commit()
        s_id = submission.id
        print("submission_info_dict_list")
        print(submission_info_dict_list)
        for submission_info_dict in submission_info_dict_list:
            q_id = int(submission_info_dict['Qid'])  # ! TEST add q_id
            q_type = submission_info_dict['Qtype']
            if q_type == '1' or q_type == '2' or q_type == '3':  # ? 简答、选择
                ans_res = submission_info_dict['Ans']
                # ! TEST 获取姓名字段
                q_title = str(submission_info_dict['Title'])
                print(f'q_title: {q_title}')
                if q_title == '姓名':
                    submission.submitter_name = str(submission_info_dict['Ans'])
                    db.session.add(submission)
                    db.session.commit()
                elif q_title == '学号':
                    submission.submitter_snum = str(submission_info_dict['Ans'])
                    db.session.add(submission)
                    db.session.commit()
                # ! TEST 获取姓名字段
            else:  # ? 文件
                # TODO 查看缓存中是否有需要的文件
                q_seq = int(submission_info_dict['Seqnum'])
                cache_rule = f'CID_{c_id}_QSEQ_{q_seq}'
                print("cache_rule: ", cache_rule)
                matched_file_name_list = f_utils.get_matched_files(cache_rule)
                # ! DEBUG
                print("matched file name list:")
                print(matched_file_name_list)
                # ! DEBUG
                if len(matched_file_name_list) == 0:
                    print(f"Error: upload file not found!")
                    return "Error: upload file not found!"
                # 将找到的文件保存到数据库中
                question = q_utils.get_question(q_id)
                if question is None:
                    err_msg = f'Error: question {q_id} not found!'
                    logging.error(err_msg)
                    print(err_msg)
                    return err_msg
                question.set_upload_path()
                submit_path = os.path.join(str(question.upload_path), f'subm_{s_id}')
                if not os.path.exists(submit_path):
                    os.mkdir(submit_path)
                for matched_file_name in matched_file_name_list:
                    if not f_utils.save_file(matched_file_name,
                                             cache_rule,
                                             # os.path.join(
                                             #     str(collection.collection_path),
                                             #     's' + str(s_id),
                                             #     'q' + str(q_seq)
                                             # )
                                             submit_path):  # TODO 待修改为正式路径
                        print(f"Error: cached file {matched_file_name} not exist!")
                        return f"Error: cached file {matched_file_name} not exist!"
                ans_res = ':'.join(matched_file_name_list)
            # ! TEST 创建一个 submit_content_info 记录提交信息
            submit_content_info = SubmitContentInfo()
            submit_content_info.question_id = q_id
            submit_content_info.result = ans_res
            # ! TEST 将该 submit_content_info 加入 submission
            submission.submit_content_infos.append(submit_content_info)
        # TODO 存入数据库
        submission.collection_id = c_id
        db.session.add(submission)
        db.session.commit()
        # TODO 清空对应的缓存
        result = jsonify(data={'data': 1})
        # print(collection_info_dict)
        # print(question_info_dict_list)
        # print({
        #         'collection_info': collection_info_dict,
        #         'questions_info': question_info_dict_list,
        #         'data': 1
        #     })
        response = make_response(result)
        return response


@collection_bp.route('/submit/<int:c_id>/<int:q_seq>', methods=['GET', 'POST'])
def submit_collection_file(c_id: int, q_seq: int):
    """缓存提交文件
    
    Args:
        c_id (int): 收集 id
        q_seq (int): 问题序号
    
    Returns:
        __type__: None
    """
    if request.method == 'POST':
        print(f"REQUEST TYPE: {request.method}\tURL: {request.url}")
        print(f"c_id: {c_id}\tq_seq: {q_seq}")
        collection = c_utils.get_collection(collection_id=c_id)
        if collection is None:
            return f"Error: collection {c_id} not exist!"
        received_file = request.files['file']
        if received_file is None:
            return f"Error: no files received!"
        # print(type(received_file))
        # print(received_file)
        # received_file_name = str(secure_filename(received_file.filename))
        received_file_name = str(received_file.filename)
        print(f"RECEIVED FILE NAME: {received_file_name}")
        # ! TEST 缓存文件
        f_utils.upload_file(
            file=received_file,
            cache_name=f_utils.generate_cache_name(c_id, q_seq, received_file_name)
        )
    return "Submit file"


@collection_bp.route('/submit/<int:c_id>/<int:q_seq>/<string:filename>', methods=['GET', 'POST'])
def delete_collection_file(c_id: int, q_seq: int, filename: str):
    if request.method == 'POST':
        print(f"REQUEST TYPE: {request.method}\tURL: {request.url}")
        print(f"c_id: {c_id}\tq_seq: {q_seq}\tfilename: {filename}")
        collection = c_utils.get_collection(collection_id=c_id)
        if collection is None:
            return f"Error: collection {c_id} not exist!"
        if f_utils.delete_file(c_id, q_seq, filename):
            return "OK"
        else:
            return "FAILED"
    return "Delete file"


@collection_bp.route('/details')
def details_of_collections():
    """收集详情

    Returns:
        __type__: None
    """
    username = get_username_from_session(request.url)
    if username is None:
        msg = f"Error: unlogin user access {request.url}!"
        logging.error(msg)
        print(msg)
        return msg
    user = u_utils.get_user_by_name(username)
    if user is None:
        err_msg = f"session user {username} does not exist!"
        print(err_msg)
        logging.error(err_msg)
        return err_msg
    # 获取用户收集的相关信息
    collection_info_dict_list = u_utils.get_collections_info_of_user(user)
    collection_info_dict_list.sort(key=lambda k: k.get('Id', 0))  # TODO 排序有效性待验证
    # TODO 制作成 json 格式并返回前端
    # ! DEBUG
    print(collection_info_dict_list)
    for collection_info_dict in collection_info_dict_list:
        print(json.dumps(collection_info_dict, indent=1))
    result = jsonify(data={'data': json.dumps(collection_info_dict_list)})
    response = make_response(result)
    # ! DEBUG
    return response
    # return "Details of your collections."
