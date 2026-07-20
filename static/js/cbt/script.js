import * as API from "./api.js"

// script.js
let currentUser = null;
let currentExam = null;
let questions = [];
let examList = [];
let currentQuestionIndex = 0;
let answers = [];
let timerInterval = null;
let examStartTime = null;
let examDurationMinutes = 0;
let examStatus = ""


function showLoader(text="Loading...") {
  $(".loader-text").html(text)
    $('#fullLoader').removeClass('hidden').addClass('flex');
}

function hideLoader() {
    $('#fullLoader').addClass('hidden').removeClass('flex');
}

function showToast(message, type = 'success', timeout=5000) {
            const colors = { success: 'bg-emerald-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
            const toast = $(`
                <div class="toast ${colors[type]} text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 max-w-xs">
                    <span class="fa fa-${type === 'success' ? 'check-circle text-green' : type === 'error' ? 'times-circle text-red' : type === 'warning' ? 'warning text-orange' : 'info-circle text-blue'}"></span>
                    <p class="text-sm font-medium">${message}</p>
                </div>
            `);
            $('#toastContainer').append(toast);
            setTimeout(() => toast.fadeOut(300, () => toast.remove()), timeout);
}

function showAlert(type, title, content, callback=null, cancellable=false) {
    $("#customModalIcon").html(type === "warning" ? "⚠️" : type === "success" ? "✅" : "❌")
    $("#customModalTitle").html(title)
    $('#customModalText').html(content)
    
    $('#customModal').removeClass("hidden")

    if(cancellable) {$("#customModalCancel").removeClass("hidden")}
    else {$("#customModalCancel").addClass("hidden")}

    
    $("#customModalBtn").on('click', () => {
        if(callback !== null) callback();
        $('#customModal').addClass("hidden")
    })

    $("#customModalCancel").on('click', () => {
        $('#customModal').addClass("hidden")
    })
}



async function checkResponse(res) {
    if(res.statusCode && res.statusCode === 401) {
        showToast("Session expired!", "error")
        await cleanupAndReturnToLogin()
        return
    }
}

function capitalize(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}


function showScreen(id) {
    $(".screen").addClass("hidden");
    $(`#${id}`).removeClass("hidden");
}


$("#login-form").on('submit', async(e) => {
    e.preventDefault(); await handleLogin()
})

async function handleLogin() {
    let username = $('#username').val().trim();
    let password = $("#password").val().trim();

    if(!username) {
        showToast("Student ID required!", "error");
        return;
    }
    if(!password) {
        showToast("Password required!", "error");
        return;
    }
    let payload = {username, password}
    showLoader("Logging In...")
    try {
        let data = await API.login(payload);
        //console.log(data)
        if(data.status === "success") {
            showToast("Login successful!", "success")
            currentUser = data.data;
            sessionStorage.setItem("eduka_cbt_user", JSON.stringify(currentUser));
            showScreen("exam-list-screen");
            await loadExamList();
        }
        else {
            showToast(data.message, "error")
        }
    }
    catch(err) {
        showToast(`Error: ${err}`, "error")
    }
    finally {hideLoader()}
}

async function loadExamList() {
    const container = $("#exam-list");
    container.empty();
    showLoader("Loading Exams...")
    try {
        const data = await API.getExams();
        await checkResponse(data)
        //console.log(data)
        if(data.status === "success") {
            examList = data.data;
            examList.forEach(exam => {
                const el = $(`
                    <div data-id="${exam.id}" class="start-exam-btn group bg-white border border-transparent hover:border-[#00529E] p-8 rounded-3xl cursor-pointer transition-all">
                        <div class="font-semibold text-2xl">${exam.course.title} (${capitalize(exam.examType)})</div>
                        <div class="mt-3 text-sm text-gray-500">${exam.duration} mins • ${exam.examId}</div>
                    </div>
                `);
                container.append(el);
            });
            $(".start-exam-btn").on('click', function() {
                let id = $(this).data('id');
                startExam(id)
            })
        }
        else {
            showToast(data.message, "error", 10000)
        }
    }
    catch(err) {
        showToast(`Error: ${err}`, "error", 10000)
    }
    finally {hideLoader()}
}

async function startExam(examId) {
    showLoader("Fetching exam questions...")
    try {
        let data = await API.getExamQuestions(examId);
        //console.log(data)
        await checkResponse(data)
        if(data.status === "success") {
            currentExam = examList.find(e => e.id === examId);
            questions = data.data;
            currentQuestionIndex = 0;
            sessionStorage.removeItem(`answers_${examId}`);
            let default_answers = [];
            questions.map((item, index) => {
                let ans_obj = {
                    number: item.number, selected_answer: ""
                }
                default_answers.push(ans_obj)
            })
            answers = JSON.parse(sessionStorage.getItem(`answers_${examId}`) || JSON.stringify(default_answers));
            //console.log(answers)
            examStartTime = Date.now();
            sessionStorage.setItem(`start_${examId}`, examStartTime);
            examDurationMinutes = currentExam.duration;

            $("#exam-title").html(`${currentExam.course.title} ${currentExam.examType}`)
            
            showScreen("exam-screen");
            renderCurrentQuestion();
            await loadProfile()
            startTimer();
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
        }
        else {
            showToast(data.message, "error", 10000)
        }
    }
    catch(err) {
        showToast(`Error: ${err}`, "error", 10000)
    }
    finally {hideLoader()}
}

function renderQuestionNavigator() {
    const nav = $("#question-navigator");
    nav.empty();
    questions.forEach((_, i) => {
        let ans = answers.find(a => a.number == questions[i].number);
        const answered = ans["selected_answer"] !== "";
        const current = i === currentQuestionIndex;
        let cls = 'q-btn';
        if (current) cls += ' current';
        else if (answered) cls += ' answered';
        else cls += ' unanswered';
        const btn = $(`<div data-id="${i}" class="jump-btn ${cls}">${i+1}</div>`);
        nav.append(btn);
    });

    $(".jump-btn").on('click', function() {
        let ind = $(this).data('id')
        jumpToQuestion(ind)
    })
}

function jumpToQuestion(idx) {
    currentQuestionIndex = idx;
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const q = questions[currentQuestionIndex];
    const container = $("#question-container");
    let opts = '';
    q.options.forEach((opt, i) => {
        let ans = answers.find(a => a.number === q.number);
        const sel = ans["selected_answer"] === opt ? 'selected' : '';
        opts += `<div data-id="${q.number}" data-name="${opt}" class="question-option border-2 ${sel} p-6 rounded-2xl text-lg cursor-pointer mb-3">${String.fromCharCode(65+i)}. ${opt}</div>`;
    });
    const prog = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    container.html(`
        <div>
            <div class="flex justify-between mb-8"><span class="px-5 py-2 bg-[#00529E] text-white font-medium rounded-2xl">Q ${currentQuestionIndex + 1} / ${questions.length}</span></div>
            <h2 class="text-2xl font-medium">${q.question}</h2>
            <div class="mt-10">${opts}</div>
        </div>
    `);
    $("#question-counter").text(`Question ${currentQuestionIndex + 1}`);
    $("#progress-text").text(`${prog}%`);
    $("#next-btn").text(currentQuestionIndex === questions.length - 1 ? "Finish" : "Next");
    $(".question-option").on('click', function() {
        let qId = $(this).data('id');
        let opt = $(this).data('name');
        selectAnswer(qId, opt)
    })
    renderQuestionNavigator();
}

async function loadProfile() {
    let user = JSON.parse(sessionStorage.getItem("eduka_cbt_user") || '{}')
    console.log(user)
    $("#profile-container").html(`
    <div class="flex flex-col justify-start items-center gap-4 mb-3">
        <img class="w-[120px] h-[120px] mb-5 border border-slate-300 dark:border-slate-600"
            style="border-radius:50%" 
            src="${user.image ? `${API.BASE_URL}${user.image}` : `/static/image/student.png`}" />
        <h3 class="font-semibold text-xl">STUDENT INFO</h3>
    </div>
    
    <div class="flex gap-2 mb-2">
        <p class="font-semibold">Name:</p>
        <p class="text-slate-500 dark:text-slate-400">${user.firstName} ${user.middleName} ${user.lastName}</p>
    </div>
    <div class="flex gap-2 mb-2">
        <p class="font-semibold">Student ID:</p>
        <p class="text-slate-500 dark:text-slate-400">${user.studentId}</p>
    </div>
    <div class="flex gap-2 mb-2">
        <p class="font-semibold">Class:</p>
        <p class="text-slate-500 dark:text-slate-400">${user.classroom.level.title}</p>
    </div>
    <div class="flex gap-2 mb-2">
        <p class="font-semibold">Gender:</p>
        <p class="text-slate-500 dark:text-slate-400">${capitalize(user.gender)}</p>
    </div>
    <div class="flex gap-2 mb-4">
        <p class="font-semibold">Subject:</p>
        <p class="text-slate-500 dark:text-slate-400">${currentExam.course.title}</p>
    </div>
    <h3 class="font-semibold text-xl mb-3">QUESTIONS</h3>
    `)
}


$("#next-btn").on('click', nextQuestion)
$("#prev-btn").on('click', prevQuestion)
$("#submit-modal-btn").on('click', showSubmitModal)

function selectAnswer(qId, opt) {
    let index = answers.findIndex(a => a.number == qId);
    if(index !== -1) {
        answers[index] = {
            ...answers[index],
            number: qId, 
            selected_answer: opt
        }
    }
    //console.log(answers)
    sessionStorage.setItem(`answers_${currentExam.id}`, JSON.stringify(answers));
    renderCurrentQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
    } else showSubmitModal();
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderCurrentQuestion();
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const saved = sessionStorage.getItem(`start_${currentExam.id}`);
    examStartTime = saved ? parseInt(saved) : Date.now();
    const total = examDurationMinutes * 60 * 1000;
    const tick = () => {
        const rem = Math.max(0, total - (Date.now() - examStartTime));
        const m = Math.floor(rem / 60000);
        const s = Math.floor((rem % 60000) / 1000);
        $('#timer').text(`${m}:${s<10?'0':''}${s}`);
        if (rem <= 0) {
            clearInterval(timerInterval);
            if(examStatus !== "submitting") autoSubmit("Time is Up!");
        }
    };
    tick();
    timerInterval = setInterval(tick, 1000);
}

