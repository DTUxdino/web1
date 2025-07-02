from flask import session, redirect, url_for, render_template, make_response

subjects = [
    {"name": "Toán Rời Rạc Và Ứng Dụng", "slug": "toanroirac", "icon": "fa-solid fa-calculator"},
    {"name": "Kinh Tế Chính Trị Mác-Lênin", "slug": "kinhtechinhtri", "icon": "fa-solid fa-scroll"},
    {"name": "Tư Tưởng Hồ Chí Minh", "slug": "tutuonghochiminh", "icon": "fa-solid fa-brain"},
    {"name": "Xử Lí Tín Hiệu Số", "slug": "xulitinhieuso", "icon": "fa-solid fa-chart-line"},
    {"name": "Probability Theory, Random Processes and Statistical Inference", "slug": "xacsuatthongke", "icon": "fa-solid fa-chart-area"},
    {"name": "Linear Algebra for Data Science", "slug": "daisotuyentinh", "icon": "fa-solid fa-divide"},
    {"name": "Cơ Sở Dữ Liệu", "slug": "database", "icon": "fa-solid fa-database"},
    {"name": "Hệ Điều Hành Linux", "slug": "linux", "icon": "fa-brands fa-linux"}
    
]

subjects_map = {
    'toanroirac': 'mth254.html',
    'database' : 'is301.html',
    'kinhtechinhtri' : 'pos151.html',
    'linux' : 'cs226.html',
    'tutuonghochiminh' : 'pos361.html',
    'xulitinhieuso' : 'ee304.html',
    'xacsuatthongke' : 'sta285.html',
    'daisotuyentinh' : 'mth383.html'
}
def dashboard_route():
    if 'username' not in session:
        return redirect(url_for('auth'))
    resp = make_response(render_template('dashboard.html', subjects=subjects))
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp

def logout():
    session.pop('username', None)
    return redirect(url_for('auth'))

def quiz(subject):
    if 'username' not in session:
        return redirect(url_for('auth'))
    resp = make_response(render_template("quiz.html", subject=subject))
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp

def subject_detail(subject_slug):
    if 'username' not in session:
        return redirect(url_for('auth'))
    template = subjects_map.get(subject_slug)
    if template:
        resp = make_response(render_template(template))
    else:
        resp = make_response(render_template('quiz.html', subject=subject_slug))
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp