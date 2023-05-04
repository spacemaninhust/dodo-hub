import logging
import os.path
import re
import datetime
import shutil

from flask import session

from src.models import User
from src.extensions import db, APP_FILE

import src.utils.collection as c_utils

""" 调试信息 """


def show_user(user):
    print("User")
    print("username: ", user.username)
    print("psw_hash: ", user.psw_hash)
    print("email: ", user.email)
    print("space: ", user.userspace)


""" 字段获取 """


def get_user(user_id: int) -> User:
    target_user = User.query.filter_by(id=user_id).first()
    return target_user


def get_user_by_name(username: str) -> User:
    target_user = User.query.filter_by(username=username).first()
    return target_user if target_user is not None else None


def get_username(request):
    """从 form 中获取用户名

    Args:
        request (_type_): _description_

    Returns:
        _type_: _description_
    """
    username = request.form['Username']
    return username


def get_password(request):
    """从 form 中获取密码

    Args:
        request (_type_): _description_

    Returns:
        _type_: _description_
    """
    password = request.form['Password']
    return password


""" 字段检查 """


def check_username(username: str):
    """检查用户名是否合法

    Args:
        username (str): _description_

    Returns:
        _type_: _description_
    """
    # pattern = r'^[\w]{1, 30}$'
    # return bool(re.match(pattern, username))
    return True


def check_password(password: str):
    """检查密码是否合法

    Args:
        password (str): _description_

    Returns:
        _type_: _description_
    """
    return True


def check_email(email: str):
    """
    Args:
        email (str): 邮箱

    Returns:
        bool: 邮箱是否合法
    """
    pattern = r'^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$'
    return bool(re.match(pattern, email))


def login_check(username: str, password: str):
    if not check_username(username):
        print("Username failed")
        return False
    if not check_password(password):
        print("Password failed")
        return False
    user = get_user_by_name(username)
    if user is not None:
        if user.validate_password(password):
            return 1, user  # 找到用户并且密码正确，允许登录
        else:
            return 0, None  # 密码错误
    else:
        return -1, user  # 用户不存在


def register_check(username: str, password: str, email: str):
    """注册前的检查

    Args:
        username (str): 待判断的用户名
        password (str): 待判断的密码
        email (str): 待判断的邮箱地址

    Returns:
        _type_: _description_
    """
    # 检查用户名、密码、邮箱（如果非空）是否符合格式要求
    if not check_username(username):
        print("Username failed")
        return False
    if not check_password(password):
        print("Password failed")
        return False
    if email != "" and not check_email(email):
        print("Email failed")
        return False
    # 查询 User 中是否已经存在以 username 为用户名的用户
    if get_user_by_name(username) is not None:
        print("Exist user")
        return 0  # 用户名存在
    return 1  # 注册验证通过


""" 字段更改 """


def modify_username(user: User, new_username: str) -> int:
    if user is None:
        err_msg = f'Error: user not exists!'
        logging.error(err_msg)
        print(err_msg)
        return -1
    if new_username == user.username:
        return 1  # 不进行修改
    if get_user_by_name(new_username) is not None:
        err_msg = f'Error: user of name {new_username} already exists!'
        logging.error(err_msg)
        print(err_msg)
        return 0
    # 执行修改
    user.username = new_username
    db.session.commit()
    return 1


def modify_username_byid(user_id: int, new_username: str) -> int:
    user = get_user(user_id)
    return modify_username(user, new_username)


def modify_password(user: User, original_password: str, new_password: str) -> int:
    if user is None:
        return 0
    if not user.validate_password(original_password):  # 验证密码
        return 0
    # * 修改密码
    user.set_password(new_password)
    # * 执行修改操作
    db.session.commit()
    return 1


def modify_password_byid(user_id: int, original_password: str, new_password: str) -> int:
    user = get_user(user_id)
    return modify_password(user, original_password, new_password)


def modify_email(user: User, new_email: str):
    if user is None:
        return 0
    # * 修改邮箱
    user.set_email(new_email)
    # * 执行修改操作
    db.session.commit()
    return 1


def modify_email_byid(user_id: int, new_email: str):
    user = get_user(user_id)
    return modify_email(user, new_email)


