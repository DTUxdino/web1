let questions = [];
let current = 0;
let userAnswers = [];
let quizDone = false;

// Chuẩn hóa tiếng Việt, loại dấu, chữ thường, bỏ dấu câu
function normalizeVN(str) {
    if (!str) return "";
    return str
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // loại dấu tiếng Việt
        .replace(/[.,?!;:()\[\]{}"']/g, '') // loại dấu câu
        .replace(/\s+/g, ' ')               // loại khoảng trắng thừa
        .toLowerCase()
        .trim();
}

// Chấm điểm cho câu hỏi short answer
function isShortAnswerCorrect(question, userAnswer) {
    if (!question.keywords || !Array.isArray(question.keywords)) return false;
    const answerNorm = normalizeVN(userAnswer);
    // Tính số từ khóa đúng (80% hoặc tuỳ chỉnh)
    let matched = 0;
    for (let kw of question.keywords) {
        const kwNorm = normalizeVN(kw);
        if (answerNorm.includes(kwNorm)) matched++;
    }
    return matched / question.keywords.length >= 0.8; // 80% từ khóa đúng
}

async function loadQuestions() {
    const res = await fetch(QUESTIONS_URL);
    questions = await res.json();
    renderQuestion();
    updateProgress();
}

function showDialog(message) {
    document.getElementById('dialog-message').textContent = message;
    document.getElementById('dialog').style.display = 'flex';
}
document.getElementById('dialog-close').onclick = function() {
    document.getElementById('dialog').style.display = 'none';
};

function renderQuestion() {
    if (!questions.length) return;
    const q = questions[current];
    const questionArea = document.querySelector('.question-area');
    let inputHtml = "";
    // Nếu là câu hỏi short answer
    if (q.type === "short") {
        let prev = userAnswers[current] || "";
        inputHtml = `
            <div class="short-answer">
                <input type="text" id="short-answer" placeholder="Nhập câu trả lời..." value="${prev}" autocomplete="off" style="width:100%;padding:10px;font-size:1rem;border-radius:6px;border:1px solid #bbb;">
            </div>
        `;
        questionArea.innerHTML = `
            <div class="question-number">Câu hỏi ${current + 1} / ${questions.length}</div>
            <div class="question-text">${q.q}</div>
            ${inputHtml}
        `;
        // Lưu câu trả lời ngắn mỗi khi nhập
        document.getElementById('short-answer').oninput = function() {
            userAnswers[current] = this.value;
        };
    } else {
        // Câu hỏi trắc nghiệm
        let optsHtml = '';
        // Hỗ trợ cả .op hoặc .opts
        let opts = q.opts || q.op;
        for (const [key, value] of Object.entries(opts)) {
            let selected = userAnswers[current] === key ? "selected" : "";
            optsHtml += `<button class="option ${selected}" data-opt="${key}">${key}. ${value}</button>`;
        }
        questionArea.innerHTML = `
            <div class="question-number">Câu hỏi ${current + 1} / ${questions.length}</div>
            <div class="question-text">${q.q}</div>
            <div class="options">${optsHtml}</div>
        `;
        document.querySelectorAll('.option').forEach(btn => {
            btn.onclick = () => selectOption(btn, btn.dataset.opt);
        });
    }
    updateProgress();
    updateNav();
}

function selectOption(btn, opt) {
    if (quizDone) return;
    userAnswers[current] = opt;
    document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function updateNav() {
    document.getElementById('prevBtn').disabled = current === 0;
    document.getElementById('nextBtn').textContent = current === questions.length - 1 ? "Nộp bài" : "Tiếp";
}

function updateProgress() {
    const progress = document.querySelector('.progress');
    progress.style.width = ((current + 1) / questions.length * 100) + "%";
}

document.getElementById('prevBtn').onclick = () => {
    if (current > 0) {
        current--;
        renderQuestion();
    }
};

document.getElementById('nextBtn').onclick = () => {
    if (quizDone) return;
    // Kiểm tra đã trả lời chưa
    const q = questions[current];
    if (q.type === "short") {
        if (!userAnswers[current] || userAnswers[current].trim() === "") {
            showDialog("Bạn hãy nhập câu trả lời trước khi tiếp tục!");
            return;
        }
    } else {
        if (typeof userAnswers[current] === "undefined") {
            showDialog("Bạn hãy chọn đáp án trước khi tiếp tục!");
            return;
        }
    }
    if (current === questions.length - 1) {
        finishQuiz();
    } else {
        current++;
        renderQuestion();
    }
};

function finishQuiz() {
    quizDone = true;
    let score = 0;
    let html = "";
    questions.forEach((q, i) => {
        if (q.type === "short") {
            // Chấm câu ngắn
            let user = userAnswers[i] || "";
            let correct = isShortAnswerCorrect(q, user);
            html += `<div>
                <div style="margin-bottom:4px;"><b>Câu ${i + 1}:</b> ${q.q}</div>
                <div>
                    Đáp án của bạn: 
                    <span class="${correct ? 'correct' : 'incorrect'}">
                        ${user !== "" ? user : "<i>Chưa trả lời</i>"}
                    </span>
                    <br>
                    Từ khóa đúng: <b>${q.keywords.join(", ")}</b>
                </div>
                <hr>
            </div>`;
            if (correct) score++;
        } else {
            // Chấm trắc nghiệm
            const correct = q.ans || q.a;
            const user = userAnswers[i];
            // Hỗ trợ .opts hoặc .op
            let opts = q.opts || q.op;
            const correctText = opts[correct];
            html += `<div>
                <div style="margin-bottom:4px;"><b>Câu ${i + 1}:</b> ${q.q}</div>
                <div>
                    Đáp án của bạn: 
                    <span class="${user === correct ? 'correct' : 'incorrect'}">
                        ${user ? user + ". " + opts[user] : "<i>Chưa chọn</i>"}
                    </span>
                    <br>
                    Đáp án đúng: <b>${correct}. ${correctText}</b>
                </div>
                <hr>
            </div>`;
            if (user === correct) score++;
        }
    });
    html = `<div>Bạn đúng <b>${score}/${questions.length}</b> câu.</div><br>` + html;
    document.querySelector('.score-area').innerHTML = html;
    document.querySelector('.score-area').style.display = "block";
    document.querySelector('.question-area').style.display = "none";
    document.querySelector('.navigation').style.display = "none";
    document.querySelector('.progress-bar').style.display = "none";
}

window.onload = loadQuestions;