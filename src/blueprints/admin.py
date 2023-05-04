import os
import json
import logging
import filetype

from flask import request, render_template, redirect, url_for, Blueprint, session, jsonify, make_response, send_file
from flask_login import login_required, logout_user

from src.models import User, Question, Submission, SubmitContentInfo
import src.utils.user as u_utils
import src.utils.collection as c_utils
import src.utils.submit as s_utils

from src.utils.statistics import generate_zip, generate_excel


def get_username_from_session(url_of_request: str):
    username = session.get('username')
    if username is None:
        logging.error(f"Unlogin user behavior at {url_of_request}.")
    return username


admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/create_class', methods=['GET', 'POST'])
def create_class():
    if request.method == 'POST':
        pass
        return "Create class succeed!"
    return "Create class."


@admin_bp.route('/manage_class', methods=['GET', 'POST'])
def manage_class():
    if request.method == 'POST':
        pass
        return "Manage class succeed!"
    return "Manage class."


@admin_bp.route('/add_namelist', methods=['GET', 'POST'])
def add_namelist():
    if request.method == 'POST':
        pass
        return "Add namelist succeed!"
    return "Add namelist."


@admin_bp.route('/statistics')
def get_statistics():
    username = get_username_from_session(request.url)
    if username is None:
        err_msg = f"Error: unlogin user access {request.url}!"
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # 统计用户所有的提交信息
    user = u_utils.get_user_by_name(username)
    if user is None:
        err_msg = f"Error: user {username} not found!"
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    collection_info_dict_list = u_utils.get_collections_info_of_user(user)
    print(collection_info_dict_list)
    # 制作成 json 格式返回前端
    result = jsonify(data={'data': json.dumps(collection_info_dict_list)})
    response = make_response(result)
    return response


@admin_bp.route('/statistics/<int:c_id>')
def statistic_of_collection(c_id: int):
    username = get_username_from_session(request.url)
    if username is None:
        err_msg = f'Error: unlogin user access {request.url}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # TODO 封装成 api
    submission_info_dict = dict()
    submission_info_dict['Submissioncount'] = collection.get_submission_count()
    submission_info_dict['Filecount'] = collection.get_file_count()
    submission_info_dict['Deadline'] = collection.end_date.strftime('%Y-%m-%d %H:%M:%S')
    submission_info_dict['Title'] = str(collection.title)
    # TODO 增加 查看汇总 和 下载文件的链接
    # ! DEBUG
    print(json.dumps(submission_info_dict, indent=1))
    # ! DEBUG
    # 返回响应
    result = jsonify(data={'data': json.dumps(submission_info_dict)})
    response = make_response(result)
    return response


@admin_bp.route('/get_zip/<int:c_id>')
def get_collection_zip(c_id: int):
    username = get_username_from_session(request.url)
    if username is None:
        err_msg = f'Error: unlogin user behavior at {request.url}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    user = u_utils.get_user_by_name(username)
    if user is None:
        err_msg = f'Error: unknown user {username}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: collection {c_id} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # TODO
    col_path = str(collection.collection_path)
    zip_file_name = str(collection.title) + '.zip'
    # 目标目录
    source_dir = col_path
    dest_dir = user.userspace
    print(f'source_dir: {source_dir}')
    print(f'dest_dir: {dest_dir}')
    print(f'zip_file_name: {zip_file_name}')
    generate_zip(source_dir, os.path.join(dest_dir, zip_file_name))
    print(f'zip_dir: {os.path.join(dest_dir, zip_file_name)}')
    try:
        return send_file(os.path.join(dest_dir, zip_file_name))
    except Exception as e:
        return str(e)


@admin_bp.route('/get_csv/<int:c_id>')
def get_collection_csv(c_id: int):
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: collection {c_id} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # TODO 生成汇总 excel 并返回
    excel_name = str(collection.title) + '.xlsx'
    due_namelist = str(collection.namelist).split(',')
    # TODO 查询已交名单
    submitted_list = list()
    for submission in collection.submissions:
        submitter_name = str(submission.submitter_name)
        if submitter_name is not None:
            submitted_list.append(submitter_name)
    generate_excel(due_namelist, submitted_list, excel_name, excel_path=str(collection.creator.userspace))
    try:
        return send_file(os.path.join(collection.creator.userspace, excel_name))
    except Exception as e:
        return str(e)


