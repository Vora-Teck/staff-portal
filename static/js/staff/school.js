
async function getSchoolInfo() {
    admin.school.schoolInfo({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#s-name").val(d.name);
                $("#s-motto").val(d.motto);
                $("#s-year").val(d.year_established);
                $("#s-email").val(d.email);
                $("#s-phone").val(d.phone_number);
                $("#s-address").val(d.address.address);
                $("#s-lga").val(`${d.address.lga} LGA`);
                $("#s-state").val(`${d.address.state} State`);
                $("#s-country").val(d.address.country);
                $("#s-plan").val(`${d.plan.title} Plan`);
                $("#s-duration").val(d.duration);
                $("#s-expiry").val(datify(d.expiry_date));
                $("#s-logo").attr('src', d.logo ? `${base_url}${d.logo}` : `/static/image/logo.png`)
                //console.log(d.about)
                initiateTiny(false, '.html-text', d.about)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function schoolConfig() {
    admin.school.config({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                
                $("#config-renew").val(d.auto_renewal.toString());
                $("#config-payroll").val(d.auto_payroll.toString());
                $("#config-date").val(d.payroll_date);
                $("#config-term").val(d.term_per_session);
                $("#config-week").val(d.weeks_per_term);
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function schoolAccount() {
    admin.wallet.balance({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $(".bal-item").html(`&#8358;${shortify(d.walletBalance, true)}`)
                $(".rev-item").html(`&#8358;${shortify(d.total_revenue, true)}`)
                $(".exp-item").html(`&#8358;${shortify(d.total_expenses, true)}`)
                
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })

}

async function walletLog() {
    showLoader("Fetching logs...")
    admin.wallet.log({
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    let logs = d.log.reverse();
                    let revs = d.revenue;
                    let exps = d.expense;

                    $(".log-table").empty();
                    $(".rev-table").empty();
                    $(".exptable").empty();
                    for(let i in logs) {
                        let log_types = {
                            incoming: "success-btn", outgoing: "danger-btn"
                        }
                        let temp = `
                        <tr>
                        <td>${logs[i].description}</td>
                        <td><span class="${log_types[logs[i].type]}">${logs[i].type}</span></td>
                        <td>&#8358;${digify(logs[i].initial_balance)}</td>
                        <td>&#8358;${digify(logs[i].amount)}</td>
                        <td>&#8358;${digify(logs[i].final_balance)}</td>
                        <td style="white-space:nowrap">${datify(logs[i].date, true)}</td>
                        </tr>`;
                        $(".log-table").append(temp)
                    }

                    for(let j in revs) {
                        let temp = `
                        <tr>
                        <td>${revs[j].transaction.reference}</td>
                        <td>&#8358;${digify(revs[j].amount)}</td>
                        <td style="white-space:nowrap">${datify(revs[j].date, true)}</td>
                        </tr>`;
                        $(".rev-table").append(temp)
                    }

                    for(let k in exps) {
                        let temp = `
                        <tr>
                        <td>${exps[k].transaction.reference}</td>
                        <td>&#8358;${digify(exps[k].amount)}</td>
                        <td style="white-space:nowrap">${datify(exps[k].date, true)}</td>
                        </tr>`;
                        $(".exp-table").append(temp)
                    }

                    $(".log-con").addClass("active")
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

async function schoolDocument() {
    admin.school.schoolDocument({
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    let veri_temp = ``

                    if(d.is_verified || d.verification_status == "verified") {
                        veri_temp = `
                        <div class="alert alert-success">
                        <i class="fa fa-check-circle"></i>&nbsp;&nbsp;
                        Your school KYC information has been verified
                        </div>`;
                        $(".school-verify-form input").attr('disabled', true)
                        $(".school-verify-form select").attr('disabled', true)
                    }
                    else if(d.verification_status == 'pending') {
                        veri_temp = `
                        <div class="alert alert-info">
                        <i class="fa fa-info-circle"></i>&nbsp;&nbsp;
                        Your school KYC verification is <b>pending</b> and is currently <b>under review</b>
                        </div>`
                    }
                    else {
                        veri_temp = `
                        <div class="alert alert-warning">
                        <i class="fa fa-warning"></i>&nbsp;&nbsp;Kindly provide the following information below to complete your school KYC
                        </div>`
                    }
                    $(".veri-alert").html(veri_temp)

                    $("#veri-type").val(d.registration_type);
                    $("#veri-num").val(d.registration_number);

                    if(d.registration_document) {
                        let items = d.registration_document.split('/');
                        let filename = items[items.length - 1];
                        let file_split = filename.split('.')
                        $(".veri-ex-doc").html(`
                                <div class="alert alert-success">
                                <i class="fa fa-file-o"></i>&nbsp;&nbsp;
                                ${truncateWord(file_split[0], 15)}${file_split[1]}
                                </div>  
                        `)
                    }
                    if(d.school_image_1) {
                        $(".veri-img1").html(`
                            <img src="${base_url}${d.school_image_1}" alt="" />
                        `)
                    }
                    if(d.school_image_2) {
                        $(".veri-img2").html(`
                            <img src="${base_url}${d.school_image_2}" alt="" />
                        `)
                    }
                    if(d.school_image_3) {
                        $(".veri-img3").html(`
                            <img src="${base_url}${d.school_image_3}" alt="" />
                        `)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 5000)
                }
                
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function getDomain() {
    admin.school.domain({
            onSuccess: (data) => {
                //console.log(data)
                let domain_temp = ``
                if(data.data) {
                    let d = data.data;
                    $(".new-port").hide();
                    $(".old-port").show();
                    if(d.status == "approved") {
                        domain_temp = `
                        <div class="alert alert-success">
                        <i class="fa fa-check-circle"></i>&nbsp;&nbsp;
                        Your school portal request has been approved and your website is now live!
                        </div>`
                    }
                    else if(d.status == "pending") {
                        domain_temp = `
                        <div class="alert alert-warning">
                        <i class="fa fa-clock-o"></i>&nbsp;&nbsp;
                        Your school portal request is pending is currently under review. Kindly note that request can take up to 48 hours for approval.
                        </div>`
                    }
                    $("#dom-name").html(d.domain)
                    $("#dom-date").html(datify(d.date, true))
                    $("#dom-stat").html(d.status.toUpperCase());
                    $("#dom-app").html(d.approved_date ? datify(d.approved_date, true) : 'Not Approved Yet');
                    $("#dom-url").html(d.url ? `<a href="${d.url}" class="w-text-red" target="_blank"><i class="fa fa-chain"></i> ${d.url}</a>` : 'Not Approved Yet')
                }
                else {
                    $(".new-port").show();
                    $(".old-port").hide();
                    domain_temp = `
                    <div class="alert alert-warning">
                    <i class="fa fa-warning"></i>&nbsp;&nbsp;
                    ${data.message}
                    </div>`
                }
                $(".domain-alert").html(domain_temp)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function getGallery() {
    let loader_process = `<div class="loader mb-3" style="margin:auto;"></div>`;
    $(".gallery-con").empty().html(loader_process)
    admin.school.gallery({
            onSuccess: (data) => {
                $(".gallery-con").empty()
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    if(d.length > 0) {
                        for(let i in d) {
                            var temp = `
                            <div class="gallery-item w-card">
                            <button class="danger-btn delete-gallery-btn">x</button>
                                <img src="${base_url}${d[i].image}" alt="">
                                <div>
                                    <h4>${d[i].title}</h4>
                                    <p class="w-text-gray" style="padding-bottom:30px;">${d[i].description}</p>
                                </div>
                                <button class="light-btn edit-gallery-btn">Update&nbsp;&nbsp;<i class="fa fa-edit"></i></button>
                            </div>`;
                            $(".gallery-con").append(temp)
                        }
                    }
                    else {
                        $(".gallery-con").empty().html(`<p class="w-text-gray">No gallery created yet.</p>`)
                    }
                }
                else {
                    $(".gallery-con").empty().html(`<p class="w-text-gray">${data.message}</p>`)
                    pushNotification("n_error", data.message, 3000)
                }
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function getCard() {
    admin.card.get({
            onSuccess: (data) => {
                //console.log(data)
                let domain_temp = ``
                if(data.data) {
                    let d = data.data;
                    $(".new-card").hide();
                    $(".old-card").show();

                    let logo_det = {
                        visa: "/static/logos/visa.png",
                        verve: "/static/logos/verve.png",
                        mastercard: "/static/logos/master.png"
                    }
                    
                    $(".card-number").html(d.cardNumber)
                    $(".card-expiry").html(d.expiryDate)
                    if(d.expired) {$(".card-exp").html(`<i>(Expired)</i>`)}
                    $(".card-name").html(`${d.firstName || 'No'} ${d.lastName || 'Name'}`);
                    $(".card-logo img").attr('src', logo_det[d.brand])
                }
                else {
                    $(".new-card").show();
                    $(".old-card").hide();
                    domain_temp = `
                    <div class="alert alert-info">
                    <i class="fa fa-info-circle"></i>&nbsp;&nbsp;
                    ${data.message}
                    </div>`
                }
                $(".card-alert").html(domain_temp)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function getBanks() {
    showLoader("Processing...")
    admin.bank.list({
            onSuccess: (data) => {
                //console.log(data)
                $("#bank-name").empty()
                for(let i in data) {
                    let temp = `
                    <option value="${data[i].bankCode}">${data[i].bankName}</option>`;
                    $("#bank-name").append(temp)
                }
                $("#bank-name").prepend(`<option value="" selected>-- Select Bank --</option>`)
                hideLoader()
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

async function getAccount() {
    admin.bank.get({
            onSuccess: (data) => {
                //console.log(data)
                let domain_temp = ``
                if(data.data) {
                    let d = data.data;
                    $(".new-bank").hide();
                    $(".old-bank").show();

                    let tagged = {
                        pending: "warning-btn",
                        verified: "success-btn",
                        rejected: "danger-btn"
                    }

                    $(".bank-logo").attr('src', `${base_url}${d.bank.logo}`)
                    $(".bank-name").html(d.bank.bankName)
                    $(".bank-status").html(`<span class="${tagged[d.verification_status]}">${d.verification_status}</span>`)
                    $(".bank-user").html(`${d.account_name} - ${d.account_number}`)
                }
                else {
                    $(".new-bank").show();
                    $(".old-bank").hide();
                    domain_temp = `
                    <div class="alert alert-info">
                    <i class="fa fa-info-circle"></i>&nbsp;&nbsp;
                    ${data.message}
                    </div>`
                }
                $(".bank-alert").html(domain_temp)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                //hideLoader()
            }
    })
}

async function setup() {
    showLoader("Loading data...")
    try {
        await getSchoolInfo()
        await schoolAccount()
        await schoolDocument()
        await getDomain()
        //await getGallery()
        await getCard()
        await getAccount()
    }
    catch(err) {
        console.log(err)
    }
    finally {
        hideLoader()
    }
}

setup()

function calculate_charges() {
    let amount = $("#fund-amount").val();
    amount = Number(amount);
    $("#fund-submit-btn").attr('disabled', amount >= 100 ? false : true)
    let charges = (amount * 15) /  1000
    let total  = Number(amount + charges);
    total =  total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
    $("#tot_amount").html(total)
}

function verifyTransaction(reference) {
    showLoader("Verifying transaction...")
    admin.wallet.verifyPayment({
        params: {reference},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == 'success') {
                pushNotification("n_success", `Transaction ${data.transaction_status}`, -1)
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            schoolAccount()
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function makePayment(formData) {
    hideLoader()
    admin.wallet.makePayment({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            $(".fund-form")[0].reset();
            $(".fund-con").removeClass("active")
            verifyTransaction(formData.reference)
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            //hideLoader()
        }
    })
}

async function fundWallet() {
    let amount = $("#fund-amount").val();

    let formData = {amount}
    showLoader("Initiating transaction...")
    admin.wallet.fund({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            let d = data.data
            makePayment(d)
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            //hideLoader()
        }
    })
}

var current_stage = 0

function initiateWithdrawalForm(step=0, data=null) {
    if(step == 0) {
        var temp = `
        <div class="input-con">
          <label for="st-fname">Enter amount to withdraw:</label>
          <input type="number" id="withdraw-amount" placeholder="Min: &#8358;100" required />
        </div>`;
        $(".withdraw-form-content").empty().html(temp)
    }
    else if(step == 1) {
        if(data == null) {
            pushNotification("n_error", "Invalid transaction", 5000);
            return
        } 
        var temp = `
        <table class="table with-table">
          <tbody>
            <tr>
                <td>Amount</td>
                <td>&#8358;${digify(data.amount)}</td>
            </tr>
            <tr>
                <td>Transaction fee</td>
                <td>&#8358;${digify(data.details.transaction_fee)}</td>
            </tr>
            <tr>
                <td>Total Amount</td>
                <td>&#8358;${digify(data.details.total_amount)}</td>
            </tr>
            <tr>
                <td>Recipient Details</td>
                <td>${data.details.destination_account_name} - ${data.details.destination_account_number} (${data.details.destination_bank_name})</td>
            </tr>
            <tr>
                <td>Date</td>
                <td>${datify(data.date, true)}</td>
            </tr>
          </tbody>
        </table>
        <input type="hidden" id="withdraw-ref" value="${data.reference}" />
        `;
        $(".withdraw-form-content").empty().html(temp)
    }
    else if(step == 2) {
        if(data == null) {
            pushNotification("n_error", "Invalid transaction", 5000);
            return
        } 
        var temp = `
        <input type="hidden" id="withdraw-ref" value="${data.reference}" />
        <div class="input-con">
          <label for="st-fname">Enter your password to proceed:</label>
          <input type="password" id="withdraw-password" required />
        </div>`;
        $(".withdraw-form-content").empty().html(temp)
    }
    
}

$(".withdraw-form").submit(function(e) {
    e.preventDefault();
    let loader_process = `<div class="loader mb-3" style="margin:auto;"></div>`;
    
    if(current_stage == 0) {
        var amt = $("#withdraw-amount").val();
        if(amt < 100) {
            pushNotification("n_warning", "Withdrawal ampunt cannot be less than &#8358;100", 3000);
            return;
        }
        $(".withdraw-form-content").empty().html(loader_process)
        $("#withdraw-submit-btn").attr('disabled', true)
        admin.wallet.initiateWithdrawal({
            formData: {amount: amt},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let d = data.data;
                    current_stage += 1;
                    initiateWithdrawalForm(current_stage, d)
                }
                else {
                    pushNotification("n_error", data.message, 5000)
                    initiateWithdrawalForm()
                }
                $("#withdraw-submit-btn").attr('disabled', false)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                initiateWithdrawalForm()
                $("#withdraw-submit-btn").attr('disabled', false)
            }
        })

    }
    else if(current_stage == 1) {
        var reference = $("#withdraw-ref").val();
        if(!reference) {
            pushNotification("n_warning", "Invalid transaction", 3000);
            initiateWithdrawalForm();
            return
        }
        $(".withdraw-form-content").empty().html(loader_process)
        $("#withdraw-submit-btn").attr('disabled', true)
        let d = {reference};
        current_stage += 1;
        initiateWithdrawalForm(current_stage, d)
        $("#withdraw-submit-btn").attr('disabled', false)

    }
    else if(current_stage == 2) {
        var reference = $("#withdraw-ref").val();
        var password = $("#withdraw-password").val();
        if(!reference) {
            pushNotification("n_warning", "Invalid transaction", 3000);
            initiateWithdrawalForm();
            return
        }
        if(!password) {
            pushNotification("n_warning", "Invalid password", 3000);
            return;
        }
        $(".withdraw-form-content").empty().html(loader_process)
        $("#withdraw-submit-btn").attr('disabled', true)
        admin.wallet.makeWithdrawal({
            formData: {reference, password},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    pushNotification("n_success", data.message, 5000)
                    $(".canc-btn1").click()
                    schoolAccount()
                }
                else {
                    pushNotification("n_error", data.message, 5000)
                    initiateWithdrawalForm(2, {reference})
                }
                $("#withdraw-submit-btn").attr('disabled', false)
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                initiateWithdrawalForm(2, {reference})
                $("#withdraw-submit-btn").attr('disabled', false)
            }
        })

    }
})

$(".canc-btn1").on('click', function(e) {
    e.preventDefault();
    current_stage = 0
    $("#withdraw-submit-btn").attr('disabled', false)
    $(".withdraw-con").removeClass('active')
})


function updateSchoolInfo(stat) {
    let formData = {};

    if(stat == "info") {
        let phone = $("#s-phone").val();
        let motto = $("#s-motto").val();
        formData = {phone, motto};
    }
    else if(stat == 'web') {
        let about = tinymce.get('web-about').getContent({format: 'html'});
        formData = {about}
    }
    


    showLoader("Updating info...")

    admin.school.updateInfo({
        formData: formData,
        onSuccess: (data) => {
            if(data.status == 'success') {
                pushNotification("n_success", data.message, 5000)
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            hideLoader()
            getSchoolInfo()
            if(stat == "info") {
                let info = JSON.parse(localStorage.getItem("educa_school_info"))
                info['motto'] = formData['motto']
                localStorage.setItem('educa_school_info', JSON.stringify(info));
                showSchoolInfo()
            }
            
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })

}

$(".portal-form").submit(function(e) {
    e.preventDefault();

    let domain = $("#domain-name").val();

    let formData = {domain};

    showLoader("Requesting portal...")

    admin.school.requestDomain({
        formData: formData,
        onSuccess: (data) => {
            if(data.status == 'success') {
                pushNotification("n_success", data.message, 5000);
                getDomain()
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

})

var uploadBtn = document.querySelector("#logo-upload");
uploadBtn.addEventListener("change", function() {
  var reader = new FileReader();
  var file = this.files[0];

  reader.onload = function(e) {
    document.querySelector("#s-logo").src = e.target.result;
  }

  reader.readAsDataURL(file)
  uploadLogo()
})

function uploadLogo() {
  let image = $("#logo-upload")[0].files[0];

  let formData = new FormData();
  formData.append("logo", image)


  showLoader("Uploading image...")

  admin.school.uploadLogo({
    formData: formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
          pushNotification("n_success", data.message, 3000)
        }
        else {
          pushNotification("n_error", data.message, -1)
        }
        hideLoader()
        getSchoolInfo()
        localStorage.removeItem("educa_school_info");
        showSchoolInfo()
    },
    onError: (error) => {
      hideLoader()
      console.error(error)
      pushNotification("n_network", "Error occurred. Kindly check your internet connection and try again", 3000)
    }
})
}


$(".school-verify-form").submit(function(e) {
    e.preventDefault();

    let business_type = $("#veri-type").val();
    let registration_number = $("#veri-num").val();
    let registration_document = $("#veri-doc")[0].files[0];
    let school_image_1 = $("#veri-img1")[0].files[0];
    let school_image_2 = $("#veri-img2")[0].files[0];
    let school_image_3 = $("#veri-img3")[0].files[0];


    let formData = new FormData();

    formData.append('business_type', business_type);
    formData.append('registration_number', registration_number);
    formData.append('registration_document', registration_document);
    formData.append('school_image_1', school_image_1);
    formData.append('school_image_2', school_image_2);
    formData.append('school_image_3', school_image_3);

    showLoader("Submitting KYC...")

    admin.school.verify({
        formData: formData,
        onSuccess: (data) => {
            if(data.status == 'success') {
                pushNotification("n_success", data.message, 5000)
                schoolDocument()
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

})

// =================== Bank Card/Account =========================
function verifyCharge(reference) {
    showLoader("Verifying transaction...")
    admin.card.verifyPayment({
        params: {reference},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == 'success') {
                pushNotification("n_success", `Transaction ${data.transaction_status}`, -1)
                pushNotification("n_success", `${data.message}`, -1)
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            getCard()
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function chargeCard(formData) {
    hideLoader()
    admin.card.makePayment({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            verifyCharge(formData.reference)
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            //hideLoader()
        }
    })
}

function addCard() {
    showLoader("Initiating transaction...")
    admin.card.add({
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    let d = data.data;
                    hideLoader()
                    chargeCard(d)
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

function deleteCard() {
    let password = $("#card-delete-password").val()
    showLoader("Deleting card...")
    admin.card.delete({
        formData: {password},
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    $(".delete-card-form")[0].reset();
                    $(".delete-card-con").removeClass("active")
                    pushNotification("n_success", data.message, 3000)
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                }
                hideLoader()
                getCard()
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

function verifyAccount() {
    let account_number = $('#account-number').val()
    let bank_code = $('#bank-name').val()

    if(account_number.length !== 10 || bank_code === '') {
        $('#verify-name').html(``)
        $('#verified').val('')
        $(".add-bank-submit").attr('disabled', true)
        return
    }
    $('#verify-name').html(`<div class="transfer-loader"></div>`)

    admin.bank.verifyAccount({
        params: {account_number, bank_code},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == 'success') {
                $('#verify-name').html(`
                    <div class="alert alert-success">
                    <i class="fa fa-check-circle"></i>&nbsp;&nbsp;
                    ${data.data.account_name}
                    </div>
                    `)
                $('#verified').val('true')
                $(".add-bank-submit").attr('disabled', false)
            }
            else {
                $('#verify-name').html(`
                    <div class="alert alert-warning">
                    <i class="fa fa-warning"></i>&nbsp;&nbsp;
                    ${data.message}
                    </div>
                    `)
                $('#verified').val('')
                $(".add-bank-submit").attr('disabled', true)
            }
        },
        onError: (error) => {
            console.error(error);
            pushNotification("Error", "Kindly check your internet connection", "error")
            $('#verified').val('')
            $(".add-bank-submit").attr('disabled', true)
            $('#verify-name').html(`
                <div class="alert alert-danger">
                    <i class="fa fa-info-circle"></i>&nbsp;&nbsp;
                    Internet connection error
                    </div>
                `)
        }
    })
}

function addAccount() {
    let account_number = $('#account-number').val()
    let bank_code = $('#bank-name').val()
    let verified = $('#verified').val()

    if(verified !== "true") {
        pushNotification("n_warning", "Bank account not resolved", 5000);
        return;
    }

    let formData = {account_number, bank_code}

    showLoader("Adding bank account...")
    admin.bank.add({
        formData: formData,
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == 'success') {
                    $(".add-bank-form")[0].reset();
                    $(".add-bank-con").removeClass('active')
                    pushNotification("n_success", data.message, 5000)
                }
                else {
                    pushNotification("n_error", data.message, 5000)
                }
                hideLoader();
                getAccount();
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

function addGallery() {
    let title = $('#gall-title').val()
    let description = $('#gall-des').val()
    let image = $('#gall-img')[0].files[0];

    if(!title) {
        pushNotification("n_warning", "Kindly enter a title for the gallery", 5000);
        return;
    }

    if(!image) {
        pushNotification("n_warning", "Kindly select an image to continue", 5000);
        return;
    }

    let formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image)

    showLoader("Adding gallery...")
    admin.school.addGallery({
        formData: formData,
            onSuccess: (data) => {
                console.log(data)
                if(data.status == 'success') {
                    $(".add-gallery-form")[0].reset();
                    pushNotification("n_success", data.message, 5000)
                }
                else {
                    pushNotification("n_error", data.message, 5000)
                }
                hideLoader();
                getGallery();
            },
            onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}




// tinymce.get('blog-post').getContent({format: 'html'})
// tinymce.get('blog-post2').setContent(p.about)


// ========== Event Listeners ======================
$(".exp-btn").click(async () => {await walletLog()})
$(".inc-btn").click(async () => {await walletLog()})
$(".fund-btn").click(() => {$(".fund-con").addClass("active")})
$(".delete-card-btn").click(() => {$(".delete-card-con").addClass("active")})
$(".withdraw-btn").click(() => {$(".withdraw-con").addClass("active");initiateWithdrawalForm()})
$(".update-bank-btn").click(function() {getBanks();$(".add-bank-con").addClass('active')})
$(".add-gallery-btn").click(function() {$(".add-gallery-con").addClass('active')})


$("#fund-amount").on('input', function() {calculate_charges()})


$(".fund-form").on('submit', async (e) => {e.preventDefault();await fundWallet()})
$(".update-school-form").submit(function(e) {e.preventDefault();updateSchoolInfo("info")})
$(".website-form").submit(function(e) {e.preventDefault();updateSchoolInfo("web")})
$(".add-card-form").submit(function(e) {e.preventDefault();addCard()})
$(".delete-card-form").submit(function(e) {e.preventDefault();deleteCard()})
$("#add-bank-form").submit(function(e) {e.preventDefault(); getBanks();$(".add-bank-con").addClass('active')})
$(".add-bank-form").submit(function(e) {e.preventDefault();addAccount()})
$(".add-gallery-form").submit(function(e) {e.preventDefault();addGallery()})
