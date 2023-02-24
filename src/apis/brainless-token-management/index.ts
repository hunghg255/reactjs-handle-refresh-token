import EventEmitter from './EventEmitter';

export interface TokenManagerContructor {
  getAccessToken: () => Promise<string>;
  getRefreshToken: () => Promise<string>;
  isValidToken?: (token: string) => Promise<boolean>;
  isValidRefreshToken?: (refresh_token: string) => Promise<boolean>;
  executeRefreshToken: () => Promise<{ token: string; refresh_token: string }>;
  onRefreshTokenSuccess: ({
    token,
    refresh_token,
  }: {
    token: string;
    refresh_token: string;
  }) => void;
  onInvalidRefreshToken: () => void;
  refreshTimeout?: number;
}

export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const injectBearer = (token: string, configs: any) => {
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

export default class TokenManager {
  private event: EventEmitter;
  public getAccessToken;
  public getRefreshToken;
  private onInvalidRefreshToken;
  private isRefreshing: boolean = false;
  private refreshTimeout: number = 30000;
  private isValidRefreshToken;
  private onRefreshTokenSuccess;
  private isValidToken;

  constructor({
    getRefreshToken,
    getAccessToken,
    isValidToken,
    refreshTimeout = 30000,
    executeRefreshToken,
    onInvalidRefreshToken,
    onRefreshTokenSuccess,
    isValidRefreshToken,
  }: TokenManagerContructor) {
    const event = new EventEmitter();
    this.refreshTimeout = refreshTimeout;
    this.getAccessToken = getAccessToken;
    this.getRefreshToken = getRefreshToken;
    this.onInvalidRefreshToken = onInvalidRefreshToken;
    this.onRefreshTokenSuccess = onRefreshTokenSuccess;

    if (isValidToken) {
      this.isValidToken = isValidToken;
    } else {
      this.isValidToken = this.isTokenValid;
    }

    if (isValidRefreshToken) {
      this.isValidRefreshToken = isValidRefreshToken;
    } else {
      this.isValidRefreshToken = this.isTokenValid;
    }

    event.on('refreshTokenExpired', () => {
      this.onInvalidRefreshToken && this.onInvalidRefreshToken();
    });

    event.on('refresh', () => {
      (async () => {
        try {
          const refreshToken = await this.getRefreshToken();
          const isRefreshTokenValid = await this.isValidRefreshToken(refreshToken);
          if (!isRefreshTokenValid) {
            event.emit('refreshTokenExpired');
          } else {
            const token = await getAccessToken();
            const isValid: boolean = await this.isValidToken(token);
            if (isValid) {
              event.emit('refreshDone', token);
            } else {
              event.emit('refreshing');
            }
          }
        } catch (e) {}
      })();
    });

    event.on('refreshing', async () => {
      if (this.isRefreshing) {
        return;
      }

      // fetch
      this.isRefreshing = true;

      const evtFire = false;
      const { token, refresh_token } = await executeRefreshToken();
      if (token && refresh_token) {
        this.onRefreshTokenSuccess && this.onRefreshTokenSuccess({ token, refresh_token });
      }
      this.event.emit('refreshDone', token);
      this.isRefreshing = false;

      if (this.refreshTimeout) {
        setTimeout(() => {
          if (!evtFire) {
            this.event.emit('refreshDone', null);
            this.isRefreshing = false;
          }
        }, this.refreshTimeout);
      }
    });

    this.event = event;
  }

  getToken() {
    return new Promise((resolve) => {
      let isCalled = false;

      const refreshDoneHandler = (token: string) => {
        resolve(token);
        isCalled = true;
      };

      this.event.once('refreshDone', refreshDoneHandler);

      if (!isCalled) {
        this.event.emit('refresh');
      }
    });
  }

  async isTokenValid(token: string) {
    try {
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
  }
}
