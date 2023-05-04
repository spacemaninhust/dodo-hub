import os
import string
import random
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from src import db
from src.extensions import APP_FILE


class User(db.Model, UserMixin):
    """用户

    Attributes:
        id (db.Interger): 自增主键
        username (db.String): 用户名（非空，不可重复）
        nickname (db.String, optional): 昵称
        psw_hash (db.String): 密码散列值（非空）
        email (db.String, optional): 邮箱地址
        userspace (db.String): 用户空间路径（非空，不可重复）
    
    Methods:
        set_password(str): 设置密码
        validate_password(str) -> bool: 验证密码
        set_email(str): 设置邮箱地址
        set_userspace(): 设置用户空间路径
    """
    id = db.Column(db.Integer, primary_key=True)  # 主键
    username = db.Column(db.String(30), nullable=False, unique=True)  # 用户名
    nickname = db.Column(db.String(30))  # 昵称 (optional)
    psw_hash = db.Column(db.String(128), nullable=False)  # 密码散列值
    email = db.Column(db.String(30))  # 邮箱 (optional)
    userspace = db.Column(db.String(50), nullable=False, unique=True)  # 用户空间路径

    # * 用户 —— 收集 1:n
    collections = db.relationship('Collection', back_populates='creator', cascade='all')

    def set_password(self, password: str):
        """设置密码

        根据用户输入的密码生成密码散列值

        Args:
            password (str): 明文密码
        """
        self.psw_hash = generate_password_hash(password)

    def validate_password(self, password: str) -> bool:
        """验证密码

        判断用户输入的密码是否正确
        
        Args:
            password (str): 输入的密码

        Returns:
            bool: True - 密码正确; False - 密码错误
        """
        return check_password_hash(self.psw_hash, password)

    def set_email(self, email: str):
        """设置邮箱地址

        Args:
            email (str): 邮箱地址
        """
        self.email = email

    def set_userspace(self, username: str):
        """设置用户空间路径
        
        采用一定的规则生成不可重复的路径
        
        """

        def generate_userspace(username: str):
            userspace = username + ''.join(random.sample(
                string.ascii_letters + string.digits,
                30 - len(username)
            ))
            return os.path.join(APP_FILE, userspace)

        self.userspace = generate_userspace(username)
        if not os.path.exists(self.userspace):
            os.mkdir(self.userspace)


class Collection(db.Model):
    """收集

    Attributes:
        id (db.Integer): 自增主键
        title (db.String): 标题
        collector_name (db.String): 收集者姓名
        description (db.String): 描述
        start_date (db.DateTime): 创建时间
        end_date (db.DateTime): 结束时间
        status (db.Enum): 收集状态
        namelist (db.Text): 应交名单（用 ',' 分隔）
        collection_path (db.String): 收集存放路径

    Methods:
        is_valid() -> bool: 收集是否已截止
    """
    # * 收集状态常量（发布、暂存、结束、失效）
    RELEASE, SAVED, FINISHED, OVERDUE = map(str, range(4))

    id = db.Column(db.Integer, primary_key=True)  # 主键
    title = db.Column(db.String(50), nullable=False)  # 标题
    collector_name = db.Column(db.String(30))  # 收集者姓名
    description = db.Column(db.Text, nullable=False)  # 描述
    start_date = db.Column(db.DateTime, nullable=False)  # 创建时间
    end_date = db.Column(db.DateTime, nullable=False)  # 结束时间
    status = db.Column(db.Enum(
        RELEASE, SAVED, FINISHED, OVERDUE
    ), nullable=False)  # 收集状态
    namelist = db.Column(db.Text)  # 应交名单
    collection_path = db.Column(db.String(50))  # 收集存放路径

    # * 用户 —— 收集 1:n
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # 创建者 ID
    creator = db.relationship('User', back_populates='collections')

    # * 收集 —— 题目 1:n
    questions = db.relationship('Question', back_populates='collection', cascade='all')

    # * 收集 —— 提交 1:n
    submissions = db.relationship('Submission', back_populates='collection', cascade='all')

    def set_title(self, title: str):
        self.title = title

    def set_collector_name(self, collector_name: str):
        self.collector_name = collector_name

    def set_description(self, description: str):
        self.description = description

    def set_start_date(self):
        self.start_date = datetime.now().replace(microsecond=0)

    def set_end_date(self, end_date):
        self.end_date = end_date

    def set_status(self, status=SAVED):
        self.status = status

    def set_namelist(self, name_list: list[str]):
        self.namelist = ','.join(name_list)

    def is_valid(self):
        cur_date = datetime.now()
        return cur_date < self.end_date

    def set_collection_path(self):
        # self.collection_path = os.path.join(self.creator.userspace, self.id)
        self.collection_path = os.path.join(
            str(self.creator.userspace),
            'col_' + str(self.id)
        )
        if not os.path.exists(self.collection_path):
            os.mkdir(self.collection_path)

    def get_submission_count(self) -> int:
        return len(self.submissions)

    def get_file_count(self) -> int:
        file_count = 0
        for root, dirs, files in os.walk(self.collection_path):
            file_count += len(files)

        return file_count

    def get_namelist(self) -> list[str]:
        if self.namelist is None:
            return list()
        return str(self.namelist).split(',')


