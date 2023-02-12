import { extend } from 'umi-request';

export const umiRequestInstant = extend({
  prefix: process.env.VITE_APP_API,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error: any) => {
    throw error?.data || error?.response;
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

const onRefreshToken = async () => {
  let refreshToken = localStorage.getItem('refreshToken');

  return umiRequestInstant.post('/auth/refresh-token', {
    data: {
      refreshToken,
    },
  });
};

umiRequestInstant.interceptors.request.use((url, options) => {
  const accessToken = localStorage.getItem('accessToken');

  return {
    url,
    options: {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  };
});

umiRequestInstant.interceptors.response.use(async (response, options) => {
  if (response?.status === 403) {
    if (!isRefreshing) {
      isRefreshing = true;
      onRefreshToken().then((data: any) => {
        isRefreshing = false;
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data?.accessToken);
          localStorage.setItem('refreshToken', data?.refreshToken);
          onRefreshed(data?.accessToken);
        }
      });
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh(async (token: string) => {
        resolve(umiRequestInstant(options.url, { ...options, Authorization: `Bearer ${token}` }));
      });
    });
  }

  return response;
});
