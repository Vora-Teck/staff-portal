initTailwind()
setupPasswordToggle()
//showUserInfo()
showSchoolInfo()

function setupPasswordToggle() {
        const toggleBtn = $('#togglePassword')
        const passwordInput = $('#password')
        const eyeIcon = $('#eyeIcon')
        
        toggleBtn.on('click', () => {
            if (passwordInput.attr('type') === 'password') {
                passwordInput.attr('type', 'text')
                eyeIcon.html(`
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908l3.428 3.428M9.546 5.546L12 3m-3.172 2.828L3 12" />
                `)
            } else {
                passwordInput.attr('type', 'password')
                eyeIcon.html(`
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                `)
            }
        })
}

function authenticate() {
        let email = $('#email').val();
        let password = $('#password').val();
    
        if(!email || !password) {
            showToast("Email or password cannot be empty", "warning");
            return
        }
        const formData = {email, password}
    
        let button = $('button.log-btn[type="submit"]')
        let originalText = button.html()
            
        // Loading state
        button.css('pointerEvents', 'none')
        button.html(`
                <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
        `)
    
        sessionStorage.removeItem("educa_user_info");
    
        staff.account.login({
            formData: formData,
            onSuccess: (data) => {
                //log(data);
                if(data.status == 'success') {
                        showToast(data.message)
                        localStorage.setItem("user_stat", "staff")
                        location.href = '/staff/'
                }
                else {
                        showToast(data.message, "error")
                }
                button.css('pointerEvents', 'auto')
                button.html(originalText)
            },
            onError: (error) => {
                //log(error);
                showToast(`Error occurred: ${error}`, "error")
                button.css('pointerEvents', 'auto')
                button.html(originalText)
            }
      })
    }

    
function resetPassword() {
        let email = $('#forgot-email').val().trim();
    
        if(email === "") {
            showToast("Email address required", "warning");
            return
        }
        const formData = {email}
        let button = $('button.reset-btn[type="submit"]')
        let originalText = button.html()

        $(".stat-msg").empty();
            
        // Loading state
        button.css('pointerEvents', 'none')
        button.html(`
                <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
        `)
    
        staff.account.forgotPassword({
            formData: formData,
            onSuccess: (data) => {
                console.log(data);
                if(data.status == 'success') {
                    showToast(data.message, "success") 
                    $(".stat-msg").html(`
                        <div class="p-4 w-full text-sm font-medium rounded-sm bg-emerald-100 text-emerald-700">${data.message}</div>
                    `)
                }
                else {
                    showToast(data.message, "error")
                    $(".stat-msg").html(`
                        <div class="p-4 w-full text-sm font-medium rounded-sm bg-red-100 text-red-700">${data.message}</div>
                    `)
                }
                button.css('pointerEvents', 'auto')
                button.html(originalText)
            },
            onError: (error) => {
                showToast(`Error occurred: ${error}`, "error")
                $(".stat-msg").html(`
                        <div class="p-4 w-full text-sm font-medium rounded-sm bg-red-100 text-red-700">Error occurred: ${error}</div>
                    `)
                button.css('pointerEvents', 'auto')
                button.html(originalText)
            }
      })
}

$(".forgot-pass-btn").on('click', (e) => {
    e.preventDefault();
    $(".switch-form").toggleClass("hidden")
})


$('#loginForm').submit(function(e) {
    e.preventDefault();
    authenticate();
})

$('#forgotForm').submit(function(e) {
        e.preventDefault();
        resetPassword();
    })





