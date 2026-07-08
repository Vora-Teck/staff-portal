//alert("hi")
var exams = [];
var currentExam = null;

async function getTerms() {
    $("#term-filter").empty()
    staff.school.getTerms({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                for(let i in d) {
                    let temp = `
                    <option value="${d[i].id}">${d[i].title} - ${d[i].session.title}</option>`;
                    $("#term-filter").append(temp)
                }
                getAssignedExams()
            }
            else {
                showToast(data.message, "error")
            }
        },
        onError: (error) => {
            checkResponse(error)
            showToast(error, "error")
        }
    })
}

$("#term-filter").on('change', renderExams)
$("#type-filter").on('change', renderExams)

async function getAssignedExams() {
    staff.exam.getAssignedExams({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                exams = data.data
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderExams()
            }
            else {
                showToast(data.message, "error")
            }
            hideLoader()
        },
        onError: (error) => {
            checkResponse(error)
            showToast(error, "error")
            hideLoader()
        }
    })
}

function renderExams() {
    let term_id = $("#term-filter").val();
    let type = $("#type-filter").val();

    filtered_exams = exams.filter(x => (
        x.examType.includes(type) && x.term.id == parseInt(term_id)
    ))
    
    const tbody = $('#pastExamsBody');
    tbody.empty();

    if (filtered_exams.length === 0) {
        const row = `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td colspan="7" class="px-6 py-5 font-medium whitespace-nowrap text-italic">No items found.</td>
                
            </tr>
        `;
        tbody.append(row);
        return
    }
    filtered_exams.forEach(exam => {
        const row = `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td class="px-6 py-5 font-medium whitespace-nowrap">${exam.examId}</td>
                <td class="px-6 py-5">${exam.course.title}</td>
                <td class="px-6 py-5">${exam.classrooms.map((item, index) => {return item.level.title}).join(', ')}</td>
                <td class="px-6 py-5 whitespace-nowrap">${datify(exam.date)}</td>
                <td class="px-6 py-5 text-center">${exam.no_of_students}</td>
                <td class="px-6 py-5 text-center">${exam.no_of_questions}</td>
                <td class="px-6 py-5 text-center">
                    <!-- Dropdown -->
                    <div class="relative">
                        <!-- Button -->
                        <button
                            class="opt-btn flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-white"
                        >
                            <!-- Vertical Ellipsis -->
                            <i class="fa fa-ellipsis-v"></i>
                        </button>
                        <!-- Menu -->
                        <div
                            class="dropdownMenu absolute right-0 z-50 mt-2 hidden w-48 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                
                            <a href="#" data-id="${exam.id}"
                                class="ex-que-btn flex items-center gap-3 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white">
                                <span class="fa fa-file-text"></span>
                                View Questions
                            </a>
                    
                            <a href="#" data-id="${exam.id}"
                                class="ex-score-btn flex items-center gap-3 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white">
                                <span class="fa fa-users"></span>
                                View Scores
                            </a>
                    
                            <div class="border-t border-gray-800"></div>
                    
                            <a href="#" data-id="${exam.id}"
                                class="ex-down-btn acc-del-btn flex items-center gap-3 px-4 py-3 text-sm text-yellow-400 transition hover:bg-yellow-500/10 hover:text-red-300">
                                <span class="fa fa-download"></span>
                                Download Exam
                            </a>
                
                        </div>
            
                    </div>
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    $(".opt-btn").on('click', function() {
        $(".dropdownMenu").addClass("hidden")
        $(this).siblings(".dropdownMenu").toggleClass('hidden')
    })

    $(".ex-que-btn").click(function(e) {
        e.preventDefault();
        let id = $(this).data('id')
        viewQuestions(id)
        $(".dropdownMenu").addClass("hidden")
    })
    $(".ex-score-btn").click(function(e) {
        e.preventDefault();
        let id = $(this).data('id')
        viewScores(id)
        $(".dropdownMenu").addClass("hidden")
    })
    $(".ex-down-btn").click(function(e) {
        e.preventDefault();
        let id = $(this).data('id')
        downloadExam(id)
        $(".dropdownMenu").addClass("hidden")
    })
}

function viewScores(exam_id) {

    showLoader("Fetching data...")
    staff.exam.getExamScores({
        params: {exam_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let e = data.data;

                    showModal(`
                        <div class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h2 class="font-semibold text-lg" id="clasTitle">${data.exam_title}</h2>
                                    <p class="text-sm text-slate-500 dark:text-slate-400" id="attendancDateDisplay"></p>
                                </div>
                            
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Image</th>
                                            <th class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Full Name</th>
                                            <th class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Student ID</th>
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Class</th>
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody id="attendanceTableBody" class="att-list divide-y divide-slate-100 dark:divide-slate-700">
                                    ${e.map((item, index) => {
                                        return `
                                        <tr>
                                            <td class="px-6 py-5 text-left text-slate-500">
                                                <img style="width:40px; height:40px; border-radius:50%" 
                                                src="${item.student.image ? base_url + item.student.image : '/static/image/avatar.png'}" />
                                            </td>
                                            <td class="px-6 py-5 text-left text-slate-500">${item.student.firstName} ${item.student.middleName} ${item.student.lastName}</td>
                                            <td class="px-6 py-5 text-left text-slate-500">${item.student.studentId}</td>
                                            <td class="px-6 py-5 text-left text-slate-500">${item.student.classroom.level.title}</td>
                                            <td class="px-6 py-5 text-left">
                                                <input type="number" value="${item.score}"
                                                data-id="${item.student.id}" name="score_values" min="0" max="100"
                                                class="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                            </td>
                                        </tr>`
                                    }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="flex justify-between gap-3 p-3">
                                <button onclick="closeModal()" 
                                        class="py-4 px-3 min-w-[150px] border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                                <button onclick="updateScores('${data.exam_id}')" 
                                        class="py-4 px-3 min-w-[150px] bg-[#1e3a8a] text-white rounded-2xl font-medium">Update Scores</button>
                            </div>
                        </div>
                    `, 'max-w-4xl');
                }
                else {
                    showToast(data.message, "error")
                }
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                showToast("Error occurred. Kindly check your internet connection", "error")
                hideLoader()
            }
    })
}

function updateScores(exam_id) {
    let scores = []

    $("input[name=score_values]").each((index, elem) => {
        let student_id = $(elem).data('id')
        let score = $(elem).val()
        scores.push({student_id, score})
    })

    let formData = {exam_id, scores}

    //console.log(formData)
    showLoader(`Updating Scores...`)

    staff.exam.updateExamScores({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                //getScoreSheet();
                //getResults();
            }
            else {
                showToast(data.message, "error");
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            showToast("Error occurred. Kindly check your internet connection", "error");
            hideLoader()
        }
    })
}

function downloadExam(exam_id) {

    showLoader("Generating PDF...")

    staff.exam.examPDF({
        params: {exam_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                if(data.data) {
                    let file_splits = data.data.split('/');
                    let filename = file_splits[file_splits.length - 1]
                    downloadFile(data.data, filename)
                }
            }
            else {
                showToast(data.message, "error");
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            showToast("Error occurred. Kindly check your internet connection", "error");
            hideLoader()
        }
    })
}

var global_mcq_questions = []

function viewQuestions(exam_id) {
    global_mcq_questions.length = 0
    showLoader("Fetching data...")
    staff.exam.getExamQuestions({
        params: {exam_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let e = data.data;
                    global_mcq_questions = e.mcq_questions;
                    $("#exam-table").addClass('hidden')
                    $("#question-table").removeClass('hidden');
                    $(".exam-id-place").data('id', exam_id)

                    $(".ex-que-tit").html(e.exam_title)

                    let tbody = $("#exam-que-body")
                    tbody.empty()

                    e.mcq_questions.forEach(que => {
                        const row = `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td class="px-6 py-5 whitespace-nowrap">${que.number}</td>
                                <td class="px-6 py-5 font-medium">${que.question}</td>
                                <td class="px-6 py-5">
                                    <ol style="list-style-type:upper-alpha !important;">
                                        ${que.options.map((item, index) => {
                                            return `<li>${item}</li>`
                                        }).join('')}
                                    </ol>
                                </td>
                                <td class="px-6 py-5 whitespace-nowrap">${que.answer}</td>
                                <td class="px-6 py-5 text-center">
                                    <!-- Dropdown -->
                                    <div class="relative">
                                    <button
                                        class="opt-btn flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-white"
                                    >
                                        <i class="fa fa-ellipsis-v"></i>
                                    </button>
                                    <!-- Menu -->
                                    <div
                                        class="dropdownMenu absolute right-0 z-50 mt-2 hidden w-48 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl"
                                    >
                            
                                    <a href="#" data-id="${que.number}"
                                        class="que-det-btn flex items-center gap-3 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white">
                                        <span class="fa fa-file-text"></span>
                                        Update Question
                                    </a>
                            
                                    <div class="border-t border-gray-800"></div>
                            
                                    <a href="#" data-id="${que.number}"
                                        class="que-del-btn acc-del-btn flex items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-slate-300">
                                        <span class="fa fa-trash"></span>
                                        Delete Question
                                    </a>
                            
                                    </div>
                            
                                    </div>
                                </td>
                            </tr>
                        `;
                        tbody.append(row);
                    });

                    tinymce.get('essay-content').setContent(e.essay_questions)

                    $(".opt-btn").on('click', function() {
                        $(".dropdownMenu").addClass("hidden")
                        $(this).siblings(".dropdownMenu").toggleClass('hidden')
                    })
                    $(".que-det-btn").click(function(e) {
                        e.preventDefault()
                        let q_no = $(this).data('id');
                        getQuestion(q_no, exam_id)
                    })
                    $(".que-del-btn").click(function(e) {
                        e.preventDefault()
                        let q_no = $(this).data('id');
                    })
                    initiateTiny(true)
                }
                else {
                    showToast(data.message, "error")
                }
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                showToast("Error occurred. Kindly check your internet connection", "error")
                hideLoader()
            }
    })
}

$("#back-que-btn").on('click', () => {
    $("#exam-que-body").empty()
    $(".exam-id-place").data('id', '')
    $("#exam-table").removeClass('hidden')
    $("#question-table").addClass('hidden')
    $(".dropdownMenu").addClass("hidden")
    $(".opt-btn").on('click', function() {
        $(".dropdownMenu").addClass("hidden")
        $(this).siblings(".dropdownMenu").toggleClass('hidden')
    })
})

function switchExamTab(tabIndex) {
    //alert(tabIndex)
            $('.exam-tabs .tab-active').removeClass('tab-active');
            $(`#tab${tabIndex}`).addClass('tab-active');

            $('#upcomingSection').toggleClass('hidden', tabIndex !== 0);
            $('#pastSection').toggleClass('hidden', tabIndex !== 1);
            $('#questionBankSection').toggleClass('hidden', tabIndex !== 2);
}

function switchQuestionTab(tabIndex) {
    $('.que-tabs .tab-active').removeClass('tab-active');
    $(`#tab${tabIndex}`).addClass('tab-active');

    $('#mcqSection').toggleClass('hidden', tabIndex !== 4);
    $('#essaySection').toggleClass('hidden', tabIndex !== 5);
}


$(".update-essay-form").on('submit', function(e) {
    e.preventDefault();

    let exam_id = $(".exam-id-place").data('id');
    let essay = tinymce.get('essay-content').getContent({format: 'html'});

    let formData = {exam_id, essay}
    //console.log(formData)

    showLoader("Updating Essay...")
    staff.exam.updateExamEssay({
        formData,
        onSuccess: (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success")
            }
            else {
                showToast(data.message, "error")
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error)
            showToast("Error occurred. Kindly check your internet connection", "error")
            hideLoader()
        }
    })
})

$(".gen-essay-btn").click(function() {
    let exam_id = $(".exam-id-place").data('id');
    showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">
                        Generate Essay with A.I
                    </h3>
                    
                    <ul class="text-gray-400 px-2 py-3">
                        <li>The A.I generated questions are based on the school's syllabus on the exam subject.</li>
                        <li>The questions are generated based on the topics for the current term and the term(s) before (except for first term which has no previous term).</li>
                        <li>If you have any exceptions you'd like to make such as specific topics or specific instructions, kindly enter it into the "Additional instructions field"</li>
                    </ul>

                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Number of Questions</label>
                            <input type="number" id="essay-no" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl" />
                            
                            <label class="block text-sm font-medium mt-3 mb-1.5">Additional Instructions</label>
                            <textarea rows="4" id="essay-prompt" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl"></textarea>
                            
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="generateEssay('${exam_id}')" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Generate</button>
                        </div>
                    </div>
                </div>
    `);
})

$(".gen-que-btn").click(function() {
    let exam_id = $(".exam-id-place").data('id');
    showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">
                        Generate MCQs with A.I
                    </h3>
                    
                    <ul class="text-gray-400 px-2 py-3">
                        <li>The A.I generated questions are based on the school's syllabus on the exam subject.</li>
                        <li>The questions are generated based on the topics for the current term and the term(s) before (except for first term which has no previous term).</li>
                        <li>If you have any exceptions you'd like to make such as specific topics or specific instructions, kindly enter it into the "Additional instructions field"</li>
                    </ul>

                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Number of Questions</label>
                            <input type="number" id="mcq-no" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl" />

                            <label class="block text-sm font-medium mb-1.5">Number of options per question</label>
                            <input type="number" id="mcq-opt" value="4" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl" />
                            
                            <label class="block text-sm font-medium mt-3 mb-1.5">Additional Instructions</label>
                            <textarea rows="4" id="mcq-prompt" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl"></textarea>
                            
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="generateQuestions('${exam_id}')" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Generate</button>
                        </div>
                    </div>
                </div>
    `);
})

$(".add-que-btn").click(function() {
    let exam_id = $(".exam-id-place").data('id');
    showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">
                        Add New Question
                    </h3>
                    
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mt-3 mb-1.5">Question</label>
                            <textarea rows="3" id="que-que" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl"></textarea>

                            <label class="block text-sm font-medium mb-1.5">Add Options</label>
                            <div class="flex justify-end items-center gap-3">
                                <input type="text" id="que-opt" class="w-full px-5 py-4 border text-black-700 border-slate-300 dark:border-slate-600 rounded-2xl" />
                                <button class="add-opt-btn px-4 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium" style="white-space:nowrap;">
                                    <i class="fa fa-plus"></i> Add
                                </button>
                            </div>
                            
                            <div class="opts-selected"></div>

                            <label class="block text-sm font-medium mb-1.5">Select Answer</label>
                            <select id="que-ans" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                                
                            </select>
                            
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button id="add-que-btn" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Submit</button>
                        </div>
                    </div>
                </div>
    `);

    $("#add-que-btn").on('click', () => {
        addQuestion(exam_id)
    })

    $(".add-opt-btn").on('click', addOption)

    $(`#que-opt`).on('keydown', function(e) {
        if(e.key === "Enter") {
            e.preventDefault();
            addOption()
            return;
        }
    })
})

