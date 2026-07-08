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
                                <button onclick="takeAttendance(${classroom.id})" 
                                        class="flex-1 py-4 text-sm font-medium bg-[#1e3a8a] text-white hover:bg-blue-700 rounded-2xl">
                                    Take Attendance
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

        function takeAttendance(id) {
            const classroom = classrooms.find(c => c.id === id);
            showToast(`Opening attendance for ${classroom.title}`, 'info');
            // Redirect to attendance page with pre-selected class
            setTimeout(() => {
                window.location.href = '#attendance';
            }, 800);
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
