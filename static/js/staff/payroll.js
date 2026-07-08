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

var payrollHistory = [
            {
                id: 1,
                month: "March 2026",
                basic: "420000",
                allowances: "85000",
                deductions: "20000",
                net: "485000",
                status: "Paid",
                date: "28 Mar 2026"
            },
            {
                id: 2,
                month: "February 2026",
                basic: "420000",
                allowances: "85000",
                deductions: "20000",
                net: "485000",
                status: "Paid",
                date: "27 Feb 2026"
            },
            {
                id: 3,
                month: "January 2026",
                basic: "420000",
                allowances: "85000",
                deductions: "20000",
                net: "485000",
                status: "Paid",
                date: "30 Jan 2026"
            },
            {
                id: 4,
                month: "December 2025",
                basic: "410000",
                allowances: "82000",
                deductions: "18000",
                net: "474000",
                status: "Paid",
                date: "28 Dec 2025"
            }
        ];

        // Render Payroll Table
        function renderPayroll() {
            const tbody = $('#payrollTableBody');
            tbody.empty();

            payrollHistory.forEach(record => {
                const html = `
                    <tr class="payroll-card hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td class="px-6 py-6 font-medium">${record.month}</td>
                        <td class="px-6 py-6">₦${parseInt(record.basic).toLocaleString()}</td>
                        <td class="px-6 py-6 text-emerald-600">₦${parseInt(record.allowances).toLocaleString()}</td>
                        <td class="px-6 py-6 text-red-600">-₦${parseInt(record.deductions).toLocaleString()}</td>
                        <td class="px-6 py-6 font-semibold">₦${parseInt(record.net).toLocaleString()}</td>
                        <td class="px-6 py-6 text-center">
                            <span class="inline-block px-5 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold rounded-2xl">
                                ${record.status}
                            </span>
                        </td>
                        <td class="px-6 py-6 text-center">
                            <button onclick="viewPayslip(${record.id})" 
                                    class="text-[#1e3a8a] dark:text-blue-400 hover:underline text-sm font-medium">
                                View Receipt
                            </button>
                        </td>
                    </tr>
                `;
                tbody.append(html);
            });
        }

        // ==================== ACTIONS ====================
        function generatePayslip() {
            showToast("Generating latest payslip PDF...", "info");
            setTimeout(() => {
                showToast("Payslip downloaded successfully!", "success");
            }, 1500);
        }

        function viewPayslip(id) {
            const record = payrollHistory.find(p => p.id === id);
            if (!record) return;

            showModal(`
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-semibold">Payslip • ${record.month}</h3>
                        <button onclick="closeModal()" class="text-3xl text-slate-400 hover:text-slate-600">×</button>
                    </div>
                    
                    <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8">
                        <div class="space-y-4 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-500">Basic Salary</span>
                                <span>₦${parseInt(record.basic).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Allowances</span>
                                <span class="text-emerald-600">+ ₦${parseInt(record.allowances).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Deductions</span>
                                <span class="text-red-600">- ₦${parseInt(record.deductions).toLocaleString()}</span>
                            </div>
                            <div class="border-t border-slate-300 dark:border-slate-600 pt-4 flex justify-between font-semibold">
                                <span>Net Pay</span>
                                <span class="text-xl">₦${parseInt(record.net).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Close</button>
                        <button onclick="closeModal();showToast('Payslip receipt downloaded!', 'success')" 
                                class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">
                            Download PDF
                        </button>
                    </div>
                </div>
            `);
        }

        function openFilterModal() {
            showToast("Advanced filter options coming soon", "info");
        }

$(document).ready(function() {
            initTailwind();

            loadTheme()

            renderPayroll();
            hideLoader();

            setTimeout(() => {
                showToast('Payroll data loaded successfully', 'success');
            }, 800);

            
        });