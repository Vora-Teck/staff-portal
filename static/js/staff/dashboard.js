// Sample Modal Functions
        function markAttendanceQuick() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Mark Today's Attendance</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-8">SS2 Mathematics • 10:00 AM</p>
                    <div class="space-y-4">
                        <button onclick="closeModal();showToast('Attendance marked successfully!', 'success')" 
                                class="w-full py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Mark All Present</button>
                        <button onclick="closeModal()" 
                                class="w-full py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Open Full Attendance Sheet</button>
                    </div>
                </div>
            `, 'max-w-md');
        }

        function openNewAssignmentModal() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Create New Assignment</h3>
                    <div class="space-y-6">
                        <input type="text" placeholder="Assignment Title" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        <textarea placeholder="Description" rows="4" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl"></textarea>
                        <div class="flex gap-3">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="closeModal();showToast('Assignment created successfully!', 'success')" 
                                    class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Create Assignment</button>
                        </div>
                    </div>
                </div>
            `);
        }

        function openNewNoteModal() {
            showToast("Class notes feature coming in next module", "info");
        }
    
    async function getData() {
        showLoader("Loading Dashboard...")
        
        staff.school.schoolData({
            params: {page: "dashboard"},
            onSuccess: (data) => {
                checkResponse(data)
                console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    $(".dash-std").html(digify(d.students, false))
                    $(".dash-att").html(`${d.attendance_rate}%`)
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

        // Initialize
        $(document).ready(async function() {
            initTailwind();

            // Load theme
            loadTheme()

            // Set current date
            const dateEl = document.getElementById('currentDate');
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString('en-NG', options);

            // set time
            let time_now = new Date().getHours()
            let timeText = ""
            let timeEl = document.querySelector(".time-now")
            if(0 <= time_now <= 11) timeText = "Morning"
            else if(12 <= time_now <= 17) timeText = "Afternoon"
            else timeText = "Evening"
            timeEl.textContent = timeText
            // Welcome toast
            await getData()
            
        });