function switchTab(tab) {
    $('.tab-active').removeClass('tab-active');
    $(`#tab${tab}`).addClass('tab-active');
    $('#eventsSection').toggleClass('hidden', tab !== 0);
    $('#memosSection').toggleClass('hidden', tab !== 1);
}

// ==================== EVENTS ====================
var events = [];

// Render Events
function renderEvents(filter = "") {
    //console.log(filter)
            const container = $('#eventsGrid');
            container.empty();

            let filteredEvents = events.filter(x => x.status.toLowerCase().includes(filter.toLowerCase()))
            //console.log(filteredEvents)

            if(filteredEvents.length === 0) {
                container.append(`<div class="text-slate-500 text-md m-3">No ${filter} events found.</div>`);
                return
            }

            filteredEvents.forEach(event => {
                const statusColor = event.status.toLowerCase() === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                                   event.status.toLowerCase() === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
                
                const card = `
                    <div class="event-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="inline-block px-4 py-1 text-xs font-medium rounded-2xl ${statusColor}">${event.status.toUpperCase()}</span>
                                <h3 class="font-semibold text-lg mt-4">${event.title}</h3>
                            </div>
                            <span class="text-4xl fa fa-bullhorn"></span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">${event.description || 'No description provided'}</p>
                        <div class="mt-6 space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-slate-500">Date</span><span>${datify(event.date)}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Time</span><span>${timify(event.time)}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Venue</span><span>${event.venue}</span></div>
                        </div>
                        <!--
                        <button onclick="viewEvent(${event.id})" 
                                class="mt-6 w-full py-3 border border-slate-300 dark:border-slate-600 rounded-2xl text-sm font-medium hover:bg-slate-50">
                            View Details
                        </button>
                        -->
                    </div>
                `;
                container.append(card);
            });
}

async function loadEvents() {
    staff.school.getEvents({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                events = data.data || []
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderEvents()
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

$(".event-filter").on('click', async function() {
    let filt = $(this).val()
    await renderEvents(filt)
    $('.event-filter').removeClass('active bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
    $(this).addClass('active bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]')
})

// ==================== MEMOS ====================
var memos = [];

function renderMemos() {
    const container = $('#memosList');
    container.empty();

    memos.forEach(memo => {
        const item = `
            <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div class="flex justify-between">
                    <h4 class="font-medium">${memo.subject}</h4>
                    <span class="text-xs text-slate-400">${datify(memo.date)}</span>
                </div>
                <p class="text-slate-600 dark:text-slate-400 mt-3 text-sm">${truncateWord(memo.message, 100)}</p>
                <button data-id="${memo.id}" 
                    class="view-memo-btn mt-4 text-[#1e3a8a] dark:text-blue-400 text-sm font-medium">Read Full Memo →</button>
            </div>
        `;
        container.append(item);
    });

    $(".view-memo-btn").on('click', function() {
        let id = $(this).data('id')
        viewMemo(id)
    })
}

async function loadMemos() {
    staff.school.getMemos({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                memos = data.data || []
                //showToast('Courses & Subjects loaded successfully', 'success');
                await renderMemos()
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


function viewMemo(id) {
    let memo = memos.find(x => x.id == id);
    //console.log(memo);

    showModal(`
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-semibold">${memo.subject}</h3>
                        <button onclick="closeModal()" class="text-3xl text-slate-400 hover:text-slate-600">×</button>
                    </div>
                    
                    <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8">
                        <div class="space-y-4 text-md">
                            <div class="text-slate-500">
                                ${memo.message}
                            </div>
                            <div class="border-t border-slate-300 dark:border-slate-600 pt-4 flex justify-between mt-[20px] font-semibold">
                                <span class="text-slate-500">Sent On</span>
                                <span>${datify(memo.date, true)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Close</button>
                    </div>
                </div>
    `);
}

$("#tab0").on('click', () => switchTab(0))
$("#tab1").on('click', () => switchTab(1))
       
$(document).ready(async function() {
    initTailwind();
    showLoader("Loading data...")
    loadTheme()
    await loadEvents();
    await loadMemos();
            
});