function showSubmitModal() { $("#submit-modal").removeClass("hidden"); }
function hideSubmitModal() { $("#submit-modal").addClass("hidden"); }


async function autoSubmit(title) {
    showAlert("warning", title, "Your exam will be submitted automatically along with your selected answers.", submitExam)
}


async function submitExam() {
    hideSubmitModal();
    showLoader("Submitting...")
    let payload = {exam_id: currentExam.id, report: answers}
    examStatus = "submitting"
    try {
        let resp = await API.submit(payload)
        if(resp.status === "success") {
            if (timerInterval) clearInterval(timerInterval);
            //showToast("Exam submitted successfully!", "success");
            showAlert("success", "Success", "Exam submitted successfully!", logout)
        }
        else {
            showToast(resp.message, "error", 5000)
        }
    }
    catch(err) {
        showToast(`Error: ${err}`, "error", 5000)
    }
    finally {hideLoader()}
    
}

$("#hide-submit-btn").on('click', hideSubmitModal)
$(".submit-btn").on('click', submitExam)

async function cleanupAndReturnToLogin() {
    if (currentExam) {
        sessionStorage.removeItem(`answers_${currentExam.id}`);
        sessionStorage.removeItem(`start_${currentExam.id}`);
    }
    sessionStorage.removeItem("eduka_cbt_user");
    currentUser = null;
    currentExam = null;
    examList.length = 0
    if (document.exitFullscreen) document.exitFullscreen();
    showScreen("login-screen");
}


