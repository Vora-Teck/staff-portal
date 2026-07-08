function switchTab(tab) {
            $('.tab-active').removeClass('tab-active');
            $(`#tab${tab}`).addClass('tab-active');
            $('#eventsSection').toggleClass('hidden', tab !== 0);
            $('#memosSection').toggleClass('hidden', tab !== 1);
        }

        // ==================== SAMPLE DATA ====================
        var events = [
            { id: 1, title: "Inter-House Sports Competition", desc: "Annual sports event across all houses", date: "April 18, 2026", time: "8:00 AM", venue: "Sports Complex", status: "upcoming" },
            { id: 2, title: "Staff Meeting", desc: "End of term review and planning", date: "April 10, 2026", time: "2:00 PM", venue: "Main Auditorium", status: "ongoing" },
            { id: 3, title: "Parents-Teachers Association Meeting", desc: "Quarterly PTA meeting", date: "March 5, 2026", time: "10:00 AM", venue: "Hall A", status: "past" }
        ];

        var memos = [
            { id: 1, title: "Urgent Staff Meeting", content: "All teachers are required to attend a meeting on Monday at 3PM regarding examination preparations.", date: "April 2, 2026" },
            { id: 2, title: "Holiday Notice", content: "School will be closed from April 25 to May 5 for mid-term break.", date: "March 28, 2026" }
        ];

        // Render Events
        function renderEvents(filteredEvents = events) {
            const container = $('#eventsGrid');
            container.empty();

            filteredEvents.forEach(event => {
                const statusColor = event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                                   event.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
                
                const card = `
                    <div class="event-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="inline-block px-4 py-1 text-xs font-medium rounded-2xl ${statusColor}">${event.status.toUpperCase()}</span>
                                <h3 class="font-semibold text-lg mt-4">${event.title}</h3>
                            </div>
                            <span class="text-4xl fa fa-bullhorn"></span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">${event.desc}</p>
                        <div class="mt-6 space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-slate-500">Date</span><span>${event.date}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Time</span><span>${event.time}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Venue</span><span>${event.venue}</span></div>
                        </div>
                        <button onclick="viewEvent(${event.id})" 
                                class="mt-6 w-full py-3 border border-slate-300 dark:border-slate-600 rounded-2xl text-sm font-medium hover:bg-slate-50">
                            View Details
                        </button>
                    </div>
                `;
                container.append(card);
            });
        }

        function filterEvents(status) {
            $('.event-filter').removeClass('active bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
            if (status === 'all') {
                $('.event-filter:first').addClass('active bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
                renderEvents(events);
            } else {
                const filtered = events.filter(e => e.status === status);
                renderEvents(filtered);
            }
        }

        // Render Memos
        function renderMemos() {
            const container = $('#memosList');
            container.empty();

            memos.forEach(memo => {
                const item = `
                    <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <div class="flex justify-between">
                            <h4 class="font-medium">${memo.title}</h4>
                            <span class="text-xs text-slate-400">${memo.date}</span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 mt-3 text-sm">${memo.content}</p>
                        <button onclick="viewMemo(${memo.id})" 
                                class="mt-4 text-[#1e3a8a] dark:text-blue-400 text-sm font-medium">Read Full Memo →</button>
                    </div>
                `;
                container.append(item);
            });
        }

        function viewEvent(id) {
            showToast("Event details opened (demo)", "info");
        }

        function viewMemo(id) {
            showToast("Memo opened (demo)", "info");
        }
       
       $(document).ready(function() {
            initTailwind();

            loadTheme()

            renderEvents();
            renderMemos();
            hideLoader();

            setTimeout(() => showToast('Welcome to Messages &amp; Events', 'success'), 600);

            
        });