class Question(db.Model):
    """题目

    Attributes:
        id (db.Integer): 自增主键
        seq_num (db.Integer): 题目序号
        q_type (db.Enum): 题目类型
        title (db.String): 标题
        description (db.Text): 描述
        rename_rule (db.Text): 重命名规则
        upload_path (db.String): 文件上传路径
    
    Methods:
        ...
    """
    # * 题目类型常量（单选、多选、简答、文件）
    SINGLE_CHOICE, MULTI_CHOICE, FILL_IN, FILE_UPLOAD = map(str, range(4))

    id = db.Column(db.Integer, primary_key=True)  # 主键
    seq_num = db.Column(db.Integer, nullable=False)  # 题目序号
    q_type = db.Column(db.Enum(
        SINGLE_CHOICE, MULTI_CHOICE, FILL_IN, FILE_UPLOAD
    ), nullable=False)  # 题目类型
    require = db.Column(db.Boolean, default=False)  # ! 是否必填
    title = db.Column(db.String(50), nullable=False)  # 标题
    description = db.Column(db.Text)  # 描述
    rename_rule = db.Column(db.Text)  # 重命名规则（题目序号列表）
    upload_path = db.Column(db.String(50), unique=True)  # 文件上传路径

    # * 收集 —— 题目 1:n
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'))
    collection = db.relationship('Collection', back_populates='questions')

    # * 题目 —— 答案 1:1
    answer = db.relationship('Answer', uselist=False, cascade='all')

    # * 题目 —— 选项 1:n
    options = db.relationship('Option', back_populates='question', cascade='all')

    # * 题目 —— 提交信息 1:n
    submit_content_infos = db.relationship('SubmitContentInfo', back_populates='question', cascade='all')

    def set_seq_num(self, seq_num: int):
        self.seq_num = seq_num

    def set_q_type(self, q_type):
        self.q_type = q_type

    def set_require(self, require: int):
        self.require = True if require == 1 else False

    def set_title(self, title: str):
        self.title = title

    def set_description(self, description: str):
        self.description = description

    def set_rename_rule(self, rename_rule: str):
        self.rename_rule = rename_rule

    def set_upload_path(self):
        if self.q_type == Question.FILE_UPLOAD and self.upload_path is None:
            self.upload_path = os.path.join(
                str(self.collection.collection_path),
                # f'file_{int(self.seq_num)}'
                f'ques_{int(self.id)}'
            )


class Answer(db.Model):
    """答案

    Attributes:
        id (db.Integer): 自增主键
        ans_option (db.Text): 答案选项
    """
    id = db.Column(db.Integer, primary_key=True)  # 主键
    ans_option = db.Column(db.Text, nullable=False)  # 答案选项

    # * 题目 —— 答案 1:1
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    question = db.relationship('Question', back_populates='answer')

    def set_ans_option(self, ans_option: str):
        self.ans_option = ans_option


class Option(db.Model):
    """选项

    Attributes:
        id (db.Integer): 自增主键
        content (db.Text): 选项内容
    """
    id = db.Column(db.Integer, primary_key=True)  # 主键
    option_code = db.Column(db.Integer, nullable=False)  # 选项代号
    content = db.Column(db.Text, nullable=False)  # 选项内容

    # * 题目 —— 选项 1:n
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    question = db.relationship('Question', back_populates='options')

    def set_option_code(self, option_code: int):
        self.option_code = option_code

    def set_content(self, content: str):
        self.content = content


class Submission(db.Model):
    """提交

    Attributes:
        id (db.Integer): 自增主键

    """
    id = db.Column(db.Integer, primary_key=True)
    submitter_name = db.Column(db.String(30))
    submitter_snum = db.Column(db.String(30))
    submit_time = db.Column(db.DateTime, nullable=False, default=datetime.now())

    # * 收集 —— 提交 1:n
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'))
    collection = db.relationship('Collection', back_populates='submissions')

    # * 提交 —— 提交信息 1:n
    submit_content_infos = db.relationship('SubmitContentInfo', back_populates='submission', cascade='all')


class SubmitContentInfo(db.Model):
    """提交信息

    Attributes:
        id (db.Integer): 自增主键
        result (db.String): 填写结果
    """
    id = db.Column(db.Integer, primary_key=True)
    result = db.Column(db.String(50))

    # * 提交 —— 提交信息 1:n
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'))
    submission = db.relationship('Submission', back_populates='submit_content_infos')

    # * 题目 —— 提交信息 1:n
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    question = db.relationship('Question', back_populates='submit_content_infos')

    def set_result(self, result: str):
        self.result = result

    def get_submit_path(self):
        return os.path.join(self.question.upload_path, f'subm_{self.submission_id}')
