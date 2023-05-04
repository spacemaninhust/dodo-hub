# -*- coding: UTF-8 -*-
"""
@Project: dodoco-hub 
@File   :file.py
@Date   :2023/4/18 15:46 
@DESC   :
"""
import os
import re
import shutil
import logging

from src.extensions import cache
from src.extensions import APP_CACHE

# 默认 CACHE_DIR 使用 APP_CACHE，即 src/caches 目录
CACHE_DIR = APP_CACHE


def generate_cache_name(c_id: int, q_seq: int, file_name: str):
    return f'CID_{c_id}_QSEQ_{q_seq}_{file_name}'


def get_matched_files(match_rule: str, match_dir: str = CACHE_DIR) -> list[str]:
    """获取符合匹配规则的文件的文件名

    Args:
        match_rule (str): 匹配规则
        match_dir (str): 匹配目录

    Returns:
        list[str]: 符合匹配规则的文件名列表
    """
    file_name_list = os.listdir(match_dir)
    match_rule = match_rule + '.*'
    pattern = re.compile(match_rule)
    matched_file_name_list = list()  # 匹配到的文件名列表
    for file_name in file_name_list:
        if re.match(pattern, file_name):
            matched_file_name_list.append(file_name)
    return matched_file_name_list


def save_file(cache_name: str, cache_prefix: str, save_path: str):
    """保存文件到指定目录

    将缓存目录下的文件移动到真实保存目录下

    Args:
        cache_name: 缓存文件名
        cache_prefix: 缓存文件的前缀
        save_path: 文件保存的目录

    Returns:
        bool: 保存成功返回 True，否则返回 False
    """
    cache_path = os.path.join(CACHE_DIR, cache_name)
    real_name = cache_name.strip(cache_prefix)  # 删掉缓存前缀得到原文件名
    real_path = os.path.join(CACHE_DIR, real_name)
    if not os.path.isfile(cache_path):
        logging.error(f"File {cache_name} not exist!")
        print(f"File {cache_name} not exist!")
        return False
    if not os.path.exists(save_path):
        print(f"Save path {save_path} not exist, will create dir.")
        os.mkdir(save_path)
    os.rename(cache_path, real_path)
    shutil.move(real_path, save_path)
    return True


def upload_file(file, cache_name: str):
    """上传文件

    将上传的文件暂时缓存在 src/caches 目录下，超时时间为 10 分钟

    Args:
        file: 待缓存的文件
        cache_name (str): 缓存文件名称

    Returns:
        __type__: None
    """
    print("CACHE_DIR: ", CACHE_DIR)
    if not os.path.exists(CACHE_DIR):
        print(f"CACHE_DIR {CACHE_DIR} not exist, will mkdir.")
        os.mkdir(CACHE_DIR)
    save_dir = os.path.join(CACHE_DIR, cache_name)
    print("SAVE_DIR: ", save_dir)
    file.save(save_dir)


def delete_file(c_id: int, q_seq: int, file_name: str):
    cache_name = generate_cache_name(c_id, q_seq, file_name)
    if not os.path.isfile(os.path.join(CACHE_DIR, cache_name)):
        msg = f"File {cache_name} not exist!"
        logging.error(msg)
        print(msg)
        return msg
    try:
        os.remove(os.path.join(CACHE_DIR, cache_name))
    except IOError:
        msg = f"Remove cached file {cache_name} failed!"
        logging.error(msg)
        print(msg)
        return msg
    msg = f"Remove cached file {cache_name} succeeded!"
    print(msg)
    return msg
