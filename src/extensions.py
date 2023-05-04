import os

from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache

""" 数据库初始化 """
# db = SQLAlchemy(app)  # 初始化扩展，传入程序实例 app
db = SQLAlchemy()

""" 缓存初始化 """
cache = Cache()

""" 文件路径设置 """
APP_FILE = os.path.join(os.path.dirname(__file__), 'storage')  # 文件存储路径 src/storage/
APP_LOG = os.path.join(os.path.dirname(__file__), 'logs')  # 日志存储路径 src/logs
APP_CACHE = os.path.join(os.path.dirname(__file__), 'caches')  # 文件缓存目录 src/caches

""" Session 配置 """
# sess = Session()
