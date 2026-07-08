//const base_image_url = `https://kosmoshr.pythonanywhere.com`;

let staff;

if(window.location.protocol == "http:") {
  staff = new educaSDK.Staff("f6e6dc8f-3b7c-4242-aafd-351817fd3296");
}
else {
  staff = new educaSDK.Staff();
}
//const staff = 
//const XLSX = educaSDK.XLSX;
const base_url = educaSDK.BASE_URL;

function initTailwind() {
            tailwind.config = { darkMode: 'class' };
        }

/* Navigation bar */
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
//localStorage.removeItem('api_key')


// ==================== IMPROVED MODAL FUNCTIONS ====================

function showModal(html, size = 'max-w-lg') {
    const modal = $('#customModal');
    const content = $('#modalContent');
    
    // Set dynamic max-width
    content.removeClass('max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-3xl max-w-4xl max-w-5xl max-w-6xl')
           .addClass(size);
    
    // Inject content
    content.html(html);
    
    // Show modal with smooth animation
    modal.removeClass('hidden').addClass('flex');
    
    // Prevent background scroll
    $('body').addClass('overflow-hidden');
}

// Examples:
// Small modal
//showModal(`<div class="p-8">...</div>`, 'max-w-md');
// Default size
//showModal(`<div class="p-8">...</div>`);
// Large modal (for complex forms)
//showModal(`<div class="p-8">...</div>`, 'max-w-2xl');
// Very large modal
//showModal(`<div class="p-8">...</div>`, 'max-w-4xl');

function closeModal() {
    const modal = $('#customModal');
    
    modal.removeClass('flex').addClass('hidden');
    
    // Restore scrolling
    $('body').removeClass('overflow-hidden');
    
    // Optional: Clear content after closing (prevents flash of old content)
    setTimeout(() => {
        $('#modalContent').html('');
    }, 300);
}

// Close modal when clicking backdrop (outside the modal content)


function showDP() {
  if(localStorage.dp) {
    //console.log(localStorage.dp)
    $('.admin-img').attr('src', `${base_image_url}${localStorage.dp}`)
  }
}
//showDP();

function digify(n, decimal=false) {
  let a = Number(n)
  if(decimal) {
    return a.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  }
  else{
    return a.toLocaleString()
  }
  
}

function truncateWord(str, n) {
  trunc_str = str.substring(0, n);
  if(str.length > n) {
    trunc_str += "...";
  }
  return trunc_str
}

function shortify(n, decimal=false) {
  let a = Number(n);
  if(a >= 1000000) {
    return `${(a/1000000).toFixed(3)}M`
  }
  else if(a >= 1000) {
    return `${(a/1000).toFixed(2)}K`
  }
  else {
    return digify(n, decimal)
  }
}


function datify(date=null, time=false) {
  if(!date) {date = new Date()}
  let is_date = date instanceof Date

  let date_obj = is_date ? date : new Date(date)
  if(time) {
    return `${date_obj.toDateString()} ${date_obj.toLocaleTimeString()}`
  }
  else {
    return `${date_obj.toDateString()}`;
  }
}

function timify(time) {
  if(time) {
    let [hours, mins] = time.split(':')
    hours = Number(hours);
    let position = (hours >= 12) ? 'PM' : 'AM';
    hours = (hours > 12) ? hours - 12 : hours;
    hours = hours.toString().padStart(2, '0')
    mins = mins.padStart(2, '0')
    return `${hours}:${mins}${position}`
  }
  else {
    return "N/A"
  }
}

function monthify(date) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ]
  
  let dt = new Date(date);
  return `${months[dt.getMonth()]} ${dt.getFullYear()}`
}

function dateDiff(date) {
  let givenDate = new Date(date);
  let today = new Date();

  let diff_years = today.getFullYear() - givenDate.getFullYear();

  if(
    today.getMonth() < givenDate.getMonth() ||
    (today.getMonth() === givenDate.getMonth() && today.getDate() < givenDate.getDate())
  ) {
    diff_years--;
  }
  return diff_years;
}

function downloadFile(url, filename="") {
  let link = document.createElement('a');
  link.href = url;
  link.target = "_blank";
  link.dowload = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("File downloaded successfully", "success");
}

function deslugify(str) {
  var splitted_str = str.split('_');
  var joined_str = splitted_str.join(' ')
  return joined_str
}

function capitalize(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
  // return str
  // .toLowerCase()
  // .split(" ")
  // .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  // .join(" ");
}

function getQueryParams() {
  let params = new URLSearchParams(window.location.search);
  let query = Object.fromEntries(params.entries());
  return query
}

function buildQueryParams(obj, link=null, hash=null) {
  if(hash == null) hash = window.location.hash;
  if(link == null) {link = window.location.host}
  else {link = window.location.host + link};
  let params = new URLSearchParams(obj);
  let url = `${window.location.protocol}//${link}/?${params.toString()}${hash}`;
  return url
}


function showLoader(text="Loading...") {
  $(".loader-text").html(text)
    $('#fullLoader').removeClass('hidden').addClass('flex');
}

function hideLoader() {
    $('#fullLoader').addClass('hidden').removeClass('flex');
}

