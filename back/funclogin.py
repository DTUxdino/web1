from flask import session, redirect, url_for, render_template, request
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['username'] = user.username
            return redirect(url_for('dashboard'))
        else:
            error = 'Sai tên đăng nhập hoặc mật khẩu!'
            return render_template('auth.html', error=error)
    return render_template('auth.html')

def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            error = 'Tên đăng nhập đã tồn tại!'
            return render_template('auth.html', error=error)
        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        msg = 'Đăng ký thành công! Đăng nhập ngay!'
        return render_template('auth.html', message=msg)
    return render_template('auth.html')