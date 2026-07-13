function triggerAvatarUpload() {
            showToast("Profile picture upload simulated. In real app, file picker would open.", "info");
            // Simulate avatar change
            setTimeout(() => {
                $('#profileAvatar').attr('src', 'https://i.pravatar.cc/300?u=updated');
                showToast("Profile picture updated successfully!", "success");
            }, 800);
        }

        function savePersonalInfo() {
            const newName = $('#nameInput').val();
            if (newName) {
                $('#fullName').text(newName);
                showToast("Personal information saved successfully!", "success");
            }
        }

        function openChangePasswordModal() {
            showModal(`
                <div class="p-8">
                    <h3 class="text-2xl font-semibold mb-6">Change Password</h3>
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Current Password</label>
                            <input type="password" id="currentPass" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1.5">New Password</label>
                            <input type="password" id="newPass" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1.5">Confirm New Password</label>
                            <input type="password" id="confirmPass" 
                                   class="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-8">
                        <button onclick="closeModal()" class="flex-1 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl font-medium">Cancel</button>
                        <button onclick="changePassword()" class="flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Update Password</button>
                    </div>
                </div>
            `);
        }

        function changePassword() {
            closeModal();
            showToast("Password changed successfully!", "success");
        }

        function toggle2FA() {
            const isEnabled = $('#twoFactorToggle').is(':checked');
            showToast(isEnabled ? "Two-Factor Authentication Enabled" : "Two-Factor Authentication Disabled", "info");
        }

        function logout() {
            if (confirm("Are you sure you want to logout from this device?")) {
                showLoader("Logging out...")
                staff.account.logout({
                    onSuccess: (data) => {
                            //console.log(data);
                            if(data.status == 'success') {
                                    showToast(data.message)
                                    sessionStorage.removeItem("educa_user_info");
                                    localStorage.removeItem("user_stat")
                                    location.href = '/staff/login/'
                            }
                            else {
                                    showToast(data.message, "error")
                            }
                            hideLoader()
                    },
                    onError: (error) => {
                            console.error(error);
                            showToast("Error occurred: " + error, "error")
                            hideLoader()
                    }
              })
                
            }
        }
        
        
        
        $(document).ready(function() {
            initTailwind();

            loadTheme()

            hideLoader();

        });
