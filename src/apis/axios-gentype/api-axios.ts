/* eslint-disable */
/*
 * ----------------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API-ES            ##
 * ## SOURCE: https://github.com/hunghg255/swagger-typescript-api-es   ##
 * ----------------------------------------------------------------------
 */

export interface Post {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface GetPostsDtoRes {
  posts: Post;
  current_page: number;
  total_page: number;
  page_size: number;
  total: number;
}

export interface CreatePostsDtoReq {
  title: string;
  description: string;
  /** @example ["Html"] */
  tags?: string[];
}

export interface LoginDtoReq {
  /** @example "admin" */
  username: string;
}

export interface LoginDtoRes {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDtoReq {
  refreshToken: string;
}

export interface RefreshTokenDtoRes {
  accessToken: string;
  refreshToken: string;
}

export interface GalleriesRes {
  id: string;
  imageUrl: string;
  description: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;

  instance?: AxiosInstance;
  injectHeaders?: (data: any) => any;
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;
  private injectHeaders?: (data: any) => any;

  constructor({
    securityWorker,
    secure,
    format,
    instance,
    injectHeaders,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance =
      instance ?? axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || '' });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
    this.injectHeaders = injectHeaders;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    let headers = {
      ...(requestParams.headers || {}),
      ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
    };

    if (this.injectHeaders) {
      headers = await this.injectHeaders(headers);
    }

    return this.instance.request({
      ...requestParams,
      headers,
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Agiletech test
 * @version 1.0
 * @contact
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: 'GET',
      ...params,
    });

  posts = {
    /**
     * @description Get tags
     *
     * @tags Posts
     * @name Tags
     * @summary Get tags
     * @request GET:/posts/tags
     * @secure
     */
    tags: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/posts/tags`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Get post
     *
     * @tags Posts
     * @name Posts
     * @summary Get posts
     * @request GET:/posts
     * @secure
     */
    posts: (
      query?: {
        /** @example "1" */
        page?: string;
        /** @example "title" */
        title?: string;
        /** @example "Html" */
        tags?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, GetPostsDtoRes>({
        path: `/posts`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Create new post
     *
     * @tags Posts
     * @name CraetePosts
     * @summary Create new post
     * @request POST:/posts
     * @secure
     */
    craetePosts: (data: CreatePostsDtoReq, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/posts`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Edit post
     *
     * @tags Posts
     * @name EditPosts
     * @summary Edit post
     * @request PATCH:/posts/{postId}
     * @secure
     */
    editPosts: (postId: any, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/posts/${postId}`,
        method: 'PATCH',
        secure: true,
        ...params,
      }),

    /**
     * @description Delete post
     *
     * @tags Posts
     * @name DeletePost
     * @summary Delete post
     * @request DELETE:/posts/{postId}
     * @secure
     */
    deletePost: (postId: any, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/posts/${postId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  auth = {
    /**
     * @description Account: admin, admin1, admin2, adminRefresh, adminRefresh1, adminRefresh2
     *
     * @tags Auth
     * @name Login
     * @summary Login
     * @request POST:/auth/login
     */
    login: (data: LoginDtoReq, params: RequestParams = {}) =>
      this.request<any, LoginDtoRes>({
        path: `/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name RefreshToken
     * @summary Refresh token
     * @request POST:/auth/refresh-token
     */
    refreshToken: (data: RefreshTokenDtoReq, params: RequestParams = {}) =>
      this.request<any, RefreshTokenDtoRes>({
        path: `/auth/refresh-token`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Logout
     * @summary Logout
     * @request DELETE:/auth/logout
     * @secure
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/logout`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  galleries = {
    /**
     * No description
     *
     * @tags Galleries
     * @name Galleries
     * @summary Get galleries
     * @request GET:/galleries
     */
    galleries: (params: RequestParams = {}) =>
      this.request<GalleriesRes, any>({
        path: `/galleries`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
