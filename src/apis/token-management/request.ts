import { extend } from 'umi-request';
import TokenManagement, { parseJwt } from './tokenManagement';

// Can implement by umi-request, axios, fetch....
export const request = extend({
  prefix: process.env.VITE_APP_API,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error) => {
    throw error?.data || error?.response;
  },
});

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

const TokenManager = new TokenManagement({
  isTokenValid: () => {
    try {
      const token = localStorage.getItem('accessToken');

      const decoded = parseJwt(token);
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
  getAccessToken: () => {
    const token = localStorage.getItem('accessToken');

    return `${token}`;
  },
  onRefreshToken(done) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return done(null);
    }

    request
      .post('/auth/refresh-token', {
        data: {
          refreshToken: refreshToken,
        },
      })
      .then((result) => {
        if (result?.accessToken && result?.refreshToken) {
          localStorage.setItem('accessToken', result?.accessToken);
          localStorage.setItem('refreshToken', result?.refreshToken);

          done(result.accessToken);

          return;
        }
        done(null);
      })
      .catch((err) => {
        done(null);
      });
  },
});

export const privateRequest = async (request: any, suffixUrl: string, configs?: any) => {
  const token: string = configs?.token
    ? configs?.token
    : ((await TokenManager.getToken()) as string);

  return request(suffixUrl, injectBearer(token, configs));
};
