import os
import sys

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# SQLite URL conpatible
prefix = 'sqlite:///' if sys.platform.startswith('win') else 'sqlite:////'


class BaseConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret string')

    MAIL_SERVER = os.getenv('MAIL_SERVER')
    # MAIL_PORT =


class DevelopmentConfig(BaseConfig):
    SESSION_TYPE = 'filesystem'
    SQLALCHEMY_DATABASE_URI = prefix + os.path.join(BASE_DIR, 'data.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_URL = "redis://localhost"
    # ! TEST
    CACHE_TYPE = 'FileSystemCache'
    CACHE_DIR = './caches'
    CACHE_DEFAULT_TIMEOUT = 600


class TestingConfig(BaseConfig):
    TESTING = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///'  # in-memory database
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', prefix + os.path.join(BASE_DIR, 'data.db'))


configs = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
}