$(".logout-btn").on('click', async() => {
    showAlert("warning", "Logout", "Are you sure you want to log out of your current session?", logout, true)
})

async function logout() {
    showLoader("Logging out...")
    try {
        let data = await API.logout();
        //console.log(data)
        if(data.status === "success") {
            showToast("Logout successful", "success")
            await cleanupAndReturnToLogin();
        }
        else {
            showToast(data.message, "error")
        }
    }
    catch(err) {
        showToast(`Error: ${err}`, "error")
    }
    finally {hideLoader()}

}


async function showSchoolInfo() {
    showLoader("Loading data...")
    try {
        let resp = await API.schoolInfo()
        let data = resp.data
        //console.log(data)
        $("title").text(`${data.school_name} CBT`)
          $("meta[name='title']").attr('content', `${data.school_name} CBT`)
          $(".site-title").html(data.school_name)
          if(data.image) {
            $(".site-logo").attr('src', data.image)
            $("link[rel='shortcut']").attr('href', data.image)
            $("link[rel='shortcut icon']").attr('href', data.image)
        }
    }
    catch(err) {
        console.log(err)
    }
    finally {hideLoader()}
}

$(document).ready(async () => {
    await showSchoolInfo()
    const u = sessionStorage.getItem("eduka_cbt_user");
    if (u) {
        currentUser = JSON.parse(u);
        showScreen("exam-list-screen");
        await loadExamList();
    }
    window.addEventListener("beforeunload", e => { 
        if (currentExam) e.preventDefault(); 
    });
});




