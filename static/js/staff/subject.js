// ==================== COURSE DATA ====================
var terms = {1: "First", 2: "Second", 3: "Third"}
var courses = [];
var currentTab = 0;
var currentCourse = null;
var currentTopic = null;

async function getSyllabus(callback=null) {
    

    staff.subject.getAssignedSyllabus({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                courses = data.data
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderCourses(courses)
                callback?.(currentCourse)
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

        // ==================== RENDER COURSES ====================
        async function renderCourses(filteredCourses = courses) {
            const container = $('#coursesGrid');
            container.empty();

            if (filteredCourses.length === 0) {
                container.html(`<p class="col-span-3 text-center text-slate-500 py-12">No subjects found.</p>`);
                return;
            }

            filteredCourses.forEach(course => {
                const html = `
                    <div class="course-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div class="h-2 bg-${course.color}-600"></div>
                        <div class="p-6">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-semibold text-xl">${course.subject}</h3>
                                    <p class="text-slate-500 dark:text-slate-400">${course.classrooms.join(', ')}</p>
                                </div>
                                <span class="text-4xl fa fa-book text-${course.color}-800"></span>
                            </div>
                            
                            <div class="mt-8 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Term</p>
                                    <p class="font-semibold text-2xl">${terms[course.term]}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Topics</p>
                                    <p class="font-semibold text-2xl">${course.topics_no}</p>
                                </div>
                            </div>

                            <div class="mt-6 flex gap-3">
                                <button onclick="viewCourse(${course.id})" 
                                        class="flex-1 py-3 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Download
                                </button>
                                <button onclick="manageTopics(${course.id})" 
                                        class="flex-1 py-3 text-sm font-medium bg-[#1e3a8a] text-white rounded-2xl hover:bg-blue-700">
                                    Manage Topics
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.append(html);
            });
        }

        $("#syl-term").on('change', function() {
            let term = $(this).val();
            let filtered = courses;
            if(term !== "") {
                filtered = courses.filter(x => x.term == parseInt(term))
            } 
            renderCourses(filtered)
        })

        function viewCourse(id) {
            const course = courses.find(c => c.id === id);
            if (!course) return;
            
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">
                        Download ${terms[course.term]} Term ${course.subject} Syllabus for ${course.classrooms.join(', ')}
                    </h3>
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Select Format</label>
                            <select id="syl-format" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                                <option value="pdf">PDF</option>
                                <option value="docx">Word Document DOCX</option>
                                <option value="csv">Excel CSV</option>
                            </select>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="downloadSyllabus(${id})" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Download</button>
                        </div>
                    </div>
                </div>
            `);
        }

        async function downloadSyllabus(syllabus_id) {
            let format = $("#syl-format").val()

            let formData = {syllabus_id, format}
            //console.log(formData)
            showLoader(`Exporting syllabus to ${format}`)

            staff.subject.downloadSyllabus({
                formData: formData,
                onSuccess: (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        d = data.data;
                        showToast(data.message, "success");
                        downloadFile(`${d.file_url}`,d.file_name)
                        closeModal()
                    }
                    else {
                        showToast(data.message, "error")
                    }
                    hideLoader()
                },
                onError: (error) => {
                    console.error(error);
                    showToast("Error occurred. Kindly check your internet connection", "error")
                    hideLoader()
                }
              })
        }

        async function manageTopics(id) {
            const course = courses.find(c => c.id === id);
            //console.log(course)
            await renderTopics(course)
            // Future: Open topics management modal
        }

        async function renderTopics(course) {
            let container = $('#topicsGrid');
            container.empty();
            let topics = course.topics;

            $(".course-tit").html(`${terms[course.term]} Term ${course.subject} for ${course.classrooms.join(', ')}`)
            //console.log(topics)

            if (topics.length === 0) {
                container.html(`<p class="col-span-3 text-center text-slate-500 py-12">No topics found.</p>`);
            }
            else {
                topics.forEach(topic => {
                    const html = `
                        <div class="course-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div class="h-2 bg-${course.color}-600"></div>
                            <div class="p-6">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-semibold text-xl">${topic.week}. ${topic.title}</h3>
                                        <p class="text-slate-500 dark:text-slate-400">${topic.description}</p>
                                    </div>
                                    <span class="text-4xl fa fa-book text-blue-800"></span>
                                </div>
                                
                                <div class="mt-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p class="text-slate-500 dark:text-slate-400">Objectives</p>
                                        <ol class="px-5 text-sm" style="list-style-type: alpha">
                                            ${topic.lesson_plan.objectives.map((item, index) => {
                                                return `<li>${item}</li>`
                                            })}
                                        </ol>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 dark:text-slate-400">Learning Materials</p>
                                        <ol class="px-5 text-sm" style="list-style-type: alpha">
                                            ${topic.lesson_plan.learning_materials.map((item, index) => {
                                                return `<li>${item}</li>`
                                            })}
                                        </ol>
                                    </div>
                                </div>
    
                                <div class="mt-6 flex gap-3">
                                    <button onclick="downloadNote(${topic.id})" 
                                            class="flex-1 py-3 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                        Download Note
                                    </button>
                                    <button onclick="manageNote(${topic.id})" 
                                            class="flex-1 py-3 text-sm font-medium bg-[#1e3a8a] text-white rounded-2xl hover:bg-blue-700">
                                        Update Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(html);
                });
            }
            switchTab(1)
           currentCourse = course.id
        }

        $(".gen-topic-btn").click(function() {
            let course = courses.find(c => c.id === currentCourse);
            if (!course) return;

            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">
                        Generate Topics for ${terms[course.term]} Term ${course.subject} Syllabus for ${course.classrooms.join(', ')}
                    </h3>
                    <div class="space-y-5">
                        <div>
                            <p class="block text-sm font-medium mb-1.5">
                                This will generate the standard scheme of work for the selected syllabus. 
                                This will override topic title and description for existing topics but will not override any existing notes
                            </p>
                            
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="generateTopics(${currentCourse})" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Generate</button>
                        </div>
                    </div>
                </div>
            `);
        })

        async function generateTopics(syllabus_id) {
            let formData = {syllabus_id}
            //console.log(formData)
            showLoader(`Generating Topics`)

            staff.subject.generateTopics({
                formData: formData,
                onSuccess: async (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        showToast(data.message, "success")
                        closeModal()
                        await getSyllabus(manageTopics);
                    }
                    else {
                        showToast(data.message, "error")
                    }
                    hideLoader()
                },
                onError: (error) => {
                    console.error(error);
                    showToast("Error occurred. Kindly check your internet connection", "error")
                    hideLoader()
                }
            })
        }

        async function downloadNote(topic_id) {
            let course = courses.find(c => c.id === currentCourse);
            if (!course) return;

            let topics = course.topics;
            let topic = topics.find(t => t.id === topic_id);

            let formData = {topic_id}
            
            showLoader(`Downloading PDF for \"${topic.title}\"`);
            
            staff.subject.generateNotePDF({
                formData: formData,
                onSuccess: (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        showToast(data.message, "success");
                        let d = data.data;
                        downloadFile(d)
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

        function manageNote(topic_id) {
            showLoader("Loading content...")

            staff.subject.getTopics({
                params: {topic_id},
                onSuccess: (data) => {
                    checkResponse(data)
                    //console.log(data)
                    if(data.status == "success") {
                        let d = data.data;
                        $("#note-title").val(d.title)
                        $("#note-des").val(d.description)
                        tinymce.get('note-content').setContent(d.content)
                        switchTab(2)
                        currentTopic = topic_id
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

        $(".update-note-form").on('submit', function(e) {
            e.preventDefault();

            let topic_id = currentTopic;
            let title = $("#note-title").val();
            let description = $("#note-des").val();
            let content = tinymce.get('note-content').getContent({format: 'html'});

            let formData = {topic_id, title, description, content}

            //console.log(formData)

            showLoader("Updating Note...");

            staff.subject.updateTopic({
                formData: formData,
                onSuccess: async(data) => {
                    checkResponse(data)
                    //console.log(data)
                    if(data.status == "success") {
                        showToast(data.message, "success")
                        await getSyllabus();
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
        })

        function generateContent() {
            let topic_id = currentTopic;
            let title = $("#note-title").val();
            let description = $("#note-des").val();
        
            let formData = {topic_id, title, description};
        
            showLoader("Generating Note...")
        
            staff.subject.generateAiNote({
                formData: formData,
                onSuccess: (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        showToast(data.message, "success")
                        let d = data.data;
                        let temp = `
                        ${renderMarkdown(d.content)}
                        <br></br>
                        <h4>Resources Used</h4>
                        <ul>
                        ${d.references.map((item, index) => {
                            return `<li>${item}</li>`
                        }).join('')}
                        </ul>
                        <h4>Practice Questions</h4>
                        <ol type="1">
                        ${d.questions.map((item, index) => {
                            return `<li>${item}</li>`
                        }).join('')}
                        </ol>
                        `;
                        tinymce.get('note-content').setContent(temp)
                    }
                    else {
                        showToast(data.message, "error")
                    }
                    hideLoader()
                },
                onError: (error) => {
                    console.error(error);
                    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                    hideLoader()
                }
            })
        }

        $(".gen-note-btn").on('click', function(e) {e.preventDefault(); generateContent()})

        // ==================== TAB SWITCHING ====================
        function switchTab(tabIndex) {
            $('.tab-active').removeClass('tab-active');
            $(`#tab${tabIndex}`).addClass('tab-active');

            $('#subjectsSection').toggleClass('hidden', tabIndex !== 0);
            $('#topicsSection').toggleClass('hidden', tabIndex !== 1);
            $('#notesSection').toggleClass('hidden', tabIndex !== 2);
            currentTab = tabIndex
        }

        // ==================== MODALS ====================
        function openAddSubjectModal() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Add New Subject</h3>
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Subject Name</label>
                            <input type="text" id="subjectName" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl" placeholder="e.g. Physics">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Class Level</label>
                            <select id="classLevel" class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                                <option>JS1</option>
                                <option>JS2</option>
                                <option>JS3</option>
                                <option>SS1</option>
                                <option>SS2</option>
                                <option>SS3</option>
                            </select>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                            <button onclick="addNewSubject()" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Add Subject</button>
                        </div>
                    </div>
                </div>
            `);
        }

        function addNewSubject() {
            const subjectName = $('#subjectName').val().trim();
            if (!subjectName) {
                showToast("Please enter a subject name", "warning");
                return;
            }
            closeModal();
            showToast(`Subject "${subjectName}" added successfully!`, "success");
            
            // Simulate adding to list
            setTimeout(() => {
                courses.unshift({
                    id: Date.now(),
                    subject: subjectName,
                    class: $('#classLevel').val(),
                    students: Math.floor(Math.random() * 30) + 20,
                    topics: 0,
                    color: "blue"
                });
                renderCourses();
            }, 300);
        }

        //renderCourses()
        //switchTab(0)
        
    $("#tab0").click(function() {
        switchTab(0);
        currentCourse = null;
        currentTopic = null
    })
    $("#tab1").click(function() {
        if(currentTab === 2) {
            switchTab(1);
            currentTopic = null;
            manageTopics(currentCourse)
        } 
    })
    
    // ==================== INITIALIZATION ====================
    
    $(document).ready(function() {
            initTailwind();

            // Load saved theme
            loadTheme()

            showLoader("Loading syllabus...")
            getSyllabus()
            
            switchTab(0)
            initiateTiny(true)

            // Close modal when clicking outside

        });