function getQuestion(q_no, exam_id) {
    //showLoader("Processing...")

    //$(".opts-selected").empty();
    //$("#que-ans2").empty();
    //$(".update-que-form")[0].reset();

    var que = global_mcq_questions.find(q => q.number == q_no)
    console.log(que)
    //$(".q_nos").html(que.number);
    //$(".q_no").val(que.number);

    if(action == "update") {
        $("#que-que2").val(que.question);

        que.options.map((elem) => {
            let temp = `<option value="${elem}">${elem}</option>`;

            let temp2 = `
                <div class="opt-selected2 light-btn">
                    <span class="opt-opt2">${elem}</span>
                    <span class="opt-canc2">X</span>
                </div>`;

            $(".opts-selected2").append(temp2)
            $("#que-ans2").append(temp)
        })

        $("#que-ans2").val(que.answer)

        $(".opt-canc2").on('click', function() {
            $(this).parent('.opt-selected2').remove()
            updateOptions2()
        })
    }

    hideLoader()
            
}

function addOption() {
    let option = $(`#que-opt`).val()
    //option = escapeHtml(option)
    let temp = `
    <div class="opt-selected light-btn">
        <span class="opt-opt">${option}</span>
        <span class="opt-canc">X</span>
    </div>`;
    $(`.opts-selected`).append(temp)
    
    
    $(`#que-opt`).val('');
    updateOptions()

    $(`.opt-canc`).on('click', function() {
        $(this).parent(`.opt-selected`).remove()
        updateOptions()
    })
}