function showToast(message, type = 'success') {
            const colors = { success: 'bg-emerald-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
            const toast = $(`
                <div class="toast ${colors[type]} text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 max-w-xs">
                    <span class="fa fa-${type === 'success' ? 'check-circle text-green' : type === 'error' ? 'times-circle text-red' : type === 'warning' ? 'warning text-orange' : 'info-circle text-blue'}"></span>
                    <p class="text-sm font-medium">${message}</p>
                </div>
            `);
            $('#toastContainer').append(toast);
            setTimeout(() => toast.fadeOut(300, () => toast.remove()), 4000);
}

function toggleSidebar() {
    $('#sidebar').toggleClass('-translate-x-full');
    $('#customSidebar').toggleClass('hidden');
}

function toggleDarkMode() {
            $('html').toggleClass('dark');
            const isDark = $('html').hasClass('dark');
            $('#themeToggle').html(`<i class="fa fa-${isDark ? 'sun-o text-yellow' : 'moon-o text-gray'}"></i>`);
            localStorage.setItem('darkMode', isDark);
}

function loadTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
                $('html').addClass('dark');
                $('#themeToggle').html(`<i class="fa fa-sun-o text-yellow"></i>`);
            }
}

function checkStatus() {
  if(!navigator.onLine && location.hostname != '127.0.0.1') {
    showToast("You are currently offline!", "warning")
  }
  
  staff.account.loginStatus({
    onSuccess: (data) => {
      if(data.status == 'success') {
        if(data.authenticated == false && location.pathname == "/dashboard/") {
            sessionStorage.removeItem("educa_user_info");
           location.href = '/login/'
        }
        else if(data.authenticated == true && location.pathname == "/login/") {
          location.href = '/dashboard/'
        }
      }
    },
    onError: (error) => {
      showToast(error, "error")
    }
  })
    
}
//checkStatus()


function escapeHtml(text) {
  var escapedText = text.replace("'", "\'");
  return escapedText.replace(/\n/g, '&lt;br&gt;')
}

function checkResponse(data) {
  if(data.statusCode && data.statusText) {
    if(data.statusCode == 401) {
        showToast("Session expired!", "error");
        sessionStorage.removeItem("educa_user_info")
        let stat = localStorage.getItem("user_stat")
        location.href = `/${stat}/login/`
    }
    else {
        showToast(`Error ${data.statusCode}: ${data.statusText}`, "error")
    }
  }
  
}

//document.addEventListener('online', checkStatus)
//document.addEventListener('offline', checkStatus)

function log(data) {
    //alert(data)
    if(typeof(data) == "object") {
        alert(JSON.stringify(data))
    }
    else {alert(data)}
    
}

async function showSchoolInfo() {
  let info = sessionStorage.getItem("educa_school_info");
  if(info) {
      try{
          info = JSON.parse(info);
          //log(info)
          $("title").text(`${info.name} - ${info.motto}`)
          $("meta[name='title']").attr('content', `${info.name} - ${info.motto}`)
          $(".site-title").html(info.name)
          $(".site-motto").html(info.motto)
          $(".site-location").html(`${info.address.state}, ${info.address.country}`)
          if(info.logo) {
            $(".site-logo").attr('src', info.logo)
            $("link[rel='shortcut']").attr('href', info.logo)
            $("link[rel='shortcut icon']").attr('href', info.logo)
          }
      }
      catch(err) {
          //log(err)
      }
  }
  else {
      showLoader()
      staff.school.schoolInfo({
          onSuccess: (data) => {
              let d = data.data;
              if(d.logo !== null) {
                  d['logo'] = base_url + d.logo
              }
              let obj = {name: d.name, logo: d.logo, motto: d.motto, address: d.address}
              sessionStorage.setItem('educa_school_info', JSON.stringify(obj));
              showSchoolInfo()
              hideLoader()
          },
          onError: (error) => {
              console.error(error)
              hideLoader()
          }
        })
  }
}

async function showUserInfo() {
  let info = sessionStorage.getItem("educa_user_info");
  if(info) {
      info = JSON.parse(info);
      //log(info)
      $(".admin-user").html(info.full_name)
      $(".admin-role").html(info.role)
      $(".admin-id").html(info.staff_id)
      $(".admin-email").html(info.email)
      if(info.image) {
          $(".admin-img").attr('src', info.image)
      }
  }
  else {
      showLoader()
    staff.account.getProfile({
          onSuccess: (data) => {
              checkResponse(data)
              let d = data.data;
              //log(d);
              let obj = {full_name: `${d.firstName} ${d.lastName}`, email: d.email, staff_id: d.staffId, gender: d.gender, role: d.role};
              if(d.image) {
                  obj['image'] = base_url + d.image
              }
              else {
                  obj['image'] = null
              }
              sessionStorage.setItem('educa_user_info', JSON.stringify(obj));
              showUserInfo()
              hideLoader()
          },
          onError: (error) => {
              checkResponse(error)
              showToast(error)
              hideLoader()
          }
        })
  }
}



function getRandomColor() {
  let r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  let g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  let b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function generateColors(count=5) {
  return Array.from({length: count}, getRandomColor);
}

function renderMarkdown(markdownText) {
  const rawHtml = marked.parse(markdownText);
  //return DOMPurify.sanitize(rawHtml);
  return rawHtml
}

function initiateTiny(mini=false, elem='.html-text', content="") {
  let plugins = ''; let toolbar = '';
  if(mini) {
    plugins = 'autolink charmap link lists searchreplace table wordcount';
    toolbar = 'undo redo | blocks | bold italic underline strikethrough | link | align lineheight | numlist bullist indent outdent | charmap';
  }
  else {
    plugins = 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount';
    toolbar = 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | tinycomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat';
  }
  
  tinymce.init({
      selector: elem,
      setup: function(editor) {
          editor.on('init', function(e) {
            editor.setContent(content)
          })
      },
      plugins: plugins,
      toolbar: toolbar,
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Admin',
      mergetags_list: [
          {value: 'First.Name', title: 'First Name'},
          {value: 'Email', title: 'Email'},
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
  });
}
//initiateTiny();


