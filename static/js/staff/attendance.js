var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
var terms = {1: "First Term", 2: "Second Term", 3: "Third Term", 4: "Fourth Term", 5: "Fifth Term"}


//showLoader("Loading Data...")

async function getAssignedClassrooms() {
    $("#class-filter").empty()
    staff.classroom.getAssignedClassrooms({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                classrooms = data.data
                for(let i = 0; i < classrooms.length; i++) {
                    let temp = `
                    <option value="${classrooms[i].id}">${classrooms[i].title}</option>`;
                    $("#class-filter").append(temp)
                }
                $("#class-filter").prepend(`<option value="" selected>Select classroom</option>`)
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

$("#session-filter").on('change', async() => {
    await setTerm();await getAttendance()
})
$("#term-filter").on('change', async() => {
    await setWeek();await getAttendance()
})
$("#week-filter").on('change', async() => {
    await getAttendance()
})
$("#class-filter").on('change', async() => {
    await getAttendance()
})

async function setTerm() {
    let data = JSON.parse(sessionStorage.eduka_attendance_data)
    var session = $("#session-filter").val();
    var session_data = data[session]
    $("#term-filter").empty()
    for(let t in session_data) {
        var temp = `<option value="${t}" selected>${terms[t]}</option>`
        $("#term-filter").prepend(temp)
        await setWeek()
    }
}

async function setWeek() {
    let data = JSON.parse(sessionStorage.eduka_attendance_data)
    var session = $("#session-filter").val();
    var term = $("#term-filter").val();
    var term_data = data[session][term]
    $("#week-filter").empty()
    for(let w in term_data) {
        var temp = `<option value="${w}" selected>${w}</option>`
        $("#week-filter").prepend(temp)
    }
}


function getAttendanceData() {
    $("#session-filter").empty()
    staff.classroom.getAttendanceParams({
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data
                    for(let s in d) {
                        var temp = `<option value="${s}">${s}</option>`
                        $("#session-filter").append(temp)
                    }
                    sessionStorage.setItem("eduka_attendance_data", JSON.stringify(d))
                    setTerm()
                    //getClassrooms()
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                    hideLoader()
                }
                
        },
        onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
        }
  })
}


//getAttendanceData()

/* =========== Attendance Section =============== */

