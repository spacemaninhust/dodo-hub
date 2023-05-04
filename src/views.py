from src import app
from flask import render_template
from flask import session, jsonify, make_response
import src.utils.user as user_utils


@app.route('/test')
def test():
    return "This is a test message. You shouldn't see it on production environment!"


@app.route('/')
def index():
    return render_template('index.html')