function updateOptions() {
    $("#que-ans").empty();
    $(".opt-opt").each((index, elem) => {
        let temp = `<option value="${$(elem).text()}">${$(elem).text()}</option>`;
        $("#que-ans").append(temp)
    })
}

function addQuestion(exam_id) {
    let question = $("#que-que").val();

    let options = []
    $(".opt-opt").each((index, elem) => {
        options.push($(elem).text());
    })
    let answer = $("#que-ans").val()

    let formData = {exam_id, question, answer, options}


    //console.log(formData)
    showLoader("Adding Question...")

    staff.exam.addExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                //getQuestions(exam_id)
                closeModal()
                viewQuestions(exam_id)
                getAssignedExams()
            }
            else {
                showToast(data.message, "error");
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            showToast(`Error occurred: ${error}`, "error");
            hideLoader()
        }
    })
}

function generateQuestions(exam_id) {
    let question_count = $("#mcq-no").val();
    let option_count = $("#mcq-opt").val();
    let prompt = $("#essay-prompt").val();

    let formData = {exam_id, question_count, option_count, prompt}

    //console.log(formData)
    showLoader("Generating MCQs...")

    staff.exam.generateExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                //getQuestions(exam_id)
                closeModal()
                viewQuestions(exam_id)
            }
            else {
                showToast(data.message, "error");
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            showToast(`Error occurred: ${error}`, "error");
            hideLoader()
        }
    })
}