@admin_bp.route('/namelist/<int:c_id>', methods=['GET', 'POST'])
def modify_namelist(c_id: int):
    username = get_username_from_session(request.url)
    if username is None:
        err_msg = f'Error: unlogin user access {request.url}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    name_list = collection.get_namelist()
    print('name_list: ', name_list)
    # * 返回 name 和 email
    name_dict_list = list()
    for name in name_list:
        name_dict = dict()
        name_dict['Name'] = name
        name_dict['Email'] = ''  # TODO 从数据库中查询得到
        name_dict_list.append(name_dict)

    if request.method == 'GET':
        result = jsonify(data={'data': name_dict_list})
        response = make_response(result)
        return response
    elif request.method == 'POST':
        # 更新 collection 的 namelist 字段
        data = request.get_json()
        data_info = data['data']
        # ! DEBUG
        # print(data_info)
        # print(type(data_info))
        name_info_dict_list = json.loads(data_info)
        print('name_info: ', name_info_dict_list)
        print(type(name_info_dict_list))
        # ! DEBUG
        # TODO 处理更新
        new_name_list = list()
        for name_info in name_info_dict_list:
            name = name_info['name']
            new_name_list.append(name)
        # TODO 处理重名
        new_name_list = list(set(new_name_list))
        name_list = list(set(name_list).union(set(new_name_list)))
        # * 更新 namelist
        c_utils.modify_namelist(collection, name_list)
        # 返回响应
        # * 返回 name 和 email
        name_dict_list = list()
        for name in name_list:
            name_dict = dict()
            name_dict['Name'] = name
            name_dict['Email'] = ''  # TODO 从数据库中查询得到
            name_dict_list.append(name_dict)
        result = jsonify(data={'data': name_dict_list})
        response = make_response(result)
        return response
    else:
        msg = f'Request {request.url} method {request.method}'
        print(msg)
        return msg


@admin_bp.route('/delete_name/<int:c_id>', methods=['GET', 'POST'])
def delete_name_of_collection(c_id: int):
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    if request.method == 'POST':
        # 删除名单中对应的名字
        data = request.get_json()
        data_info = data['data']
        # ! DEBUG
        print(data_info)
        print(type(data_info))
        # ! DEBUG
        name = json.loads(data_info)
        # TODO 处理更新
        name_list = collection.get_namelist()
        print('name_list: ', name_list)
        if name in name_list:
            name_list.remove(name)
            c_utils.modify_namelist(collection, name_list)
        else:
            err_msg = f'Error: name {name} not in name_list!'
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        # 返回响应
        result = jsonify(data={'data': 1})
        response = make_response(result)
        return response
    else:
        msg = f'Request {request.url} method {request.method}'
        print(msg)
        return msg


@admin_bp.route('/urging/<int:c_id>')
def urging_submission(c_id: int):
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # TODO 一键催交

    # 返回响应
    result = jsonify(data={'data': 1})
    response = make_response(result)
    return response


def judge_filetype(file_path: str) -> str:
    guess_type = filetype.guess(file_path)
    if guess_type is None:
        return 'unknown'
    # print(f'Extension: ', guess_type.extension)
    # print(f'Mime type: ', guess_type.mime)
    return str(guess_type.extension)