def modify_userinfo(user: User, new_username: str, new_email: str) -> int:
    if user is None:
        err_msg = f'Error: user not exists!'
        logging.error(err_msg)
        print(err_msg)
        return -1
    stat_code1 = modify_username(user, new_username)
    if stat_code1 != 1:
        err_msg = f'Error: modify username failed!'
        logging.error(err_msg)
        print(err_msg)
        return stat_code1
    session['username'] = new_username
    stat_code2 = modify_email(user, new_email)
    if stat_code2 != 1:
        err_msg = f'Error: modify email failed!'
        logging.error(err_msg)
        print(err_msg)
        return stat_code2
    return 1


def modify_userinfo_byid(user_id: int, new_username: str, new_email: str) -> int:
    user = get_user(user_id)
    return modify_userinfo(user, new_username, new_email)


def modify_nickname(user: User, new_nickname: str):
    if user is None:
        return False
    # * 修改昵称
    user.set_nickname(new_nickname)
    # * 执行修改操作
    db.session.commit()
    return True


def modify_nickname_byid(user_id: int, new_nickname: str):
    user = get_user(user_id)
    return modify_nickname(user, new_nickname)


""" 数据库交互 """


def register_user(username: str,
                  password: str,
                  email: str = "",
                  verbose: bool = False):
    """注册一个新用户

    Args:
        username (str): _description_
        password (str): _description_
        email (str, optional): _description_. Defaults to "".
        verbose (bool, optional): _description_. Defaults to False.

    Returns:
        _type_: _description_
    """
    # 创建一个新用户
    register_stat_code = register_check(username, password, email)
    if register_stat_code != 1:
        return register_stat_code
    new_user = User(username=username)
    new_user.set_password(password)
    new_user.set_email(email)
    new_user.set_userspace(username)
    # 执行添加用户操作
    db.session.add(new_user)
    db.session.commit()
    if verbose:
        show_user(new_user)
    return 1


# def unregister_user(username: str, password: str):
#     """注销一个已注册的用户
#
#     Args:
#         username (str): _description_
#         password (str): _description_
#
#     Returns:
#         _type_: _description_
#     """
#     # 删除前检查用户是否合法
#     user = get_user_by_name(username)
#     if user is None:
#         return 0
#     if not user.validate_password(password):
#         return 0
#     show_user(user)
#     # 执行删除用户操作
#     db.session.delete(user)
#     db.session.commit()
#     return 1

def unregister_user(username: str):
    user = get_user_by_name(username)
    if user is None:
        return 0
    show_user(user)
    # 首先删除用户空间目录
    print(f'user_space of {username}: ', user.userspace)
    user_space = user.userspace
    if os.path.exists(user_space):
        try:
            shutil.rmtree(user_space)
        except IOError:
            err_msg = f'Remove user_space {user_space} failed!'
            print(err_msg)
            logging.error(err_msg)
            return err_msg
    # 执行删除用户操作
    db.session.delete(user)
    db.session.commit()
    return 1


""" Table 关联 """


def update_collections_status(user):
    if user is None:
        return False
    collections = user.collections
    for collection in collections:
        if collection.end_date < datetime.datetime.now():
            new_status = collection.FINISHED  # 标记为已截止
        else:
            new_status = collection.RELEASE  # 标记为进行中
        # * 更新状态
        collection.status = new_status
    # * 提交更改
    db.session.commit()
    return True


def update_collections_status_byid(user_id: int):
    user = get_user(user_id)
    stat_code = update_collections_status(user)
    return stat_code


def add_collection_for_user(collection_info: list, user: User):
    pass


def add_collection_for_user_byid(collection_info: list, user_id: int):
    user = get_user(user_id)
    return add_collection_for_user(collection_info, user)


def get_collections_info_of_user(user) -> list[dict]:
    if user is None:
        return None
    # 创建 collection_info_dict_list
    collection_info_dict_list = list()
    for collection in user.collections:
        # 创建 collection_info_dict
        collection_info_dict = c_utils.get_collection_info(collection,
                                                           with_sharelink=True,
                                                           with_submitcount=True)
        # 将 collection_info_dict 添加到 collection_info_dict_list
        collection_info_dict_list.append(collection_info_dict)

    # 返回 collection_info_dict_list
    return collection_info_dict_list


def get_collections_info_of_user_byid(u_id: int) -> list[dict]:
    user = get_user(u_id)
    return get_collections_info_of_user(user)