// Calculator Logic
let calcCurrent = '0';
let calcPrevious = '';
let calcOperator = '';
let shouldResetDisplay = false;


$("#open-calc-btn").on('click', openCalculator)
$("#close-calc-btn").on('click', closeCalculator)

function openCalculator() {
    if ($('#exam-screen').hasClass('hidden')) return;
    $('#calculator-modal').removeClass('hidden');
    resetCalculator();
}

function closeCalculator() {
    $('#calculator-modal').addClass('hidden');
}

function calcInput(value) {
    const display = $('#calc-display');
    
    if (['+', '-', '*', '/', '%'].includes(value)) {
        if (calcOperator && !shouldResetDisplay) {
            calcEquals();
        }
        calcPrevious = calcCurrent;
        calcOperator = value;
        shouldResetDisplay = true;
        return;
    }
    
    if (value === 'C') {
        resetCalculator();
        return;
    }
    
    if (value === '±') {
        calcCurrent = (-parseFloat(calcCurrent)).toString();
    } else if (value === '.') {
        if (!calcCurrent.includes('.')) calcCurrent += '.';
    } else {
        if (shouldResetDisplay) {
            calcCurrent = value;
            shouldResetDisplay = false;
        } else {
            calcCurrent = calcCurrent === '0' ? value : calcCurrent + value;
        }
    }
    
    display.text(calcCurrent);
}

function calcEquals() {
    const display = $('#calc-display');
    if (!calcOperator || shouldResetDisplay) return;
    
    let result;
    const prev = parseFloat(calcPrevious);
    const curr = parseFloat(calcCurrent);
    
    switch (calcOperator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': result = curr !== 0 ? prev / curr : 'Error'; break;
        case '%': result = prev % curr; break;
        default: return;
    }
    
    calcCurrent = result.toString();
    calcOperator = '';
    shouldResetDisplay = true;
    display.text(calcCurrent);
}

function resetCalculator() {
    calcCurrent = '0';
    calcPrevious = '';
    calcOperator = '';
    shouldResetDisplay = false;
    $('#calc-display').text('0');
}

// Add keyboard support for calculator when open
$(document).on('keydown', function(e) {
    if ($('#calculator-modal').hasClass('hidden')) return;
    if (e.key === 'Escape') closeCalculator();
    if ('0123456789.+-*/%'.includes(e.key)) calcInput(e.key);
    if (e.key === 'Enter' || e.key === '=') calcEquals();
});