@admin_bp.route('/submissions/<int:c_id>')
def records_of_collection(c_id: int):
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # TODO 统计信息
    submission_info_dict_list = list()
    for submission in collection.submissions:
        # * 创建一个新的 submission_info_dict
        submission_info_dict = dict()
        # TODO 补充字段
        submission_info_dict['Sid'] = submission.id
        submission_info_dict['Submittime'] = submission.submit_time.strftime('%Y-%m-%d %H:%M:%S')
        submission_info_dict['Filecount'] = 0
        # TODO 文件详情
        submission_info_dict['Filedetails'] = list()
        # ! TEST 统计文件提交相关信息
        for submit_content_info in submission.submit_content_infos:
            if submit_content_info.question.q_type == Question.FILE_UPLOAD:
                col_path = submit_content_info.get_submit_path()
                print(f'col_path: {col_path}')
                file_count = 0
                for root, dirs, files in os.walk(col_path):
                    print(f'root: {root}\tdirs: {dirs}\tfiles: {files}')
                    file_count += len(files)
                    # ! TEST 添加文件名和文件路径
                    for file in files:
                        submission_info_dict['Filedetails'].append({
                            'Name': file,
                            'Type': judge_filetype(os.path.join(root, file)),
                            'Url': os.path.join(root, file),
                            # ! TEST 新增 SCid
                            'SCid': submit_content_info.id
                        })
                submission_info_dict['Filecount'] += file_count
        # ! TEST 统计文件提交相关信息
        # * 将 submission_info_dict 添加到 submission_info_dict_list
        submission_info_dict_list.append(submission_info_dict)
    # ! DEBUG
    print('submission_info_dict_list')
    print(submission_info_dict_list)
    # ! DEBUG
    # 返回响应
    result = jsonify(data={'data': submission_info_dict_list})
    response = make_response(result)
    return response


# TODO 修改传递的信息以实现获取文件加速
@admin_bp.route('/preview/<path:filename>/<int:s_id>/<int:sc_id>')
def preview_file(filename: str, s_id: int, sc_id: int):
    submission = s_utils.get_submission(s_id)
    if submission is None:
        err_msg = f'Error: submission {s_id} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    submit_content_info = s_utils.get_submit_content_info(sc_id)
    if submit_content_info is None:
        err_msg = f'Error: submit_content_info {sc_id} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # * 返回需要的文件
    question = submit_content_info.question
    file_path = os.path.join(str(question.upload_path), f'subm_{s_id}', filename)
    try:
        return send_file(file_path)
    except Exception as e:
        return str(e)


@admin_bp.route('/graphic/<int:c_id>')
def show_graphics(c_id: int):
    # 获取对应的收集
    collection = c_utils.get_collection(c_id)
    if collection is None:
        err_msg = f'Error: unknown collection {c_id}!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    # * 整体统计情况，记录准确率
    total_statistics_info_dict_list = list()
    # * 题目统计情况，记录选择每个选项的人数
    ques_statistics_info_dict_list = list()
    for question in collection.questions:
        # 对于非选择题，跳过不进行统计
        if question.q_type != Question.SINGLE_CHOICE and question.q_type != Question.MULTI_CHOICE:
            continue
        total_statistics_info_dict = dict()
        ques_statistics_info_dict = dict()
        # * 整体统计信息
        # TODO 补充字段信息
        total_statistics_info_dict['Seqnum'] = question.seq_num
        # TODO 计算正确率 使用字符串比较
        total_statistics_info_dict['Accuracy'] = 0.0
        correct_result = str(question.answer.ans_option)
        print(f'correct_result: {correct_result}')
        # ! TEST
        for submit_content_info in question.submit_content_infos:
            submit_result = str(submit_content_info.result)
            print(f'submit_result: {submit_result}')
            if submit_result == correct_result:
                total_statistics_info_dict['Accuracy'] += 1
        total_statistics_info_dict['Accuracy'] /= len(question.submit_content_infos)
        # ! TEST
        # 将 total_statistics_info_dict 添加到 total_statistics_info_dict_list
        total_statistics_info_dict_list.append(total_statistics_info_dict)
        # * 题目统计信息
        ques_statistics_info_dict['Title'] = str(question.title)
        # ques_statistics_info_dict['Answeroptions'] = str(question.answer.ans_option)
        ques_statistics_info_dict['Answeroptions'] = \
            ''.join(str(question.answer.ans_option).split(',')).translate(str.maketrans('1234', 'ABCD'))
        # ! DEBUG
        print(ques_statistics_info_dict['Answeroptions'])
        # ! DEBUG
        ques_statistics_info_dict['ChooseA'] = 0
        ques_statistics_info_dict['ChooseB'] = 0
        ques_statistics_info_dict['ChooseC'] = 0
        ques_statistics_info_dict['ChooseD'] = 0
        ques_statistics_info_dict['Anamelist'] = list()
        ques_statistics_info_dict['Bnamelist'] = list()
        ques_statistics_info_dict['Cnamelist'] = list()
        ques_statistics_info_dict['Dnamelist'] = list()
        for submit_content_info in question.submit_content_infos:
            submitter_name = str(submit_content_info.submission.submitter_name)
            print(f'submitter_name: {submitter_name}')
            submit_result = str(submit_content_info.result).translate(str.maketrans('1234', 'ABCD')).split(',')
            print(f'submit_result: {submit_result}')
            for choice in ['A', 'B', 'C', 'D']:
                if choice in submit_result:
                    if submitter_name is not None:
                        ques_statistics_info_dict[f'{choice}namelist'].append(submitter_name)
                    ques_statistics_info_dict[f'Choose{choice}'] += 1
        # 将 ques_statistics_info_dict 添加到 ques_statistics_info_dict_list
        ques_statistics_info_dict_list.append(ques_statistics_info_dict)
        ques_statistics_info_dict['Anamelist'] = str(' '.join(ques_statistics_info_dict['Anamelist']))
        ques_statistics_info_dict['Bnamelist'] = str(' '.join(ques_statistics_info_dict['Bnamelist']))
        ques_statistics_info_dict['Cnamelist'] = str(' '.join(ques_statistics_info_dict['Cnamelist']))
        ques_statistics_info_dict['Dnamelist'] = str(' '.join(ques_statistics_info_dict['Dnamelist']))
    # ! DEBUG
    print('total_statistics_info_dict_list')
    print(total_statistics_info_dict_list)
    print('ques_statistics_info_dict_list')
    print(ques_statistics_info_dict_list)
    # ! DEBUG
    # 返回响应
    result = jsonify(data={
        'Collectiontitle': str(collection.title),
        'Totalstatistics': total_statistics_info_dict_list,
        'Questionstatistics': ques_statistics_info_dict_list
    })
    response = make_response(result)
    return response


