import { extend } from 'umi-request';
import TokenManager from '.';

// Can implement by umi-request, axios, fetch....
export const requestNew = extend({
  prefix: process.env.VITE_APP_API,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error) => {
    throw error?.data || error?.response;
  },
});

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const injectBearer = (token: string, configs: any) => {
  if (!configs) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  if (configs?.headers?.Authorization) {
    return {
      ...configs,
      headers: {
        ...configs.headers,
      },
    };
  }

  if (configs?.headers) {
    return {
      ...configs,
      headers: {
        ...configs.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return {
    ...configs,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const tokenManager = new TokenManager({
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
  isValidRefreshToken: async (refreshToken) => {
    try {
      const decoded = parseJwt(refreshToken);
      const { exp } = decoded;

      const currentTime = Date.now() / 1000;

      if (exp - 5 > currentTime) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  },
  executeRefreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return {
        token: '',
        refresh_token: '',
      };
    }

    const r = await requestNew.post('/auth/refresh-token', {
      data: {
        refreshToken: refreshToken,
      },
    });

    return {
      token: r?.accessToken,
      refresh_token: r?.refreshToken,
    };
  },
  onRefreshTokenSuccess: ({ token, refresh_token }) => {
    if (token && refresh_token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh_token);
    }
  },
});

export const privateRequestNew = async (request: any, suffixUrl: string, configs?: any) => {
  const token: string = configs?.token
    ? configs?.token
    : ((await tokenManager.getToken()) as string);

  return request(suffixUrl, injectBearer(token, configs));
};
