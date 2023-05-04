# -*- coding: UTF-8 -*-
"""
@Project: dodoco-hub 
@File   :submit.py
@Date   :2023/4/19 8:48 
@DESC   :
"""

from datetime import datetime

from src.models import Submission, SubmitContentInfo

from src.extensions import db

""" 数据库交互 """


def get_submission(s_id: int):
    submission = Submission.query.filter_by(id=s_id).first()
    return submission


def get_submit_content_info(sc_id: int):
    submit_content_info = SubmitContentInfo.query.filter_by(id=sc_id).first()
    return submit_content_info


def create_submission(submitter_name: str, submit_time: datetime, commit: bool = False):
    submission = Submission()
    submission.submitter_name = submitter_name
    submission.submit_time = submit_time
    if commit:
        db.session.add(submission)
        db.session.commit()
    return submission


def create_submission_content(result: str, commit: bool = False):
    submit_content = SubmitContentInfo()
    if commit:
        db.session.add(submit_content)
        db.session.commit()
    return submit_content
