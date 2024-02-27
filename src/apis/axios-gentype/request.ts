import TokenManagement from 'brainless-token-manager';
import axios from 'axios';
import { Api } from '@/apis/axios-gentype/api-axios';

export const axiosInstant = axios.create({
  baseURL: process.env.VITE_APP_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const TokenManager = new TokenManagement({
  getAccessToken: async () => {
    const token = localStorage.getItem('accessToken');

    return `${token}`;
  },
  getRefreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    return `${refreshToken}`;
  },
  onInvalidRefreshToken: () => {
    // Logout, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  executeRefreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return {
        token: '',
        refresh_token: '',
      };
    }

    const r = await axiosInstant.post('/auth/refresh-token', {
      refreshToken: refreshToken,
    });

    return {
      token: r?.data?.accessToken,
      refresh_token: r?.data?.refreshToken,
    };
  },
  onRefreshTokenSuccess: ({ token, refresh_token }) => {
    if (token && refresh_token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh_token);
    }
  },
});

export const injectHeaders = async (headers: any) => {
  const token: string = (await TokenManager.getToken()) as string;

  if (!headers) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  if (headers?.Authorization) {
    return {
      ...headers,
    };
  }

  if (headers) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

// const successHandler = async (response: AxiosResponse) => {
//   return response;
// };

// const errorHandler = (error: AxiosError) => {
//   const resError: AxiosResponse<any> | undefined = error.response;

//   return Promise.reject({ ...resError?.data });
// };

// axiosInstant.interceptors.request.use(
//   async (request: any) => {
//     return request;
//   },
//   (error) => {
//     Promise.reject(error);
//   },
// );

// axiosInstant.interceptors.response.use(
//   (response: any) => successHandler(response),
//   (error: any) => errorHandler(error),
// );

const api = new Api({
  instance: axiosInstant,
  injectHeaders,
});

export { api };
