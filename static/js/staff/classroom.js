// ==================== SAMPLE DATA ====================
var classrooms = [];
var currentTab = 0;
var currentClass = null;




async function getAssignedClassrooms() {
    staff.classroom.getAssignedClassrooms({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                classrooms = data.data
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderClassrooms()
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
        // ==================== RENDER CLASSROOMS ====================
        async function renderClassrooms() {
            const container = $('#classroomsGrid');
            container.empty();

            if (classrooms.length === 0) {
                container.html(`<p class="col-span-3 text-center text-slate-500 py-12">No classrooms assigned.</p>`);
                return;
            }

            classrooms.forEach(classroom => {
                const html = `
                    <div class="classroom-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div class="h-3 bg-${classroom.color}-600"></div>
                        <div class="p-6">
                            <div class="flex justify-between">
                                <div>
                                    <h3 class="font-semibold text-xl">${classroom.title}</h3>
                                    <p class="text-slate-500 dark:text-slate-400 mt-1">${classroom.category}</p>
                                </div>
                                <div class="text-4xl fa fa-building text-${classroom.color}-900"></div>
                            </div>

                            <div class="mt-8 grid grid-cols-2 gap-6">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Students</p>
                                    <p class="text-3xl font-semibold text-[#1e3a8a] dark:text-blue-400">${classroom.total_students}</p>
                                </div>
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Males / Females</p>
                                    <p class="text-3xl font-semibold text-[#1e3a8a] dark:text-blue-400">${classroom.males} / ${classroom.females}</p>
                                </div>
                            </div>

                            <div class="mt-8 flex gap-3">
                                <button onclick="viewStudents(${classroom.id})" 
                                        class="flex-1 py-4 text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl">
                                    View Students
                                </button>
                                <button onclick="viewTimetable(${classroom.id})" 
                                        class="flex-1 py-4 text-sm font-medium bg-[#1e3a8a] text-white hover:bg-blue-700 rounded-2xl">
                                    View Timetable
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.append(html);
            });
        }

        // ==================== MODAL FUNCTIONS ====================
        function viewStudents(id, search="") {
            const classroom = classrooms.find(c => c.id === id);
            if (!classroom) return;

            let container = $('#studentsGrid');
            container.empty();
            let students = classroom.students;

            $(".class-tit").html(`${classroom.title}`)
            //console.log(topics)

            if (students.length === 0) {
                container.html(`<p class="col-span-3 text-center text-slate-500 py-12">No students found.</p>`);
            }
            else {
                students = students.filter(x => (
                    (x.firstName + x.lastName + x.middleName + x.studentId).toLowerCase().includes(search.toLowerCase())
                ))
                students.forEach(student => {
                    const html = `
                        <div class="course-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div class="h-2 bg-${classroom.color}-600"></div>
                            <div class="p-6">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-semibold text-xl">${student.firstName}</h3>
                                        <p class="text-slate-500 dark:text-slate-400">${student.middleName} ${student.lastName}</p>
                                    </div>
                                    <img class="w-20 h-20 border border-slate-300 dark:border-slate-600"
                                        style="border-radius:50%" 
                                        src="${student.image ? `${base_url}${student.image}` : `/static/image/student.png`}" />
                                </div>
                                
                                <div class="mt-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p class="text-slate-500 dark:text-slate-400">Student ID</p>
                                        <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${student.studentId}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 dark:text-slate-400">D.O.B</p>
                                        <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${datify(student.dateOfBirth, false)}</p>
                                    </div>
                                </div>
    
                                <div class="mt-6 flex gap-3">
                                    <button onclick="studentInfo(${student.id})" 
                                            class="flex-1 py-3 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(html);
                });
            }
            switchTab(1)
           currentClass = classroom.id
        }

        $("#studentSearch").on('input', function() {
            let query = $(this).val();
            viewStudents(currentClass, query)
        })

        function studentInfo(id) {
            //console.log(id)
            const classroom = classrooms.find(c => c.id === currentClass);
            if (!classroom) return;

            let students = classroom.students;
            let std = students.find(s => s.id === id);
            let student_id = std.studentId;
            //console.log(student_id)

            showLoader("Loading content...")

            staff.classroom.getStudentInfo({
                params: {student_id},
                onSuccess: (data) => {
                    checkResponse(data)
                    //console.log(data)
                    if(data.status == "success") {
                        let student = data.data;
                        let r = data.results;
                        let fees = data.fees;

                        showModal(`
                            <div class="p-8">
                                <div class="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 class="text-2xl font-semibold">${student.firstName} ${student.middleName} ${student.lastName}</h3>
                                        <p class="text-slate-500">${student.studentId} • ${capitalize(student.gender)}</p>
                                    </div>
                                    <button onclick="closeModal()" class="text-3xl leading-none text-slate-400 hover:text-slate-600">×</button>
                                </div>
            
                                <div class="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-[40%_60%] gap-4">

                                        <div>
                                            <div class="flex flex-start items-start gap-4">
                                                <img class="w-20 h-20 border border-slate-300 dark:border-slate-600"
                                                    style="border-radius:50%" 
                                                    src="${student.image ? `${base_url}${student.image}` : `/static/image/student.png`}" />
                                                <div>
                                                    <h3 class="font-semibold text-xl">${student.firstName}</h3>
                                                    <p class="text-slate-500 dark:text-slate-400">${student.middleName} ${student.lastName}</p>
                                                </div>
                                            </div>
                                            <div class="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">Student ID</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${student.studentId}</p>
                                                </div>
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">D.O.B</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${datify(student.dateOfBirth, false)}</p>
                                                </div>
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">Classroom</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${student.classroom.level.title}</p>
                                                </div>
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">Registration Date</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${datify(student.registration_date, false)}</p>
                                                </div>
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">Gender</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${capitalize(student.gender)}</p>
                                                </div>
                                                <div>
                                                    <p class="text-slate-500 dark:text-slate-400">Age</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${dateDiff(student.dateOfBirth, false)} years</p>
                                                </div>
                                                <div class="col-span-full">
                                                    <p class="text-slate-500 dark:text-slate-400">Address</p>
                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${student.address.address}, ${student.address.lga} LGA, ${student.address.state} State, ${student.address.country}.</p>
                                                </div>
                                            </div>
                                            <h3 class="mt-4 text-2xl font-semibold">Parents' Info</h3>
                                            ${student.parentInfo.map((item, index) => {
                                                return `
                                                    <details class="group mb-4 rounded-lg p-4 bg-slate-100 dark:bg-slate-900">
                                                            <summary class="flex cursor-pointer font-semibold list-none items-center justify-between">

                                                            ${item.name || 'No name provided'}
                                                            <span class="transition duration-300 group-open:rotate-180 fa fa-chevron-down"></span>
                                                            </summary>
                                                            <div class="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p class="text-slate-500 dark:text-slate-400">Relationship</p>
                                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${item.relationship}</p>
                                                                </div>
                                                                <div>
                                                                    <p class="text-slate-500 dark:text-slate-400">Phone Number</p>
                                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${item.phone_number}</p>
                                                                </div>
                                                                <div>
                                                                    <p class="text-slate-500 dark:text-slate-400">Email</p>
                                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${item.email}</p>
                                                                </div>
                                                                <div class="col-span-full">
                                                                    <p class="text-slate-500 dark:text-slate-400">Address</p>
                                                                    <p class="text-1xl font-semibold text-[#1e3a8a] dark:text-blue-400">${item.address}.</p>
                                                                </div>
                                                            </div>
                                                    </details>`
                                            }).join('')}
                                        </div>

                                        <div>
                                            <h3 class="mt-8 text-2xl font-semibold">Attendance</h3>
                                            <div class="overflow-x-auto hide-scrollbar rounded-xl border border-slate-200">
                                                <table class="min-w-full divide-y divide-slate-200 text-sm">
                                                <thead class="bg-slate-200 dark:bg-slate-800">
                                                        <tr>
                                                            <th class="px-6 py-4 text-left font-semibold"></th>
                                                            <th class="px-6 py-4 text-center font-semibold">First</th>
                                                            <th class="px-6 py-4 text-center font-semibold">Second</th>
                                                            <th class="px-6 py-4 text-center font-semibold">Third</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-slate-200">
                                                        <tr class="transition">
                                                            <td class="px-6 py-4 whitespace-nowrap font-semibold">
                                                                No of days school opened
                                                            </td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                        </tr>
                                                        <tr class="transition">
                                                            <td class="px-6 py-4 whitespace-nowrap font-semibold">
                                                                No of days present
                                                            </td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                        </tr>
                                                        <tr class="transition">
                                                            <td class="px-6 py-4 whitespace-nowrap font-semibold">
                                                                No of days absent
                                                            </td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                        </tr>
                                                        <tr class="transition">
                                                            <td class="px-6 py-4 whitespace-nowrap font-semibold">
                                                                % Attendance
                                                            </td>
                                                            <td class="text-center">0%</td>
                                                            <td class="text-center">0</td>
                                                            <td class="text-center">0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <h3 class="mt-8 text-2xl font-semibold">School Fees</h3>
                                            <div class="overflow-x-auto hide-scrollbar rounded-xl border border-slate-200">
                                                <table class="min-w-full divide-y divide-slate-200 text-sm">
                                                    <thead class="bg-slate-200 dark:bg-slate-800">
                                                        <tr>
                                                            <th class="px-6 py-4 text-left font-semibold">Session</th>
                                                            <th class="px-6 py-4 text-left font-semibold">Term</th>
                                                            <th class="px-6 py-4 text-center font-semibold">Amount</th>
                                                            <th class="px-6 py-4 text-center font-semibold">Status</th>
                                                            <th class="px-6 py-4 text-center font-semibold">Outstanding</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-slate-200">
                                                        ${fees.map((item, index) => {
                                                            let t = item.tuition
                                                            return `
                                                            <tr class="transition">
                                                                <td class="px-6 py-4 whitespace-nowrap">${t.term.session.title}</td>
                                                                
                                                                <td style="white-space:nowrap">${t.term.title}</td>
                                                                <td class="text-center">&#8358;${digify(t.amount)}</td>
                                                                <td class="text-center">${item.is_paid ? `
                                                                <span class="text-green">Paid</span>` : `
                                                                <span class="text-red">Unpaid</span>`}</td>
                                                                <td class="text-center">&#8358;${digify(item.outstanding)}</td>
                                                                
                                                            </tr>`
                                                        }).join('')}
                                                        
                                                    </tbody>
                                                </table>
                                            </div>
                                            <h3 class="mt-8 text-2xl font-semibold">Results</h3>
                                            <div class="overflow-x-auto hide-scrollbar rounded-xl border border-slate-200">
                                                <table class="min-w-full divide-y divide-slate-200 text-sm">
                                                    <thead class="bg-slate-200 dark:bg-slate-800">
                                                        <tr>
                                                            <th class="px-6 py-4 text-left font-semibold">Class</th>
                                                            <th class="px-6 py-4 text-left font-semibold">Term</th>
                                                            <th class="px-6 py-4 text-left font-semibold">Result</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-slate-200">
                                                        ${Object.keys(r).map((item, index) => {
                                                            let keys = Object.keys(r[item])
                                                            let values = Object.values(r[item])
                                                            let keys_m = keys.map(k => `<li>${k}</li>`).join("")
                                                            let values_m = values.map(l => `
                                                            <li class="w-text-blue w-bold-x">
                                                            <a>View Result</a>
                                                            </li>
                                                            `).join("")

                                                            return `
                                                            <tr class="transition">
                                                                <td class="px-6 py-4 whitespace-nowrap">${item}</td>
                                                                <td class="px-6 py-4 whitespace-nowrap">
                                                                    <ul style="list-style-type:none;">
                                                                        ${keys_m}
                                                                    </ul>
                                                                </td>
                                                                <td class="px-6 py-4 whitespace-nowrap">
                                                                    <ul style="list-style-type:none;">${values_m}</ul>
                                                                </td>
                                                            </tr>`
                                                        }).join('')}
                                                        
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                    
            
                                <div class="flex gap-3 mt-8">
                                    <button onclick="closeModal()" 
                                            class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Close</button>
                                    
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
                    checkResponse(error)
                    showToast(error, "error")
                    hideLoader()
                }
            })

        }


function getTimetable() {
    let class_id = $("#class-filter2").val()

    let loader_process = `<div class="loader mb-3" style="margin:auto;"></div>`;

    $(".time-table-body").empty().html(loader_process)
    $(".time-table-head").empty()
    $(".time-table-body2").empty().html(loader_process)
    $(".time-table-head2").empty()
    $(".time-name").html(``)

    $(".time-btns").addClass("w-hide")

    if(!class_id) {
        $(".time-table-body").empty();
        $(".time-table-body2").empty();
        pushNotification("n_info", "Kindly select a class", 5000);
        return;
    }

    //showLoader("Fetching timetable...")

    admin.timetable.getTimetable({
        params: {class_id},
            onSuccess: (data) => {
                $(".time-table-body").empty()
                $(".time-table-body2").empty()
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    $(".time-name").html(`${d.classroom.level.title} Timetable`)

                    let periods = d.period;
                    let mon = d.monday;
                    let tue = d.tuesday;
                    let wed = d.wednesday;
                    let thu = d.thursday;
                    let fri = d.friday;

                    // Horizontal arrangements
                    $(".time-table-head").append(`<th></th>`)
                    for(let i in periods) {
                        var temp = `<th style="text-align:center;"></th>`;
                        $(".time-table-head").append(temp)
                    }

                    let mon_row = `<td>Mon</td>`;
                    let tue_row = `<td>Tue</td>`;
                    let wed_row = `<td>Wed</td>`;
                    let thu_row = `<td>Thur</td>`;
                    let fri_row = `<td>Fri</td>`;

                    for(let a in mon) {
                        mon_row += `<td>${mon[a].subject}</td>`
                    }
                    $(".time-table-body").append(`<tr>${mon_row}</tr>`)

                    for(let a in tue) {
                        tue_row += `<td>${tue[a].subject}</td>`
                    }
                    $(".time-table-body").append(`<tr>${tue_row}</tr>`)

                    for(let a in wed) {
                        wed_row += `<td>${wed[a].subject}</td>`
                    }
                    $(".time-table-body").append(`<tr>${wed_row}</tr>`)

                    for(let a in thu) {
                        thu_row += `<td>${thu[a].subject}</td>`
                    }
                    $(".time-table-body").append(`<tr>${thu_row}</tr>`)

                    for(let a in fri) {
                        fri_row += `<td>${fri[a].subject}</td>`
                    }
                    $(".time-table-body").append(`<tr>${fri_row}</tr>`)
                    
                    // Vertical arrangements
                    $(".time-table-head2").append(`
                        <th>Periods</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    `)

                    for(let j = 0; j < periods.length; j++) {
                        let temp = `
                        <tr>
                            <td>${timify(periods[j].start)}<br>-<br>${timify(periods[j].end)}</td>
                            <td>${mon[j].subject}</td>
                            <td>${tue[j].subject}</td>
                            <td>${wed[j].subject}</td>
                            <td>${thu[j].subject}</td>
                            <td>${fri[j].subject}</td>
                        </tr>`;

                        $(".time-table-body2").append(temp)
                    }

                    $(".time-btns").removeClass("w-hide")
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                }
            },
            onError: (error) => {
                console.error(error)
                $(".time-table-body").empty()
                pushNotification("n_error", "Internet connection error!", 3000)
            }
    })
}
    
function viewTimetable(class_id) {
    const classroom = classrooms.find(c => c.id === class_id);
    //console.log(classroom)

    showLoader("Fetching data...")
    staff.classroom.getTimetable({
        params: {class_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let d = data.data;

                    let periods = d.period;
                    let mon = d.monday;
                    let tue = d.tuesday;
                    let wed = d.wednesday;
                    let thu = d.thursday;
                    let fri = d.friday;

                    showModal(`
                        <div class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h2 class="font-semibold text-lg" id="clasTitle">${classroom.title} Timetable</h2>
                                    <p class="text-sm text-slate-500 dark:text-slate-400" id="attendancDateDisplay"></p>
                                </div>
                                <button class="download-time-btn py-4 px-3 min-w-[150px] bg-[#1e3a8a] text-white rounded-2xl font-medium">Download PDF</button>
                            
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full timetable-table">
                                    <thead>
                                        <tr>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Periods</th>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Monday</th>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Tuesday</th>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Wednesday</th>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Thursday</th>
                                            <th class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">Friday</th>
                                        </tr>
                                    </thead>
                                    <tbody id="attendanceTableBody" class="att-list divide-y divide-slate-100 dark:divide-slate-700">
                                    
                                    ${periods.map((item, i) => {
                                        return `
                                        <tr>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${timify(item.start)}<br>-<br>${timify(item.end)}
                                            </td>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${mon[i].subject}
                                            </td>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${tue[i].subject}
                                            </td>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${wed[i].subject}
                                            </td>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${thu[i].subject}
                                            </td>
                                            <td class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                                ${fri[i].subject}
                                            </td>
                                        </tr>`
                                            }).join("")}
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="flex w-full justify-between gap-3 p-3">
                                <button onclick="closeModal()" 
                                        class="py-4 px-3 min-w-[150px] border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                                
                            </div>
                        </div>
                    `, 'max-w-4xl');

                    $(".download-time-btn").on('click', function() {
                        downloadTimetable(class_id)
                    })
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

function downloadTimetable(class_id) {
    const classroom = classrooms.find(c => c.id === class_id);
    //console.log(classroom)

    showLoader(`Generating ${classroom.title} timetable...`)
    staff.classroom.downloadTimetable({
        formData: {class_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let d = data.data;
                    showToast(data.message, "success")
                    downloadFile(d)
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

        function openAddClassroomModal() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Assign New Classroom</h3>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium mb-2">Subject / Class Name</label>
                            <input type="text" id="className" placeholder="e.g. SS1 Physics" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Room Number</label>
                                <input type="text" id="roomNo" placeholder="A15" 
                                       class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Capacity</label>
                                <input type="number" id="capacity" value="40" 
                                       class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Schedule Time</label>
                            <input type="text" id="schedule" placeholder="01:00 PM - 01:45 PM" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" 
                                    class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="addNewClassroom()" 
                                    class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Assign Classroom</button>
                        </div>
                    </div>
                </div>
            `);
        }

        function switchTab(tabIndex) {
            $('.tab-active').removeClass('tab-active');
            $(`#tab${tabIndex}`).addClass('tab-active');

            $('#classSection').toggleClass('hidden', tabIndex !== 0);
            $('#studentSection').toggleClass('hidden', tabIndex !== 1);
            currentTab = tabIndex
        }

        $("#tab0").click(function() {
            switchTab(0);
            currentClass = null;
        })
        
        $(document).ready(function() {
            initTailwind();

            loadTheme()

            // Render classrooms
            showLoader("Loading classrooms...")
            getAssignedClassrooms()
            
            switchTab(0)

            
        });
