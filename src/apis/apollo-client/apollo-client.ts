/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-loop-func */
// @ts-nocheck
import { ApolloClient, ApolloLink, fromPromise, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';
import Cookies from 'js-cookie';

import { API_URL, WS_URL } from 'constant';
import { authKeys } from 'utils/cookie';

const authLink = setContext((_, { headers }) => {
  const token = Cookies.get(authKeys.accessToken) || '';

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const uploadLink = createUploadLink({
  uri: API_URL,
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    keepAlive: 5000,
    connectionParams() {
      const token = Cookies.get(authKeys.accessToken) || '';

      return {
        connectionParams: {
          authorization: token,
        },
      };
    },
  }),
);

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshUserToken($data: RefreshUserTokenInput!) {
    refreshUserToken(data: $data) {
      accessToken
      expiresIn
    }
  }
`;

export const onRefreshToken = async () => {
  try {
    if (!Cookies.get(authKeys.refreshToken)) throw new Error('No refresh token');

    const refreshResolverResponse = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        data: {
          refreshToken: Cookies.get(authKeys.refreshToken),
        },
      },
    });

    Cookies.set(authKeys.accessToken, refreshResolverResponse.data.refreshUserToken.accessToken);
    Cookies.set(authKeys.expiresIn, refreshResolverResponse.data.refreshUserToken.expiresIn);

    return refreshResolverResponse.data.refreshUserToken.accessToken;
  } catch (error) {
    Cookies.remove(authKeys.accessToken);
    Cookies.remove(authKeys.refreshToken);
    Cookies.remove(authKeys.lastLoginTime);
    Cookies.remove(authKeys.refreshTokenExpiresIn);
    Cookies.remove(authKeys.expiresIn);
  }
};

let isRefreshing = false;
let pendingRequests = [] as any[];

const resolvePendingRequests = (newToken) => {
  pendingRequests.map((callback: (v: string) => void) => callback(newToken));
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Pass through if the error is not an authentication error
      if ((err as any).extensions?.response?.message !== 'Unauthorized') {
        forward(operation);
        continue;
      }

      if (operation.operationName === 'refreshUserToken') return;

      let forward$;

      if (!isRefreshing) {
        isRefreshing = true;
        forward$ = fromPromise(
          onRefreshToken()
            .then((accessToken) => {
              // Store the new tokens for your auth link
              resolvePendingRequests(accessToken);
              return accessToken;
            })
            .catch(() => {
              pendingRequests = [];
              // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
              return;
            })
            .finally(() => {
              isRefreshing = false;
            }),
        ).filter((value) => Boolean(value));
      } else {
        // Will only emit once the Promise is resolved
        forward$ = fromPromise(
          new Promise((resolve) => {
            pendingRequests.push((newToken: string) => resolve(newToken));
          }),
        );
      }

      return forward$.flatMap((newToken) => {
        if (newToken) {
          const oldHeaders = operation.getContext().headers;
          // modify the operation context with a new token
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${newToken}`,
            },
          });
        }

        return forward(operation);
      });
    }
  }
});

// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);

//     return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
//   },
//   wsLink,
//   ApolloLink.from([errorLink, authLink, uploadLink]),
// );

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, uploadLink, wsLink]),
  cache: new InMemoryCache(),
  name: 'web-' + process.env.REACT_APP_MODE,
});
