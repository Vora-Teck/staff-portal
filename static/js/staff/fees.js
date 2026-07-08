showLoader("Loading Data...")

function getData() {

    showLoader("Loading Data...")
  
    admin.school.schoolData({
      params: {page: "fees"},
        onSuccess: (data) => {
                //console.log(data);
                let d = data.data;
                if(data.status == 'success') {
                    $(".bal-item").html(`&#8358;${shortify(d.balance, true)}`)
                    $(".bal-item2").html(`&#8358;${digify(d.balance, true)}`)
                    
                    $(".fee-item").html(`&#8358;${shortify(d.fees.total_paid, true)}`)
                    $(".fee-item2").html(`&#8358;${shortify(d.fees.paid_this_term, true)}`)

                    $(".out-item").html(`&#8358;${shortify(d.fees.total_unpaid, true)}`)
                    $(".out-item2").html(`&#8358;${shortify(d.fees.unpaid_this_term, true)}`)
  
                    
                    //drawFeeChart(d.fees)
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

function getTerms() {
    $('#term-filter').empty()
    $('#tuition-term').empty()

    admin.calendar.termList({
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let e = data.data;
                        
                    for(var i in e) {
                        let temp = `<option value="${e[i].id}">${e[i].session.title} - ${e[i].title}</option>`;
                        $('#term-filter').append(temp)
                        $('#tuition-term').append(temp)
                    }
                    getTuitions()
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                }
        },
        onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getTerms()

function getClassrooms() {
    $(".class-list").empty()
    admin.classroom.getClassrooms({
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    for(let i in d) {
                        $("#class-filter").append(`<option value="${d[i].id}">${d[i].level.title}</option>`);

                        let temp2 = `
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" value="${d[i].id}" id="class_${d[i].id}" name="class_ids">
                                <label class="custom-control-label" for="class_${d[i].id}">${d[i].level.title}</label>
                            </div>`;
                        $(".class-list").append(temp2)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                }
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            }
    })
}
getClassrooms()



/* =========== Tuition Section =============== */
function getTuitions() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let class_id = $('#class-filter').val();
    let term_id = $("#term-filter").val();

    $('.tuition-list').empty()
    loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.tuition-list').append(loader)

    let params = {page, pagesize, class_id, term_id}

    //console.log(params)

    admin.fees.getTuitions({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.tuition-list').empty()
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
                        getTuitions();
                    })
                    if(data.data) {
                        let e = data.data;

                        for(var i in e) {
                            let det = e[i].details
                            let info = ``
                            for(let j in det) {
                                info += `<li>${j} - &#8358;${digify(det[j], false)}</li>`
                            }
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">
                                <ul style="padding-left: 20px;">
                                    ${e[i].classrooms.map((item, index) => {
                                        return `<li>${item.level.title}</li>`
                                    }).join('')}
                                </ul>
                            </div>
                            </td>
                            <td>&#8358;${digify(e[i].amount)}</td>
                            <td>${info}</td>

                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item ev-pay-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-money"></i>&nbsp;View Payments
                                            </a>
                                            <a class="dropdown-item ev-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Edit Tuition
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.tuition-list').append(temp)
                        }
                        $('.ev-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getTuition(obj, "update")
                        })
                        $('.ev-pay-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTuitionFees(id)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data.message} for ${data.filters.classroom || ''} ${data.filters.term.split(':')[1].trim()}</td>
                        </tr>`;
                        $('.tuition-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.tuition-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.tuition-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}


function addTuition() {
    let term_id = $("#tuition-term").val();
    let class_ids = $("input[name='class_ids']:checked").map(function() {
        return $(this).val();
      }).get();
    let amount = $("#tuition-amount").val();
    let breakdown = {}

    $(".e-breakdown-key").each(function() {
        var value = $(this).val();
        if(value.trim() !== "") {
            breakdown[value] = $(this).siblings(".e-breakdown-value").val();
        }
    })


    let formData = {term_id, class_ids, amount, breakdown}

    console.log(formData)

    showLoader("Creating New Tuition...")

    admin.fees.addTuition({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-fees-form")[0].reset();
                $(".add-fees-con").removeClass('active')
                $(".breakdown-con").empty()
                getData()
                getTuitions()
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

function getTuition(obj, action) {
    //console.log(obj)
    $(".fees-name").html(`Tuition for ${obj.term.title} ${obj.term.session.title}`);
    $(".fees-id").val(obj.id);
    if(action == "update") {
        $("#tuition-amount2").val(obj.amount);
        $(".tuition-class2").html(obj.classrooms.map((item, index) => {
            return `${item.level.title}`
        }).join(', '))
        let det = obj.details
        $(".breakdown-con2").empty()
        for(j in det) {
            var temp = `
                <div class="w-flex w-flex-start mb-2 w-align-center" style="gap:15px">
                    <input type="text" value="${j}" class="e-breakdown-key2" placeholder="e.g school uniform">
                    <div>:</div>
                    <input type="number" value="${det[j]}" class="e-breakdown-value2" placeholder="e.g &#8358;12,000">
                    <div class="fa fa-times w-text-red h3 rem-breakdown-btn2"></div>
                </div>`;
            $(".breakdown-con2").append(temp)
        }
        $(".rem-breakdown-btn2").click(function() {
            $(this).parent(".w-flex").remove();
        })
    }
    $(`.${action}-fees-con`).addClass("active")
}

$('#add-breakdown-btn').click(function(e) {
    e.preventDefault();
    var temp = `
    <div class="w-flex w-flex-start mb-2 w-align-center" style="gap:15px">
      <input type="text" class="e-breakdown-key" placeholder="e.g school uniform">
      <div>:</div>
      <input type="number" class="e-breakdown-value" placeholder="e.g &#8358;12,000">
      <div class="fa fa-times w-text-red h3 rem-breakdown-btn"></div>
    </div>`;
    $(".breakdown-con").append(temp)
    $(".rem-breakdown-btn").click(function() {
      $(this).parent(".w-flex").remove();
    })
});

$('#add-breakdown-btn2').click(function(e) {
    e.preventDefault();
    var temp = `
    <div class="w-flex w-flex-start mb-2 w-align-center" style="gap:15px">
      <input type="text" class="e-breakdown-key2" placeholder="e.g school uniform">
      <div>:</div>
      <input type="number" class="e-breakdown-value2" placeholder="e.g &#8358;12,000">
      <div class="fa fa-times w-text-red h3 rem-breakdown-btn2"></div>
    </div>`;
    $(".breakdown-con2").append(temp)
    $(".rem-breakdown-btn2").click(function() {
      $(this).parent(".w-flex").remove();
    })
});

function updateTuition() {
    let tuition_id = $(".fees-id").val();
    let amount = $("#tuition-amount2").val();
    let breakdown = {}

    $(".e-breakdown-key2").each(function() {
        var value = $(this).val();
        if(value.trim() !== "") {
            breakdown[value] = $(this).siblings(".e-breakdown-value2").val();
        }
    })


    let formData = {tuition_id, amount, breakdown}

    //console.log(formData)

    showLoader("Updating Tuition...")

    admin.fees.updateTuition({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-fees-form")[0].reset();
                $(".update-fees-con").removeClass('active')
                $(".breakdown-con2").empty()
                getData()
                getTuitions()
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

var current_fees = {}

function getTuitionFees(obj) {
    
    $(".fees-name").data('id', obj.id).html(`Tuition for ${obj.term.title} ${obj.term.session.title}`);
    $(".tuition-class2").html(obj.classrooms.map((item, index) => {
        return `${item.level.title}`
    }).join(', '))
    $(".pay-side-con").addClass('active')
    $(".pay-list").empty()
    showLoader("Fetching data...")

    admin.fees.getTuitionFees({
        params: {tuition_id: obj.id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                current_fees = obj
                if(data.data) {
                    let d = data.data;
                    for(let i in d) {
                        let temp = `
                        <tr>
                            <td class="w-bold-x">${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}</td>
                            <td>${d[i].student.classroom.level.title}</td>
                            <td class="w-center">&#8358;${digify(d[i].tuition.amount)}</td>
                            <td class="w-center">
                            ${d[i].is_paid ? `
                            <span class="success-btn">Paid</span>` : `
                            <span class="danger-btn">Unpaid</span>`}
                            </td>
                            <td class="w-center">&#8358;${digify(d[i].amount_paid)}</td>
                            <td class="w-center">&#8358;${digify(d[i].outstanding)}</td>
                            <td>
                                <div class="dropdown">
                                    <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                    <div class="dropdown-menu">
                                    <div class="dropdown-header">
                                        ${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}
                                    </div>
                                        <a class="dropdown-item fee-trans-btn" data-id="${d[i].id}" 
                                        data-name="${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}"
                                        href="#">
                                            <i class="fa fa-print"></i>&nbsp;
                                            View Transactions
                                        </a>
                                        <a class="dropdown-item fee-mark-btn" data-id='${d[i].id}' 
                                        data-name="${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}" 
                                        href="#">
                                            <i class="fa fa-check-circle"></i>&nbsp;
                                            Manual Payment
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>`
                        $(".pay-list").append(temp)
                    }
                    $(".fee-trans-btn").click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        let name = $(this).data('name');
                        $(".pay-name2").html(name);
                        getTransactions(id)
                    })
                    $(".fee-mark-btn").click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        let name = $(this).data('name');

                        $("#pay-id").val(id);
                        $(".pay-name").html(name);

                        $(".pay-fees-con").addClass('active')
                    })
                }
                else {
                    let temp = `
                    <td colspan="7" class="w-text-gray"><i>${data.message}</i></td>
                    `;
                    $(".pay-list").append(temp)
                }
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

function payFees() {
    let fees_id = $("#pay-id").val();
    let amount = $("#fees-amount").val();
    let password = $("#fees-password").val();

    let formData = {fees_id, amount, password}

    //console.log(formData)

    showLoader("Processing...")

    admin.fees.updateFeeStatus({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".pay-fees-form")[0].reset();
                $(".pay-fees-con").removeClass('active')
                getData()
                getTuitionFees(current_fees)
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

function getTransactions(fees_id) {

    showLoader("Fetching transactions...")
    $(".trans-fees-form").empty()

    admin.fees.getFeeTransaction({
        params: {fees_id},
        onSuccess: (data) => {
            console.log(data)
            if(data.status == "success") {
                let d = data.data;
                let e = d.transactions;
                let t_status = {
                    success: "fa-check-circle w-text-green",
                    pending: "fa-clock-o w-text-orange",
                    failed: "fa-times-circle w-text-red",
                    reversed: "fa-repeat w-text-brown"
                }
                let stat_f = {
                    success: "success-btn", pending: "info-btn",
                    failed: "danger-btn", reversed: "warning-btn"
                }
                if(e.length > 0) {
                    for(let i in e) {
                        let temp = `
                        <div class="card">
                            <div class="card-header">
                                <a class="card-link" data-toggle="collapse" href="#collapse_${i}">
                                <i class="w-big fa ${t_status[e[i].status]}"></i>
                                &nbsp;&nbsp;Reference: ${e[i].reference} - ${e[i].status}
                                </a>
                            </div>
                            <div id="collapse_${i}" class="${parseInt(i) == 0 ? ``: `collapse`}" data-parent="#accordion">
                                <div class="w-padding">
                                    <div class="w-center mt-3 mb-3">
                                        <div class="h2 trans-amt w-bold-xx">&#8358;${digify(e[i].amount, true)}</div>
                                        <div class="h5 trans-stat mt-2">
                                            <span class="${stat_f[e[i].status]}">${e[i].status}</span>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table">
                                            <tbody class="trans-det-table">
                                            <tr>
                                                <td>Transaction Type</td>
                                                <td class="trans-type">${e[i].transaction_type}</td>
                                            </tr>
                                            <tr>
                                                <td>Description</td>
                                                <td class="trans-des">${e[i].description}</td>
                                            </tr>
                                            <tr>
                                                <td>Date</td>
                                                <td class="trans-date">${datify(e[i].date, true)}</td>
                                            </tr>
                                            <tr>
                                                <td>Reference</td>
                                                <td class="trans-ref">${e[i].reference}</td>
                                            </tr>
                                            <tr>
                                                <td>Payment Mode</td>
                                                <td class="trans-ref">${e[i].details.payment_mode}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div class="w-center mt-3 mb-3">
                                        <button class="dark-btn fee-rec-btn" data-id="${e[i].reference}">Download Receipt</button>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>`;
                        $(".trans-fees-form").append(temp)
                    }
                    $(".fee-rec-btn").click(function(e) {
                        e.preventDefault();
                        let ref = $(this).data('id');
                        generateReceipt(ref)
                    })
                }
                else {
                    let temp = `
                    <h4 class="w-text-gray"><i>No transaction made yet.</i></h4>
                    `;
                    $(".trans-fees-form").append(temp)
                }
                $(".trans-fees-con").addClass("active")
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


function generateReceipt(reference, type="transaction") {
    showLoader("Generating Receipt...")

    admin.transaction.generateReceipt({
        params: {reference, type},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                downloadFile(data.data)
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
$(".add-fees-btn").click(function(e) {e.preventDefault();$(".add-fees-con").addClass('active')})
$(".add-pay-btn").click(function(e) {e.preventDefault();$(".add-pay-con").addClass('active')})


$(".add-fees-form").on('submit', function(e) {e.preventDefault();addTuition()})
$(".update-fees-form").on('submit', function(e) {e.preventDefault();updateTuition()})
$(".pay-fees-form").on('submit', function(e) {e.preventDefault();payFees()})