async function getAttendance() {
    let class_id = $("#class-filter").val();
    let session = $("#session-filter").val()
    let week = $("#week-filter").val()
    let term = $("#term-filter").val()

    if(class_id.trim() == "") {
        showToast("Kindly select a classroom", "warning");
        return;
    }


    $('.att-list').empty()

    showLoader();

    let params = {class_id, session, week, term}

    //console.log(params)

    staff.classroom.getClassAttendance({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.att-list').empty()
                if(data.status == 'success') {
                    $("#classTitle").html(`${data.classroom} Attendance`)
                    if(data.data) {
                        let e = data.data;
                        let end_d = new Date(e.end_date)
                        end_d.setDate(end_d.getDate() - 2)
                        $("#attendanceDateDisplay").html(`${datify(e.start_date, false)} - ${datify(end_d, false)}`)
                        let a_data = e.data

                        info = ``;

                        let present_count = 0, absent_count = 0, late_count = 0;
                        
                        for(let i in a_data) {
                            let att_data = a_data[i].attendance
                            att_d = ``
                            for(let p = 0; p < att_data.length; p++) {
                                $('#totalStudents').text(att_data.length);
                                var values = Object.values(att_data[p])
                                var dts = values[0]
                                mor = ``;
                                aft = ``;
                                let morn = null, afte = null;
                                if(dts.length > 0) {
                                    morn = dts[0]
                                    mor = morn ? `<span class="cursor-pointer inline-block px-3 py-2 text-xs font-semibold rounded-2xl present">P</span>
                                    ` : `<span class="cursor-pointer inline-block px-3 py-2 text-xs font-semibold rounded-2xl absent">A</span>`;
                                }
                                if(dts.length > 1) {
                                    afte = dts[1]
                                    aft = afte ? `<span class="cursor-pointer inline-block px-3 py-2 text-xs font-semibold rounded-2xl present">P</span>
                                    ` : `<span class="cursor-pointer inline-block px-3 py-2 text-xs font-semibold rounded-2xl absent">A</span>`;
                                }
                                att_d += `<td class="px-6 py-5 text-center text-xl">
                               <div class="flex justify-center align-center gap-2">${mor}${aft}</div>
                                </td>`;
                                if(morn == true && afte == true) {present_count += 1}
                                else if (morn == true || afte == true) {late_count += 1}
                                else if(morn == false && afte == false) {absent_count += 1}
                            }
                            let temp = `
                            <tr class="att-row border-b" data-name="${a_data[i].name.toLowerCase()} ${a_data[i].studentId.toLowerCase()}">
                                <td class="px-6 py-5 text-center">
                                    <img src="${a_data[i].image ? `${base_url}${a_data[i].image}` : "/static/image/student.png"}"
                                    alt="" 
                                    style="width:45px;height:45px;border-radius:50%;" />
                                </td>
                                <td class="px-6 py-5 text-left font-medium">${a_data[i].name}</td>
                                <td class="px-6 py-5 text-left text-slate-500">${a_data[i].studentId}</td>
                                ${att_d}
                            </tr>`;

                            $('.att-list').append(temp)
                        }

                        $('#presentCount').text(digify(present_count));
                        $('#absentCount').text(digify(absent_count));
                        $('#lateCount').text(digify(late_count));
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8" class="px-6 py-5 text-left text-slate-500 w-italic">${data.message}</td>
                        </tr>`;
                        $('.att-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="px-6 py-5 text-left text-slate-500 w-italic">${data['message']}</td>
                        </tr>`;
                        $('.att-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
            console.error(error);
            $('.att-list').empty()
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
  })
}

function getTodayAttendance() {
    
    $(".curr-att-list").empty()

    let class_id = $("#class-filter").val()
    if(class_id.trim() == "") {
        showToast("Kindly select a classroom", "warning");
        return;
    }
    showLoader("Preparing data...")
    staff.classroom.getTodayAttendance({
        params: {class_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let e = data.data;

                    showModal(`
                        <div class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h2 class="font-semibold text-lg">${data.classroom}</h2>
                                    <p class="text-sm text-slate-500 dark:text-slate-400">Attendance for ${datify()}</p>
                                </div>
                                <button data-id="${data.class_id}" id="mark-at-btn" onclick="markAttendance()" 
                                        class="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-2xl">
                                    Update Attendance
                                </button>
                            
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Image</th>
                                            <th class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Full Name</th>
                                            <th class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Student ID</th>
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Morning</th>
                                            <th class="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">Afternoon</th>
                                        </tr>
                                    </thead>
                                    <tbody id="" class="divide-y divide-slate-100 dark:divide-slate-700">
                                    ${e.map((item, index) => {
                                        return `
                                        <tr>
                                            <td class="px-6 py-4 text-center">
                                                <img src="${item.image ? `${base_url}${item.image}` : "/static/image/student.png"}"
                                                alt="" 
                                                style="width:45px;height:45px;border-radius:50%;" />
                                            </td>
                                            <td class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">${item.name}</td>
                                            <td class="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">${item.studentId}</td>
                                            <td class="px-6 py-4 text-center">
                                                <label class="switch">
                                                    <input type="checkbox" 
                                                    class="switch-box att-switch" 
                                                    data-name="morning"
                                                    ${item.attendance.length >= 1 && item.attendance[0] === true ? "checked" : ""}
                                                    name="${item.studentId}"
                                                    >
                                                    <span class="switch-slider"></span>
                                                </label>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <label class="switch">
                                                    <input type="checkbox" 
                                                    class="switch-box att-switch" 
                                                    data-name="afternoon"
                                                    ${item.attendance.length > 1 && item.attendance[1] === true ? "checked" : ""}
                                                    name="${item.studentId}"
                                                    >
                                                    <span class="switch-slider"></span>
                                                </label>
                                            </td>
                                        </tr>`
                                    }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="flex gap-3 px-4 py-4">
                                <button onclick="closeModal()" 
                                        class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                                <button onclick="markAttendance()" 
                                        class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Update Attendance</button>
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

function markAttendance() {

    let class_id = $("#mark-at-btn").data('id');

    var data = {}

    $(".att-switch[data-name='morning']").each(function() {
        let id = $(this).attr('name');
        data[id] = [$(this).is(":checked")]
    })
    $(".att-switch[data-name='afternoon']").each(function() {
        let id = $(this).attr('name');
        if(data[id]) {
            data[id].push($(this).is(":checked"))
        }
        
    })
      
    let formData = { class_id, data }

    //console.log(formData)

    showLoader("Updating attendance...")
    staff.classroom.updateTodayAttendance({
        formData: formData,
            onSuccess: (data) => {
                if(data.status == 'success') {
                    showToast(data.message, "success")
                }
                else {
                    showToast(data.message, "error")
                }
                hideLoader()
                getAttendance()
            },
            onError: (error) => {
                console.error(error)
                showToast("Error occurred. Kindly check your internet connection", "error")
                hideLoader()
            }
    })
}


$(document).ready(async function() {
            initTailwind();

            showLoader("Loading data...")

            // Set today's date
            //const today = new Date().toISOString().split('T')[0];
            //$('#attendanceDate').val(today);
            $('#attendanceDateDisplay').text(new Date().toLocaleDateString('en-NG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }));

            // Load initial attendance
            getAssignedClassrooms()
            getAttendanceData()
            //renderAttendance();

            // Theme
            loadTheme()

            setTimeout(() => {
                showToast('Attendance loaded successfully', 'success');
            }, 800);

            // Close modal on outside click
            
        });


// ========== Event Listeners ======================
$("#mark-att-btn").click(function(e) {e.preventDefault();getTodayAttendance()})
$(".insight-btn").click(function(e) {e.preventDefault();getAnalysis()})


$(".mark-att-form").on('submit', function(e) {e.preventDefault();markAttendance()})
