import os
import logging
import mimetypes
import zipfile
import pandas as pd

from flask import Response


def generate_excel(due_list: list,
                   submitted_list: list,
                   excel_name: str = 'statistics',
                   excel_path: str = './'):
    submit_status = [
        '已提交' if name in submitted_list else '未提交' for name in due_list
    ]
    excel_path = os.path.join(excel_path, excel_name)
    df = pd.DataFrame({'成员名单': due_list, '提交状态': submit_status})
    try:
        df.to_excel(excel_path, sheet_name='提交情况', index=False)
    except IOError:
        logging.error(f"Generate excel failed! Target path: {excel_path}.")


def make_response_header(file_path: str, file_name: str):
    """生成文件返回头
    """
    f = open(os.path.join(file_path, file_name), 'rb')
    response = Response(f.readlines())
    mime_type = mimetypes.guess_type(file_name)[0]
    response.headers['Content-Type'] = mime_type
    response.headers['Content-Disposition'] = 'attachment; filename={}'.format(
        file_name.encode().decode('latin-1'))
    return response


def generate_zip(to_zip: str, zip_name: str):
    """压缩文件夹
    
    Args:
        to_zip (str): 待压缩的目录
        zip_name (str): 生成的压缩文件名称
        
    Returns:
        __type__: ...
    """
    # * 1. 判断输出 zip_name 的上级目录是否存在，如不存在则创建目录
    save_zip_dir = os.path.split(os.path.abspath(zip_name))[0]
    if not os.path.exists(save_zip_dir):
        logging.info(
            f"Save zip dir doesn't exist. System will create dir: {save_zip_dir}"
        )
        os.makedirs(save_zip_dir)
    f = zipfile.ZipFile(os.path.abspath(zip_name), 'w', zipfile.ZIP_DEFLATED)
    # * 2. 判断将被压缩的 to_zip 是目录还是文件，如为目录则压缩其下的所有目录和文件，如为文件则直接压缩
    if not os.path.isdir(os.path.abspath(to_zip)):
        # 如果是文件
        if os.path.exists(os.path.abspath(to_zip)):
            f.write(to_zip)
            f.close()
            logging.info(f"Zip file: {to_zip} to {zip_name}.")
        else:
            logging.error(
                f"Zip file: {os.path.abspath(to_zip)} doesn't exist!")
    else:
        # 如果是目录
        if os.path.exists(os.path.abspath(to_zip)):
            zip_list = list()
            # 准备需要压缩的目录和文件
            for cur_dir, sub_dirs, files in os.walk(to_zip):
                for file_item in files:
                    zip_list.append(os.path.join(cur_dir, file_item))
                for dir_item in sub_dirs:
                    zip_list.append(os.path.join(cur_dir, dir_item))
            # 进行压缩
            for zip_item in zip_list:
                # 减少一层压缩目录，即不包括 to_zip 目录
                f.write(zip_item, zip_item.replace(to_zip, ''))
            f.close()
            logging.info(f"Zip dir: {to_zip} to {zip_name}.")
        else:
            logging.error(f"Zip dir: {os.path.abspath(to_zip)} doesn't exist!")