@admin_bp.route('/dashboard')
def show_dashboard():
    return "Dashboard."


@admin_bp.route('/personalinfo', methods=['GET', 'POST'])
def personal_information():
    username = session.get('username')
    if username is None:
        err_msg = f'Error: unlogin user {username} request url {request.url}'
        logging.error(err_msg)
        print(err_msg)
        return err_msg
    user = u_utils.get_user_by_name(username)
    if user is None:
        err_msg = f'Error: user {username} not exists!'
        logging.error(err_msg)
        print(err_msg)
        return err_msg

    if request.method == 'GET':
        print("username: {}\temail: {}".format(user.username, user.email))
        result = jsonify(data={
            'Username': user.username,
            'Email': user.email,
            'data': 1
        })
        response = make_response(result)
        return response
    elif request.method == 'POST':
        data = request.get_json()
        data_info = json.loads(data['data'])
        # ! DEBUG
        print(data_info)
        print(type(data_info))
        # ! DEBUG
        # TODO 修改用户信息
        new_username = data_info['username']
        new_email = data_info['email']
        stat_code = u_utils.modify_userinfo(user, new_username, new_email)
        # 返回响应
        result = jsonify(data={'data': stat_code})
        response = make_response(result)
        return response
    else:
        msg = f'Request url {request.url} method {request.method}'
        return msg


@admin_bp.route('/password', methods=['GET', 'POST'])
def change_password():
    if request.method == 'POST':
        username = session.get('username')
        if username is None:
            err_msg = f'Error: unlogin user {username} request url {request.url}'
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        user = u_utils.get_user_by_name(username)
        if user is None:
            err_msg = f'Error: user {username} not exists!'
            logging.error(err_msg)
            print(err_msg)
            return err_msg
        data = request.get_json()
        data_info = json.loads(data['data'])
        # ! DEBUG
        print(data_info)
        print(type(data_info))
        # ! DEBUG
        # TODO 修改密码
        original_password = data_info['oldpassword']
        new_password = data_info['newpassword']
        stat_code = u_utils.modify_password(user, original_password, new_password)
        # 返回响应
        result = jsonify(data={'data': stat_code})
        response = make_response(result)
        return response
    msg = f'Request {request.url} method {request.method}'
    return msg
