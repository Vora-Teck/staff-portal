// src/api/request.js

let base_url = "", site_id = ""

if(window.location.protocol == "http:") {
  base_url = `http://127.0.0.1:8000`;
  site_id = "f6e6dc8f-3b7c-4242-aafd-351817fd3296"
}
else {
  base_url = `https://api.eduka.ng`;
  site_id = null
}

export const BASE_URL = base_url;
const SITE_ID = site_id;



const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  for (const key in params) {
    if (Array.isArray(params[key])) {
      params[key].forEach((val) => query.append(key, val));
    } else {
      query.append(key, params[key]);
    }
  }

  return query.toString() ? `?${query.toString()}` : '';
};



const request = async ({ method = 'GET', url, data = null, params = {}}) => {
  const queryString = buildQueryString(params);
  const fullUrl = `${BASE_URL}${url}${queryString}`;

  const headers = {
    'Accept': 'application/json', 
    'x-SITE-ID': SITE_ID,
    'Content-Type': 'application/json'
  };


  const options = {
    method: method.toUpperCase(),
    credentials: "include",
    headers
  };

  if (method !== 'GET' && method !== 'HEAD' && data) {
    options.body = JSON.stringify(data);
  }
  try {
    let response = await fetch(fullUrl, options);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      responseData['statusText'] = response.statusText;
      responseData['statusCode'] = response.status;
      return responseData;
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export async function schoolInfo() {
    return request({url: "/v3/school/get_school/"})
}

export async function loginStatus() {
    return request({url: "/v3/profile/auth_status/"})
}

export async function login(payload = {}) {
    return request({method: "POST", url: "/v3/auth/cbt-login/", data: payload})
}

export async function logout() {
    return request({method: "POST", url: "/v3/exams/user_logout/"})
}

export async function profile() {
    return request({url: "/v3/exams/get_profile/"})
}

export async function getExams() {
    return request({url: "/v3/exams/get_active_exams/"})
}

export async function getExamQuestions(exam_id) {
    return request({url: "/v3/exams/get_exam_questions/", params: {exam_id}})
}

export async function submit(payload = {}) {
    return request({method: "POST", url: "/v3/exams/submit_exam/", data: payload})
}

