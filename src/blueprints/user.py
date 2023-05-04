import json
import logging

from flask import make_response, jsonify
from flask import request, render_template, redirect, url_for, Blueprint
from flask_login import login_required, logout_user, login_user
from flask import session

import src.utils.user as user_utils

user_bp = Blueprint('user', __name__)


@user_bp.route('/index')
def user_index():
    username = session.get('username')
    # ! DEBUG
    print("Index session: {}".format(session))
    if username is not None:
        print("Username: {}".format(username))
    # ! DEBUG
    if user_utils.get_user_by_name(username) is not None:
        result = jsonify(data={'username': username, 'code': 1})
        # ! DEBUG
        print("Get username success!")
        # ! DEBUG
        response = make_response(result)
        return response
    return make_response()


@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    """用户登录

    Returns:
        _type_: _description_
    """
    if request.method == 'POST':
        data = request.get_json()
        data_info = json.loads(data['data'])
        # TODO 修改对应的 api
        username = data_info['Username']
        password = data_info['Password']
        # ! DEBUG
        print("username: {}, password: {}".format(username, password))
        # ! DEBUG
        # 将用户登录
        stat_code, user = user_utils.login_check(username, password)
        if stat_code == 1:  # 登录成功
            # login_user(user)
            # ! 设置 session
            session['username'] = username
        result = jsonify(data={'data': stat_code})
        response = make_response(result)
        # response.headers['result'] = stat_code  # 用户不存在 (-1) 密码错误 (0)
        return response
    return "Login page."


@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册

    Returns:
        _type_: _description_
    """
    if request.method == 'POST':
        data = request.get_json()
        data_info = json.loads(data['data'])
        # TODO 修改对应的 api
        username = data_info['Username']
        password = data_info['Password']
        email = data_info['Email']
        print("username: {}, password: {}, email: {}".format(username, password, email))
        # 将用户注册
        stat_code = user_utils.register_user(username, password, email)
        result = jsonify(data={'data': stat_code})
        response = make_response(result)
        # if stat_code == 1:
        #     return "Register succeed!"
        # else:
        #     return "Register failed!"
        return response
    return "Register page."


@user_bp.route('/logout', methods=['GET', 'POST'])
def logout():
    """用户登出

    Returns:
        _type_: _description_
    """
    if request.method == 'POST':
        # logout_user()
        session.clear()
        # result = jsonify(data={'data': 1})
        # response = make_response(result)
        # return response
        return "Logout success!"
    return "Logout get request."


@user_bp.route('/unregister', methods=['GET', 'POST'])
def unregister():
    """用户注销

    Returns:
        _type_: _description_
    """
    # if request.method == 'POST':
    #     data = request.get_json()
    #     data_info = json.loads(data['data'])
    #     # TODO 修改对应的 api
    #     username = data_info['Username']
    #     password = data_info['Password']
    #     stat_code = user_utils.unregister_user(username, password)
    #     result = jsonify(data={
    #         'data': stat_code,
    #         'msg': "unregister success" if stat_code else "unregister failed"
    #     })
    #     response = make_response(result)
    #     return response
    if request.method == 'POST':
        username = session.get('username')
        stat_code = user_utils.unregister_user(username)
        session.clear()
        result = jsonify(data={
            'data': stat_code,
            'msg': 'unregister success' if stat_code == 1 else 'unregister failed'
        })
        response = make_response(result)
        return response
    return "Unregister."


@user_bp.route('/homepage', methods=['GET', 'POST'])
def homepage():
    """用户主页

    Returns:
        _type_: _description_
    """
    pass
    return "Homepage."
