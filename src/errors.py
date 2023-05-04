from flask import render_template

from src import app


@app.errorhandler(404)
def page_not_found(err: str):
    return '??? What are you doing ???'
