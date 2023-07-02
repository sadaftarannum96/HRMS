import axios from 'axios';
import {baseUserDetails} from '../api_urls';
// axios.defaults.headers.common["Authorization"] = authHeaders().Authorization;

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = process.env.REACT_APP_API_GATEWAY_URL;
// axiosInstance.defaults.headers.Authorization = (() => {
//   const token = window.AUTH_STR || localStorage.getItem('authToken');
//   if (token) {
//     return `Bearer ${token}`;
//   }
// })();

axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = window.AUTH_STR || localStorage.getItem('awl_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);

    if (!error.response) {
      // alert('We are facing Network issues.Please come back again');
      return Promise.reject(error);
    }
    if ([502].includes(error.response.status)) {
      return Promise.reject((error.response || {}).data || {});
    }

    if ([401].includes(error.response.status)) {
        //removed 403 as it will be thrown if permisstion not there. No need to refresh on that
        window.logout?.(false); //authContext.handleLogout //false - donot clear oauth server session
        setTimeout(() => {
          localStorage.setItem('logging_out_due_to_auth_error', error.toString());
          localStorage.setItem('return-url', window.location.pathname);
          window.location.href = '/';
        }, 3500);

      throw (error.response || {}).data || {};
    }
    if (
      error.response.status == 404 &&
      error.request.responseURL.includes('side/users/userDetails')
    ) {
      localStorage.setItem(
        'login-error',
        error.response.data?.message || 'User Not found',
      );
      return (window.location.href = '/');
    }
    if (error.response.status >= 400) {
      return Promise.reject((error.response || {}).data || {});
    }
    return error;
  },
);

export default axiosInstance;
