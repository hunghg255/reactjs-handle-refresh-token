import axios, { AxiosError, AxiosResponse } from 'axios';

export const axiosInstant = axios.create({
  baseURL: process.env.VITE_APP_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
const refreshSubscribers: any[] = [];
function subscribeTokenRefresh(cb: any) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: any) {
  refreshSubscribers.forEach((cb) => cb(token));
}

axiosInstant.interceptors.request.use(
  async (config: any) => {
    const accessToken = localStorage.getItem('accessToken');

    config.headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

const onRefreshToken = async () => {
  let refreshToken = localStorage.getItem('refreshToken');

  return axios.post(process.env.VITE_APP_API + '/auth/refresh-token', {
    refreshToken,
  });
};

const successHandler = async (response: AxiosResponse) => {
  return response;
};

const errorHandler = (error: AxiosError) => {
  const resError: AxiosResponse<any> | undefined = error.response;
  const originalRequest: any = error.config;

  if (resError?.status === 403) {
    if (!isRefreshing) {
      isRefreshing = true;
      onRefreshToken().then((data: any) => {
        isRefreshing = false;
        if (data?.data?.accessToken) {
          localStorage.setItem('accessToken', data?.data?.accessToken);
          localStorage.setItem('refreshToken', data?.data?.refreshToken);
          onRefreshed(data?.data?.accessToken);
        }
      });
    }
    return new Promise((resolve) => {
      subscribeTokenRefresh(async (token: string) => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        resolve(axiosInstant.request(originalRequest));
      });
    });
  }

  return Promise.reject({ ...resError?.data });
};

axiosInstant.interceptors.response.use(
  (response: any) => successHandler(response),
  (error: any) => errorHandler(error),
);
