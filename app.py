import os
from flask import Flask, render_template, request, session, redirect, url_for
from models import db, User
from back.funclogin import login, register
from back.funcdash import dashboard_route, logout, subjects_map

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///users.sqlite3')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/', methods=['GET'])
def home():
    if 'username' not in session:
        return redirect(url_for('auth'))
    return redirect(url_for('dashboard'))

@app.route('/auth', methods=['GET'])
def auth():
    return render_template('auth.html')

@app.route('/login', methods=['POST'])
def login_route():
    return login()

@app.route('/register', methods=['POST'])
def register_route():
    return register()

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('auth'))
    return dashboard_route()

@app.route('/logout')
def logout_route():
    session.pop('username', None)
    return redirect(url_for('auth'))

@app.route('/subject/<subject_slug>')
def subject_detail(subject_slug):
    if 'username' not in session:
        return redirect(url_for('auth'))
    template = subjects_map.get(subject_slug)
    if template:
        return render_template(template)
    return render_template('quiz.html', subject=subject_slug)

if __name__ == '__main__':
    app.run(debug=True)