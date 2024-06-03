import axios from 'axios';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`; // no Bearer?
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;