function generateEssay(exam_id) {
    let question_count = $("#essay-no").val();
    let prompt = $("#essay-prompt").val();

    let formData = {exam_id, question_count, prompt}

    //console.log(formData)
    showLoader("Generating Essay...")

    staff.exam.generateExamEssay({
        formData: formData,
        onSuccess: (data) => {
            console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                //getQuestions(exam_id)
                closeModal()
                let d = data.data;
                let temp = `
                ${renderMarkdown(d.content)}
                `;
                tinymce.get('essay-content').setContent(temp)
            }
            else {
                showToast(data.message, "error");
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            showToast(`Error occurred: ${error}`, "error");
            hideLoader()
        }
    })
}


  

        // ==================== MODALS & ACTIONS ====================
function createNewExam() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Create New Exam</h3>
                    <div class="space-y-6">
                        <input id="examTitle" type="text" placeholder="Exam Title" 
                               class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        <div class="grid grid-cols-2 gap-4">
                            <select class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                                <option>Mathematics</option>
                                <option>Further Mathematics</option>
                            </select>
                            <select class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                                <option>SS2</option>
                                <option>SS3</option>
                                <option>JS1</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="date" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                            <input type="text" placeholder="Duration (e.g. 2 hours)" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-10">
                        <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                        <button onclick="saveNewExam()" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Create Exam</button>
                    </div>
                </div>
            `);
}

      
$(document).ready(async function() {
    try {
            initTailwind();

            loadTheme()

            // Render content
            
            //renderUpcomingExams();
            //renderPastExams();
            //switchExamTab(0)
            $("#tab0").click(function() {switchExamTab(0)})
            $("#tab1").click(function() {switchExamTab(1)})
            $("#tab2").click(function() {switchExamTab(2)})

            $("#tab4").click(function() {switchQuestionTab(4)})
            $("#tab5").click(function() {switchQuestionTab(5)})
            
            showLoader("Loading Exams...")
            await getTerms()

            initiateTiny(true)
            
            //await getAssignedExams()
            
          //  alert("loaded")
    }
    catch(err) {console.log(err)}
});

$(document).on("click", function (e) {
  const menu = $(".dropdownMenu");

  if (
    !e.target.closest(".dropdownMenu") &&
    !e.target.closest("button")
  ) {
    menu.addClass("hidden");
  }
});