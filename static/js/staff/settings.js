async function loadProfile() {
    staff.account.getProfile({
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $("#nameInput").val(`${d.title} ${d.firstName} ${d.middleName} ${d.lastName}`)
                $("#telInput").val(d.phone_number)
                $("#emailInput").val(d.email)
                $("#idInput").val(d.staffId)
                //$("#dobInput").val(d.date_of_birth)
                $("#quaInput").val(d.qualification)
                $("#roleInput").val(d.role)
                $("#joinInput").html(datify(d.created))
                $("#resetInput").html(datify(d.password_last_reset))
                $("#salaryInput").val(`₦${digify(d.salary)}`)
                $("#addressInput").val(`${d.address.address}, ${d.address.lga}, ${d.address.state} State, ${d.address.country}.`)
                $("#twoFactorToggle").prop('checked', d._2fa_enabled)
                $(".twoFAText").html(d._2fa_enabled ? 'Enabled' : 'Disabled')
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

$(".save-profile-btn").on('click', updateProfile)

async function updateProfile() {
    let phone_number = $('#telInput').val().trim();
    if (phone_number === "") {
        showToast("Phone number is required", "warning");
        return
    }

    let formData = {phone_number}

    showLoader("Updating profile...")

    staff.account.updateProfile({
        formData,
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success")
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

$(".change-pass-btn").on('click', openChangePasswordModal)

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
                        <button class="update-pass-btn flex-1 py-4 bg-[#1e3a8a] text-white rounded-2xl font-medium">Update Password</button>
                    </div>
                </div>
    `);

    $(".update-pass-btn").on('click', changePassword)
}


$(".logout-button").on('click', logout)
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


function changePassword() {
    let old_password = $("#currentPass").val().trim();
    let new_password = $("#newPass").val().trim();
    let confirm_pass = $("#confirmPass").val().trim();

    if(old_password === "" || new_password === "" || confirm_pass === "") {
        showToast("All fields are required", "warning");
        return
    }

    if(new_password !== confirm_pass) {
        showToast("Passwords do not match!", "warning");
        return
    }

    let formData = {new_password, old_password}
    
    showLoader("Updating password...")

    staff.account.changePassword({
        formData,
        onSuccess: async (data) => {
            checkResponse(data)
            //console.log(data)
            if(data.status == "success") {
                showToast(data.message, "success");
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

$("#twoFactorToggle").on('change', (e) => {
    e.preventDefault()
    const isEnabled = $(this).is(':checked');
    $(this).prop('checked', isEnabled)
    console.log(isEnabled)
})

var uploadBtn = document.querySelector("#image-upload");
uploadBtn.addEventListener("change", function() {
  var reader = new FileReader();
  var file = this.files[0];

  reader.onload = function(e) {
    document.querySelector("#profileAvatar").src = e.target.result;
  }

  reader.readAsDataURL(file)
  uploadImage()
})

function uploadImage() {
  let image = $("#image-upload")[0].files[0];

  let formData = new FormData();
  formData.append("image", image)


  showLoader("Uploading image...")

  staff.account.uploadPassport({
    formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
          showToast(data.message, "success")
          sessionStorage.removeItem("educa_user_info")
        }
        else {
          showToast(data.message, "error")
        }
        hideLoader()
        $("#image-upload").val('')
        showUserInfo()
    },
    onError: (error) => {
      //hideLoader()
      console.error(error)
      $("#image-upload").val('')
      showUserInfo()
      showToast("Error occurred. Kindly check your internet connection and try again", "success")
    }
})
}


        

        

        

        

        
        
        
        
$(document).ready(async function() {
    showLoader("Loading Data...")
    initTailwind();
    loadTheme()
    await showUserInfo()
    await loadProfile()
});
