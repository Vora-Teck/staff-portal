function loadResult() {
    $("main").empty()
    showLoader("loading Result...")

    let result = getQueryParams();
    //console.log(result)
    if(!result.type) {
        showToast('Invalid parameters', "error");
        $("main").html(`<h3>Invalid parameters</h3>`)
        hideLoader()
        return;
    }
    
    let perform_rating = ["4", "3", "2", "1"]

    if(result.type === "single") {
        if(!result.doc_id) {
            showToast('Result parameter not provided', "error");
            $("main").html(`<h3>Result parameter not provided</h3>`)
            hideLoader()
            return;
        }
        let result_id = result.doc_id
        staff.result.studentResult({
            params: {result_id},
            onSuccess: (data) => {
                    //console.log(data)
                    if(data.status == "success") {
                        let r = data.result;
                        let school = data.school;
                        let class_average = data.class_average;
                        let user = r.student;
                        let scores = r.scores;
                        let term = r.term;
                        let classroom = r.classroom;
                        let perform = r.data;

                        $('title').text(`${school.name} - Student Report Card`)
                        
                        let res_body = ``;
                        for(let sc in scores) {
                            let s = scores[sc]
                            let marks = s.marks;
                            let [exam_score, test_score] = [0, 0];
                            for (let i in marks) {
                                let m = marks[i];
                                if(m.exam.examType == 'exam') {exam_score += Number(m.score)}
                                else if(m.exam.examType == 'test') {test_score += Number(m.score)}
                                //console.log(marks[i])
                            }
                            let temp = `
                            <tr>
                                <td style="text-align:left;">${s.course.title}</td>
                                <td>${test_score}</td>
                                <td>${exam_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.grade || 'N/A'}</td>
                                <td style="text-align:left;">${s.remark.toUpperCase()}</td>
                            </tr>`;
                            res_body += temp
                        }

                        let header = `
                            <header>
                                <img class="school_logo" 
                                    src="${school.logo ? `${base_url}${school.logo}` : `/static/logos/logo.png`}" 
                                    alt="school_logo"
                                />
                                <div class="school-details">
                                    <h1 class="school_name">${school.name.toUpperCase()}</h1>
                                    <p class="address">${school.address.address}, ${school.address.lga} LGA, ${school.address.state} State, ${school.address.country}.</p>
                                    <p><b>Motto:</b> <span class="motto">${school.motto}</span></p>
                                    <p><b>Mobile:</b> ${school.phone_number} | <b>E-mail:</b> ${school.email}</p>
                                </div>
                            </header>`;

                        let student_info = `
                            <div class="student-info">
                                <table style="border:none;">
                                    <tr>
                                        
                                        <td rowspan="3" class="photo-placeholder">
                                            <img 
                                                class="user_img" 
                                                src="${user.image ? `${base_url}${user.image}` : `${base_url}${school.logo}`}" 
                                                style="width:100%;height:100%;" 
                                                alt="user_image"
                                            />
                                        </td>
                                        <td class="orange">Name: ${user.firstName} ${user.middleName} ${user.lastName}</td>
                                        <td class="orange">Session: ${term.session.title}</td>
                                        <td class="orange">Class: ${classroom.level.title}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">Admission No: ${user.studentId}</td>
                                        <td class="orange">Term: ${term.title}</td>
                                        <td class="orange">Position: ${r.position}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">No in Class: ${digify(classroom.data.total_students)}</td>
                                        <td class="orange">Date of Birth: ${datify(user.dateOfBirth)}</td>
                                        <td class="orange">
                                        <div class="w-flex w-flex-start w-align-center">
                                        <span>Remark: </span><input id="remark" type="text" value="${perform.remark}" placeholder="Your remark here" />
                                        </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let attendance = `
                            <div class="attendance-class">
                                <table>
                                    <tr>
                                        <td>No of Times School Opens: 112</td>
                                        <td>No of Times Present: 112</td>
                                        <td>Times Absent: 0</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let main = `
                        
                            <div class="subjects-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>SUBJECTS</th>
                                            <th>TEST</th>
                                            <th>EXAM</th>
                                            <th>TOTAL</th>
                                            <th>AVG.</th>
                                            <th>GRADE</th>
                                            <th>REMARKS</th>
                                        </tr>
                                        <!--
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>(100)</th>
                                            <th>%</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                        -->
                                    </thead>
                                    <tbody class="res_body">
                                        ${res_body}
                                    </tbody>
                                    <tfoot>
                                        <tr style="border:none !important">
                                            <td style="border:none !important" colspan="7"></td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">TOTAL</th>
                                            <td id="total">${digify(r.total_score)}</td>
                                            <th colspan="2">Obtainable Marks</th>
                                            <td id="obtainable">${digify(r.total_score_obtainable)}</td>
                                            
                                        </tr>
                                        <tr>
                                            <th colspan="2">Percentage</th>
                                            <td id="average">${r.average_score}%</td>
                                            <th colspan="2">Class Average</th>
                                            <td id="class_avg">${class_average}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>`;
                        
                        let domain_table = `
                        <table>
                                    <tr>
                                        <th>Affective Domain</th>
                                        ${perform_rating.map((item, index) => {
                                            return `<th>${item}</th>`
                                        })}
                                    </tr>
                                    <tr>
                                        <td>Cooperation</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="affective_domain" value="${item}" name="cooperation">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Leadership</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="affective_domain" value="${item}" name="leadership">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Helping Others</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="affective_domain" value="${item}" name="helping_others">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Emotional Stability</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="affective_domain" value="${item}" name="emotional_stability">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Health</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="affective_domain" value="${item}" name="health">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                </table>`;
                        
                        let punc_table = `
                        <table>
                                    <tr>
                                        <th>Attitude</th>
                                        ${perform_rating.map((item, index) => {
                                            return `<th>${item}</th>`
                                        })}
                                    </tr>
                                    <tr>
                                        <td>Punctuality</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="attitude" value="${item}" name="punctuality">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Neatness</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="attitude" value="${item}" name="neatness">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Politeness</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="attitude" value="${item}" name="politeness">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                </table>`;

                        let psycho_table = `
                        <table>
                                    <tr>
                                        <th>Psychomotor</th>
                                        ${perform_rating.map((item, index) => {
                                            return `<th>${item}</th>`
                                        })}
                                    </tr>
                                    <tr>
                                        <td>Handwriting</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="psychomotor" value="${item}" name="handwriting">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Verbal Fluency</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="psychomotor" value="${item}" name="verbal_fluency">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Game</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="psychomotor" value="${item}" name="game">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Sport</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="psychomotor" value="${item}" name="sport">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                    <tr>
                                        <td>Handling Tools</td>
                                        ${perform_rating.map((item, index) => {
                                            return `
                                            <td>
                                                <input type="radio" data-name="psychomotor" value="${item}" name="handling_tools">
                                            </td>`
                                        }).join('')}
                                    </tr>
                                </table>`;
                        
                        let comments = `
                        <div class="comments">
                            <table>
                                <tr>
                                    <th>Class Teacher's Comment:</th>
                                    <td style="min-width:250px;">
                                    <input id="teacher_comment" type="text" value="${perform.class_teacher.comment}" placeholder="Your comment here" />
                                    </td>
                                    <th>Signature:</th>
                                    <td style="min-width:100px;">
                                    <input id="teacher_sign" type="text" value="${perform.class_teacher.signature}" placeholder="Your initials here" />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Principal's Comment:</th>
                                    <td>
                                    <input id="principal_comment" type="text" value="${perform.principal.comment}" placeholder="Your comment here" />
                                    </td>
                                    <th>Signature:</th>
                                    <td>
                                    <input id="principal_sign" type="text" value="${perform.principal.signature}" placeholder="Your initials here" />
                                    </td>
                                </tr>
                            </table>
                        </div>`;

                        let template = `
                        <section>
                            <form class="result-update-form" data-id="${r.id}">
                                ${header}
                                ${student_info}
                                ${attendance}
                                <div class="main-content">
                                    ${main}
                                
                                    <div class="domains">
                                        <!-- Affective domain table -->
                                        ${domain_table}
                                        <!-- Punctuality Table -->
                                        ${punc_table}
                                        <!-- Psychomotor table -->
                                        ${psycho_table}
                        
                                    </div>
                                </div>

                                ${comments}
                                <button type="submit" class="btn btn-primary btn-lg btn-block mt-3">Update Result</button>
                            </form>
                            
                        </section>`;
                        $("main").html(template)

                        $("input[type='radio']").each((index, elem) => {
                            let val = $(elem).val();
                            let section = $(elem).data('name');
                            let sub_section = $(elem).attr('name');

                            if(val == perform[section][sub_section]) {
                                $(elem).prop('checked', true)
                            }
                        })

                        $(".result-update-form").on('submit', function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            updateResult(id);
                        })
                    }
                    else {
                        showToast(data.message, "error")
                        $("main").html(`<h3>${data.message}</h3>`)
                    }
                    hideLoader()
            },
            onError: (error) => {
                console.error(error)
                showToast("Error occurred. Kindly check your internet connection", "error");
                hideLoader()
            }
        })
    }
    else if(result.type === "bulk") {
        if(!result.class_id || !result.term_id) {
            showToast('Result parameter not provided', "error");
            $("main").html(`<h3>Result parameter not provided</h3>`)
            hideLoader()
            return;
        }
        let class_id = result.class_id;
        let term_id = result.term_id;

        staff.result.classResult({
            params: {class_id, term_id},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    
                    let school = data.school;
                    let class_average = data.class_average;
                    let res = data.results;
                    $("main").empty()
                    for(p in res) {
                        let r = res[p];
                        let user = r.student;
                        let scores = r.scores;
                        let term = r.term;
                        let classroom = r.classroom;
                        let perform = r.data;

                        $('title').text(`${school.name} - Student Report Card`)
                        
                        let res_body = ``;
                        for(let sc in scores) {
                            let s = scores[sc]
                            let marks = s.marks;
                            let [exam_score, test_score] = [0, 0];
                            for (let i in marks) {
                                let m = marks[i];
                                if(m.exam.examType == 'exam') {exam_score += Number(m.score)}
                                else if(m.exam.examType == 'test') {test_score += Number(m.score)}
                                //console.log(marks[i])
                            }
                            let temp = `
                            <tr>
                                <td style="text-align:left;">${s.course.title}</td>
                                <td>${test_score}</td>
                                <td>${exam_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.total_score}</td>
                                <td>${s.grade || 'N/A'}</td>
                                <td style="text-align:left;">${s.remark.toUpperCase()}</td>
                            </tr>`;
                            res_body += temp
                        }

                        let header = `
                        <header>
                            <img class="school_logo" 
                                src="${school.logo ? `${base_url}${school.logo}` : `/static/logos/logo.png`}" 
                                alt="school_logo"
                            />
                            <div class="school-details">
                                <h1 class="school_name">${school.name.toUpperCase()}</h1>
                                <p class="address">${school.address.address}, ${school.address.lga} LGA, ${school.address.state} State, ${school.address.country}.</p>
                                <p><b>Motto:</b> <span class="motto">${school.motto}</span></p>
                                <p><b>Mobile:</b> ${school.phone_number} | <b>E-mail:</b> ${school.email}</p>
                            </div>
                        </header>`;

                        let student_info = `
                            <div class="student-info">
                                <table style="border:none;">
                                    <tr>
                                        
                                        <td rowspan="3" class="photo-placeholder">
                                            <img 
                                                class="user_img" 
                                                src="${user.image ? `${base_url}${user.image}` : `${base_url}${school.logo}`}" 
                                                style="width:100%;height:100%;" 
                                                alt="user_image"
                                            />
                                        </td>
                                        <td class="orange">Name: ${user.firstName} ${user.middleName} ${user.lastName}</td>
                                        <td class="orange">Session: ${term.session.title}</td>
                                        <td class="orange">Class: ${classroom.level.title}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">Admission No: ${user.studentId}</td>
                                        <td class="orange">Term: ${term.title}</td>
                                        <td class="orange">Position: ${r.position}</td>
                                    </tr>
                                    <tr>
                                        <td class="orange">No in Class: ${digify(classroom.data.total_students)}</td>
                                        <td class="orange">Date of Birth: ${datify(user.dateOfBirth)}</td>
                                        <td class="orange">Remark: ${perform.remark}</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let attendance = `
                            <div class="attendance-class">
                                <table>
                                    <tr>
                                        <td>No of Times School Opens: 112</td>
                                        <td>No of Times Present: 112</td>
                                        <td>Times Absent: 0</td>
                                    </tr>
                                </table>
                            </div>`;
                        
                        let main = `
                        
                            <div class="subjects-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>SUBJECTS</th>
                                            <th>TEST</th>
                                            <th>EXAM</th>
                                            <th>TOTAL</th>
                                            <th>AVG.</th>
                                            <th>GRADE</th>
                                            <th>REMARKS</th>
                                        </tr>
                                        <!--
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>(100)</th>
                                            <th>%</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                        -->
                                    </thead>
                                    <tbody class="res_body">
                                        ${res_body}
                                    </tbody>
                                    <tfoot>
                                        <tr style="border:none !important">
                                            <td style="border:none !important" colspan="7"></td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">TOTAL</th>
                                            <td id="total">${digify(r.total_score)}</td>
                                            <th colspan="2">Obtainable Marks</th>
                                            <td id="obtainable">${digify(r.total_score_obtainable)}</td>
                                            
                                        </tr>
                                        <tr>
                                            <th colspan="2">Percentage</th>
                                            <td id="average">${r.average_score}%</td>
                                            <th colspan="2">Class Average</th>
                                            <td id="class_avg">${class_average}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>`;
                        
                            let domain_table = `
                            <table>
                                        <tr>
                                            <th>Affective Domain</th>
                                            ${perform_rating.map((item, index) => {
                                                return `<th>${item}</th>`
                                            })}
                                        </tr>
                                        <tr>
                                            <td>Cooperation</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="affective_domain" 
                                                data-id="cooperation">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Leadership</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="affective_domain" 
                                                data-id="leadership">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Helping Others</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data"
                                                data-action="${item}" 
                                                data-name="affective_domain" 
                                                data-id="helping_others">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Emotional Stability</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="affective_domain" 
                                                data-id="emotional_stability">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Health</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="affective_domain" 
                                                data-id="health">
                                                </td>`
                                            }).join('')}
                                        </tr>
                            </table>`;
                            
                        let punc_table = `
                            <table>
                                        <tr>
                                            <th>Attitude</th>
                                            ${perform_rating.map((item, index) => {
                                                return `<th>${item}</th>`
                                            })}
                                        </tr>
                                        <tr>
                                            <td>Punctuality</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="attitude" 
                                                data-id="punctuality">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Neatness</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="attitude" 
                                                data-id="neatness">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Politeness</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="attitude" 
                                                data-id="politeness">
                                                </td>`
                                            }).join('')}
                                        </tr>
                            </table>`;
    
                        let psycho_table = `
                            <table>
                                        <tr>
                                            <th>Psychomotor</th>
                                            ${perform_rating.map((item, index) => {
                                                return `<th>${item}</th>`
                                            })}
                                        </tr>
                                        <tr>
                                            <td>Handwriting</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="psychomotor" 
                                                data-id="handwriting">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Verbal Fluency</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="psychomotor" 
                                                data-id="verbal_fluency">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Game</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="psychomotor" 
                                                data-id="game">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Sport</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="psychomotor" 
                                                data-id="sport">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                        <tr>
                                            <td>Handling Tools</td>
                                            ${perform_rating.map((item, index) => {
                                                return `
                                                <td class="perform_data" 
                                                data-action="${item}" 
                                                data-name="psychomotor" 
                                                data-id="handling_tools">
                                                </td>`
                                            }).join('')}
                                        </tr>
                                    </table>`;
                        
                        let comments = `
                                <div class="comments">
                                    <table>
                                        <tr>
                                            <th>Class Teacher's Comment:</th>
                                            <td style="min-width:250px;">${perform.class_teacher.comment}</td>
                                            <th>Signature:</th>
                                            <td style="min-width:100px;">${perform.class_teacher.signature}</td>
                                        </tr>
                                        <tr>
                                            <th>Principal's Comment:</th>
                                            <td style="min-width:250px;">${perform.principal.comment}</td>
                                            <th>Signature:</th>
                                            <td style="min-width:100px;">${perform.principal.signature}</td>
                                        </tr>
                                    </table>
                                </div>`;

                        let template = `
                        <section>
                            ${header}
                            ${student_info}
                            ${attendance}
                            <div class="main-content">
                                ${main}
                            
                                <div class="domains" id="domains_${p}">
                                    <!-- Affective domain table -->
                                    ${domain_table}
                                    <!-- Punctuality Table -->
                                    ${punc_table}
                                    <!-- Psychomotor table -->
                                    ${psycho_table}
                    
                                </div>
                            </div>

                        ${comments}
                        </section>`;
                        $("main").append(template)

                        $(`#domains_${p} .perform_data`).each((index, elem) => {
                            let val = $(elem).data('action');
                            let section = $(elem).data('name');
                            let sub_section = $(elem).data('id');

                            //console.log(val, section. sub_section)

                            if(val == perform[section][sub_section]) {
                                $(elem).html(`✓`)
                            }
                        })
                        $("main").append(`<div style='page-break-after: always'></div>`)
                    }
                }
                else {
                    showToast(data.message, "error")
                    $("main").html(`<h3>${data.message}</h3>`)
                }
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                showToast("Error occurred. Kindly check your internet connection", "error");
                hideLoader()
            }
        })
    }
    else {
        showToast('Invalid parameters', "error");
        $("main").html(`<h3>Invalid parameters</h3>`)
        hideLoader()
        return;
    }
}

loadResult()

function updateResult(result_id) {
    let payload = {
        class_teacher: {
            comment: $("#teacher_comment").val(),
            name: "",
            signature: $("#teacher_sign").val()
        },
        principal: {
            "comment": $("#principal_comment").val(),
            "name": "",
            "signature": $("#principal_sign").val()
        },
        remark: $("#remark").val(),
        affective_domain: {
            "cooperation": null,
            "leadership": null,
            "helping_others": null,
            "emotional_stability": null,
            "health": null
        },
        attitude: {
            "punctuality": null,
            "neatness": null,
            "politeness": null
        },
        psychomotor: {
            "handwriting": null,
            "verbal_fluency": null,
            "game": null,
            "sport": null,
            "handling_tools": null
        }
    }

    $("input[type='radio']").each((index, elem) => {
        let val = $(elem).val();
        let section = $(elem).data('name');
        let sub_section = $(elem).attr('name');

        if($(elem).is(':checked')) {
            payload[section][sub_section] = val
        }
    })

    let formData = {
        result_id, payload
    }

    //console.log(formData)
    showLoader("Updating Result...")

    staff.result.updateResult({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
                loadResult()
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

$(".download-btn").on('click', function() {
    window.print()
})