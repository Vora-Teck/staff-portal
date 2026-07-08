showLoader("Loading Data...")

function getData() {

    admin.school.schoolData({
        params: {page: "calendar"},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data;
                    $(".class-no").html(digify(d.total));
                    $(".sub-no").html(digify(d.past));
                    $(".mat-no").html(digify(d.upcoming));
                    $("#term-weeks").val(d.wpt);
                    let terms = d.terms;
                    $(".term-filter").empty()
                    for(let i in terms) {
                        let temp = `<option value="${terms[i].term}">${terms[i].title} Term</option>`;
                        $(".term-filter").append(temp)
                    }
                }
                else {
                        pushNotification("n_error", data.message, 3000)
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

getData()


/* =========== Calendar Section =============== */
function getSessions() {
    $(".session-list").empty();

    loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.session-list').append(loader)

    admin.calendar.sessionList({
            onSuccess: (data) => {
                //console.log(data)
                $(".session-list").empty()
                $(".session-filter").empty()
                if(data.status == "success") {
                    let d = data.data
                    
                    for(let i in d) {
                        let temp = `
                        <tr>
                        <td class="w-bold-x">${d[i].title}</td>
                        <td class="w-center">${d[i].start_year}</td>
                        <td class="w-center">${d[i].end_year}</td>
                        <td class="w-text-gray w-center h4">
                                <a class="emp-det-link tooltipa" href="#" data-id='${JSON.stringify(d[i])}'>
                                    <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Update Session</span>
                                </a>
                            </td>
                        </tr>`;
                        $(".session-list").append(temp)

                        let temp2 = `<option value="${d[i].id}">${d[i].title}</option>`;
                        $(".session-filter").append(temp2)
                    }

                    $('.emp-det-link').click(function(e) {
                        e.preventDefault();
                        let obj = $(this).data('id');
                        getSession(obj)
                    })
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.session-list').append(temp)
                }
            },
            onError: (error) => {
                console.error(error);
                $('.session-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            }
    })
}
getSessions()

function addSession() {
    let start_year = $("#sess-start").val();
    let end_year = $("#sess-end").val();

    if(!start_year) {
        pushNotification("n_warning", "Kindly provide the start year", 3000);
        return;
    }
    if(!end_year) {
        pushNotification("n_warning", "Kindly provide the end year", 3000);
        return;
    }

    let formData = {start_year, end_year}

    //console.log(formData)

    showLoader("Creating New Session...")

    admin.calendar.createSession({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-sess-form")[0].reset();
                $(".add-sess-con").removeClass('active')
                getSessions()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function getSession(obj) {
    $("#sess-title").html(obj.title);
    $("#sess-id").val(obj.id);
    $("#sess-start2").val(obj.start_year);
    $("#sess-end2").val(obj.end_year);

    $(".update-sess-con").addClass("active")
}

function updateSession() {
    let start_year = $("#sess-start2").val();
    let end_year = $("#sess-end2").val();
    let session_id = $("#sess-id").val()

    if(!start_year) {
        pushNotification("n_warning", "Kindly provide the start year", 3000);
        return;
    }
    if(!end_year) {
        pushNotification("n_warning", "Kindly provide the end year", 3000);
        return;
    }

    let formData = {start_year, end_year, session_id}

    //console.log(formData)

    showLoader("Updating Session...")

    admin.calendar.updateSession({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-sess-form")[0].reset();
                $(".update-sess-con").removeClass('active')
                getSessions()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function getTerms() {
    $('.term-list').empty()

    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.term-list').append(loader)

    admin.calendar.termList({
        onSuccess: (data) => {
                //console.log(data);
                $('.term-list').empty()
                if(data.status == 'success') {
                    let e = data.data;
                        
                    for(var i in e) {
                        let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].title}</div>
                            </td>
                            <td>${e[i].session.title}</td>
                            <td class="w-center">${e[i].number_of_weeks}</td>
                            <td class="w-center">${datify(e[i].start_date)}</td>
                            <td class="w-center">${datify(e[i].end_date)}</td>
                            <td class="w-text-gray h4 w-center">
                                <a class="term-det-link tooltipa" href="#" data-id='${JSON.stringify(e[i])}'>
                                    <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Update Term</span>
                                </a>
                            </td>
                          </tr>`;
                        $('.term-list').append(temp)
                    }
                    $('.term-det-link').click(function(e) {
                        e.preventDefault();
                        let obj = $(this).data('id');
                        getTerm(obj)
                    })
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.exam-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.exam-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getTerms()

function addTerm() {
    let session_id = $("#term-sess").val();
    let term = $("#term-term").val();
    let start_date = $("#term-start").val();
    let weeks = $("#term-weeks").val();

    if(!start_date) {
        pushNotification("n_warning", "Kindly provide the commencement date", 3000);
        return;
    }
    if(!weeks || weeks < 10) {
        pushNotification("n_warning", "Number of weeks cannot be less than 10", 3000);
        return;
    }

    let formData = {session_id, term, start_date, weeks}

    //console.log(formData)

    showLoader("Creating New Term...")

    admin.calendar.createTerm({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-term-form")[0].reset();
                $(".add-term-con").removeClass('active')
                getTerms()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function getTerm(obj) {
    //console.log(obj)
    $(".term-title").html(`${obj.title} ${obj.session.title}`);
    $("#term-id").val(obj.id);
    $("#term-term2").val(obj.term);
    $("#term-weeks2").val(obj.number_of_weeks);

    $(".update-term-con").addClass("active")
}

function updateTerm() {
    let term_id = $("#term-id").val();
    let term = $("#term-term2").val();
    let weeks = $("#term-weeks2").val();

    if(!term_id) {
        pushNotification("n_warning", "Invalid selected term", 3000);
        return;
    }
    if(!weeks || weeks < 10) {
        pushNotification("n_warning", "Number of weeks cannot be less than 10", 3000);
        return;
    }

    let formData = {term_id, term, weeks}

    //console.log(formData)

    showLoader("Updating Term...")

    admin.calendar.updateTerm({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-term-form")[0].reset();
                $(".update-term-con").removeClass('active')
                getTerms()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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



/* =========== Exam Section =============== */
function getEvents() {
    let page = $('#emp_page').val();
    let pagesize = 10;
    let search = $('#emp_search').val();
    let status = $("#status-filter").val();

    $('.event-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.event-list').append(loader)

    let params = {page, pagesize, status, search}

    //console.log(params)

    admin.calendar.eventList({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.event-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos').append(temp);
                    }
                    let current_p = $('#page_nos .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos').append(next);
                    }
                    $('#page_nos .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page').val(page);
                        getEvents();
                    })
                    if(data.data) {
                        let e = data.data;

                        let stat = {upcoming: "info-btn", ongoing: "success-btn", past: "danger-btn"}
                        
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].title}</div>
                            </td>
                            <td>${datify(e[i].date)}</td>
                            <td>${timify(e[i].time)}</td>
                            <td class="w-center">
                            <span class="${stat[e[i].status.toLowerCase()]}">${e[i].status}</span>
                            </td>
                            <td>${e[i].venue}</td>
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">${e[i].title}</div>
                                            <a class="dropdown-item ev-broad-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-bullhorn"></i>&nbsp;
                                                ${e[i].broadcasted === true ? `Rebroadcast` : `Broadcast`} Event
                                            </a>
                                            <a class="dropdown-item ev-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Update Event
                                            </a>
                                            <a class="dropdown-item w-text-red w-hover-red ev-del-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-trash"></i>&nbsp;Delete Event
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.event-list').append(temp)
                        }
                        $('.ev-del-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getEvent(obj, "delete")
                        })
                        $('.ev-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getEvent(obj, "update")
                        })
                        $('.ev-broad-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getEvent(obj, "broadcast")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.event-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.event-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.event-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getEvents()

function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
}

var delayedSearch = debounce(getEvents, 500)


function addEvent() {
    let title = $("#event-title").val();
    let datetime = $("#event-date").val();
    let [date, time] = datetime.split('T');
    let venue = $("#event-venue").val();
    let description = $("#event-des").val();


    let formData = {title, date, time, venue, description}

    //console.log(formData)

    showLoader("Creating New Event...")

    admin.calendar.createEvent({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-event-form")[0].reset();
                $(".add-event-con").removeClass('active')
                getEvents()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function getEvent(obj, action) {
    //console.log(obj)
    $(".event-name").html(`${obj.title}`);
    $(".event-id").val(obj.id);
    if(action == "update") {
        $("#event-title2").val(obj.title);
        $("#event-venue2").val(obj.venue);
        $("#event-des2").val(obj.description);
        $("#event-date2").val(`${obj.date}T${obj.time}`);
    }
    $(`.${action}-event-con`).addClass("active")
}

function updateEvent() {
    let event_id = $(".event-id").val();
    let title = $("#event-title2").val();
    let datetime = $("#event-date2").val();
    let [date, time] = datetime.split('T');
    let venue = $("#event-venue2").val();
    let description = $("#event-des2").val();

    let formData = {event_id, title, date, time, venue, description}

    showLoader("Updating Event...")

    admin.calendar.updateEvent({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-event-form")[0].reset();
                $(".update-event-con").removeClass('active')
                getEvents()
                getData()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function deleteEvent() {
    let event_id = $(".event-id").val();

    let formData = {event_id}

    showLoader("Deleting Event...")

    admin.calendar.deleteEvent({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-event-form")[0].reset();
                $(".delete-event-con").removeClass('active')
                getEvents()
                getData()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function broadcastEvent() {
    let event_id = $(".event-id").val();

    let audience = $("input[name='event-audience']:checked").map(function() {
        return $(this).val();
    }).get();
    
    let media = $("input[name='event-media']:checked").map(function() {
        return $(this).val();
    }).get();

    let formData = {event_id, audience, media}

    //console.log(formData)

    showLoader("Broadcasting Event...")

    admin.calendar.broadcastEvent({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".broadcast-event-form")[0].reset();
                $(".broadcast-event-con").removeClass('active')
                getEvents()
            }
            else {
                pushNotification("n_error", data.message, 5000)
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



// ========== Event Listeners ======================
$(".add-sess-btn").click(function(e) {e.preventDefault();$(".add-sess-con").addClass('active')})
$(".add-term-btn").click(function(e) {e.preventDefault();$(".add-term-con").addClass('active')})
$(".add-event-btn").click(function(e) {e.preventDefault();$(".add-event-con").addClass('active')})


$(".add-sess-form").on('submit', function(e) {e.preventDefault();addSession()})
$(".update-sess-form").on('submit', function(e) {e.preventDefault();updateSession()})
$(".add-term-form").on('submit', function(e) {e.preventDefault();addTerm()})
$(".update-term-form").on('submit', function(e) {e.preventDefault();updateTerm()})
$(".add-event-form").on('submit', function(e) {e.preventDefault();addEvent()})
$(".update-event-form").on('submit', function(e) {e.preventDefault();updateEvent()})
$(".delete-event-form").on('submit', function(e) {e.preventDefault();deleteEvent()})
$(".broadcast-event-form").on('submit', function(e) {e.preventDefault();broadcastEvent()})

