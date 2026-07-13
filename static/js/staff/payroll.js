/* =========== Transaction Section =============== */

var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
function setYearMonth() {
    let today = new Date();
    let curr_year = today.getFullYear();
    let curr_month = today.getMonth() + 1;

    // clear year option
    $("#year-filter").empty()
    $("#month-filter").empty()

    for(let i = 2026; i <= curr_year; i++) {
        var temp = `<option value="${i}">${i}</option>`;
        $("#year-filter").prepend(temp)
    }
    for(let i in months) {
        var temp = `<option value="${i}">${months[i]}</option>`;
        $("#month-filter").append(temp)
    }
    $("#year-filter").val((curr_year).toString())
    $("#month-filter").val((curr_month).toString())
    getPayroll()
}
//setYearMonth()

var payrollHistory = [];

async function loadPayroll() {
    staff.payroll.payrollHistory({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                payrollHistory = data.data
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderPayroll()
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

async function getData() {
        
        staff.school.schoolData({
            params: {page: "payroll"},
            onSuccess: (data) => {
                checkResponse(data)
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    $(".pay-avg").html(`&#8358;${digify(d.average_monthly)}`)
                    $(".pay-year").html(`&#8358;${digify(d.paid_this_year)}`)
                    $(".pay-date").html(d.next_date)
                    if(d.current_pay) {
                        $(".curr_pay").html(`&#8358;${digify(d.current_pay.amount)}`)
                        $(".curr_month").html(`${months[d.current_pay.month]} ${d.current_pay.year}`)
                        if(d.current_pay.date) {
                            $(".curr_date").html(` • Paid on ${datify(d.current_pay.date)}`)
                        }
                        if(d.current_pay.is_paid) {
                            $(".curr_btn").removeClass("hidden")
                            $(".curr_btn").data('id', d.current_pay.id)
                        }
                    }
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

$(".curr_btn").on('click', function() {
    let id = $(this).data('id');
    downloadReceipt(id)
})

// Render Payroll Table
async function renderPayroll() {
    const tbody = $('#payrollTableBody');
    tbody.empty();

    payrollHistory.forEach(record => {
        const html = `
                    <tr class="payroll-card hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td class="px-6 py-6 font-medium">${months[record.month]} ${record.year}</td>
                        <td class="px-6 py-6 text-center">&#8358;${digify(record.amount)}</td>
                        <td class="px-6 py-6 text-center text-emerald-600">&#8358;${digify(record.allowance)}</td>
                        <td class="px-6 py-6 text-center text-red-600">-&#8358;${digify(record.deduction)}</td>
                        <td class="px-6 py-6 text-center font-semibold">&#8358;${digify(record.net_amount)}</td>
                        <td class="px-6 py-6 text-center">
                        ${record.is_paid ? `
                            <span class="inline-block px-5 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold rounded-2xl">
                                Paid
                            </span>` : `
                            <span class="inline-block px-5 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs font-semibold rounded-2xl">
                                Unpaid
                            </span>`}
                            
                        </td>
                        <td class="px-6 py-6 text-center">
                        ${record.is_paid ? `
                            <button data-id="${record.id}"
                                    class="payroll-det-btn text-[#1e3a8a] dark:text-blue-400 hover:underline text-sm font-medium">
                                View Receipt
                            </button>`: ``}
                            
                        </td>
                    </tr>
                `;
                tbody.append(html);
    });
    
    $(".payroll-det-btn").on('click', function() {
        let id = $(this).data('id');
        viewPayslip(id)
    })
}

// ==================== ACTIONS ====================
function viewPayslip(id) {
        const record = payrollHistory.find(p => p.id === id);
        //console.log(record)
        if (!record) return;

        showModal(`
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-semibold">Payslip • ${months[record.month]} ${record.year}</h3>
                        <button onclick="closeModal()" class="text-3xl text-slate-400 hover:text-slate-600">×</button>
                    </div>
                    
                    <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8">
                        <div class="space-y-4 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-500">Basic Salary</span>
                                <span>₦${digify(record.amount)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Allowances</span>
                                <span class="text-emerald-600">+ ₦${digify(record.allowance)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Deductions</span>
                                <span class="text-red-600">- ₦${digify(record.deduction)}</span>
                            </div>
                            <div class="border-t border-slate-300 dark:border-slate-600 pt-4 flex justify-between font-semibold">
                                <span>Net Pay</span>
                                <span class="text-xl">₦${digify(record.net_amount)}</span>
                            </div>
                            <div class="flex justify-between mt-[20px]">
                                <span class="text-slate-500">Paid On</span>
                                <span>${datify(record.date, true)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Close</button>
                        <button class="download-pay-btn flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">
                            Download Receipt
                        </button>
                    </div>
                </div>
    `);

    $(".download-pay-btn").on('click', function() {
        downloadReceipt(id)
    })
}


async function downloadReceipt(payroll_id) {
    showLoader("Generating Receipt...")
    staff.payroll.generateReceipt({
        params: {payroll_id},
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                showToast("Receipt generated successfully", "success")
                downloadFile(data.data);
                closeModal()
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


$(document).ready(async function() {
    try {
        initTailwind();
        loadTheme()
        showLoader("Loading Data...")
        await getData()
        await loadPayroll();
    }
    catch(err) {console.log(err)}
});