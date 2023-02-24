# handle refresh token with axios, umi-request using interceptors and token management package

## 1. Interceptors: After all requests failed, we will call a request to take a new access token after that retry all requests which failed

![alt text](./public/axios-umi-request-y-interceptors.png)

## 2. Token management package: Check access token expire if token expire will call a request to take a new access token after that call requests

`NPM: https://www.npmjs.com/package/token-management`
`Brainless: https://www.npmjs.com/package/brainless-token-manager`

![alt text](./public/token-management.png)
