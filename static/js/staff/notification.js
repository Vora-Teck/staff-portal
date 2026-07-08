var notifications = [
            {
                id: 1,
                type: "assignment",
                title: "New Assignment Posted",
                message: "Quadratic Equations homework due tomorrow for SS2",
                time: "5 min ago",
                unread: true,
                important: true
            },
            {
                id: 2,
                type: "exam",
                title: "Mid-Term Exam Reminder",
                message: "SS2 Mathematics mid-term starts on April 15",
                time: "1 hour ago",
                unread: true,
                important: false
            },
            {
                id: 3,
                type: "attendance",
                title: "Attendance Marked",
                message: "You marked attendance for JS1 Basic Math",
                time: "Yesterday",
                unread: false,
                important: false
            },
            {
                id: 4,
                type: "system",
                title: "System Update",
                message: "New feature: AI-powered grading suggestions enabled",
                time: "2 days ago",
                unread: false,
                important: false
            }
        ];

        function renderNotifications(filteredNotifications = notifications) {
            const container = $('#notificationsList');
            container.empty();

            if (filteredNotifications.length === 0) {
                container.html(`<p class="text-center text-slate-500 py-12">No notifications found.</p>`);
                return;
            }

            filteredNotifications.forEach(notif => {
                const html = `
                    <div onclick="markAsRead(${notif.id})" class="notification-item cursor-pointer flex gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 ${notif.unread ? 'unread' : ''}">
                        <div class="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-2xl fa fa-${notif.type === 'assignment' ? 'book' : notif.type === 'exam' ? 'file-text' : notif.type === 'attendance' ? 'check-circle' : 'bell'}"></div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between">
                                <p class="font-medium text-sm">${notif.title}</p>
                                <span class="text-xs text-slate-400 whitespace-nowrap">${notif.time}</span>
                            </div>
                            <p class="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">${notif.message}</p>
                        </div>
                        ${notif.unread ? `<div class="w-2 h-2 bg-[#1e3a8a] rounded-full mt-2"></div>` : ''}
                    </div>
                `;
                container.append(html);
            });
        }

        function markAsRead(id) {
            const notif = notifications.find(n => n.id === id);
            if (notif) {
                notif.unread = false;
                renderNotifications(notifications);
                showToast("Notification marked as read", "info");
            }
        }

        function markAllAsRead() {
            notifications.forEach(n => n.unread = false);
            renderNotifications(notifications);
            showToast("All notifications marked as read", "success");
        }

        function filterNotifications(filterType) {
            $('.active-filter').removeClass('active-filter bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
            
            if (filterType === 0) {
                $('#filter0').addClass('active-filter bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
                renderNotifications(notifications);
            } else if (filterType === 1) {
                $('#filter1').addClass('active-filter bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
                const unread = notifications.filter(n => n.unread);
                renderNotifications(unread);
            } else if (filterType === 2) {
                $('#filter2').addClass('active-filter bg-blue-50 dark:bg-blue-950 text-[#1e3a8a]');
                const important = notifications.filter(n => n.important);
                renderNotifications(important);
            }
        }

$(document).ready(function() {
            initTailwind();

            loadTheme();

            renderNotifications();
            hideLoader();

            setTimeout(() => {
                showToast('You have 2 new notifications', 'info');
            }, 800);

           
        });