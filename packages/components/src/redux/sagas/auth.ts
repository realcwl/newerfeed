import { REHYDRATE } from 'redux-persist'
import {
  all,
  fork,
  put,
  select,
  delay,
  take,
  takeLatest,
} from 'typed-redux-saga'

import { clearOAuthQueryParams } from '../../utils/helpers/auth'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
} from 'amazon-cognito-identity-js'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import userPool from '../../libs/auth/userPool'
import axios, { AxiosResponse } from 'axios'
import { WrapUrlWithToken } from '../../utils/api'
import { constants } from '@devhub/core'
import { RootState } from '../types'

function* init() {
  yield take('LOGIN_SUCCESS')

  // do a token refresher every 45 minutes, but check every 5 minutes.
  while (true) {
    const lastAuthTime = yield* select(selectors.lastAuthTimeSelector)
    const currentUser = yield* select(selectors.currentUserSelector)
    const refreshToken = yield* select(selectors.refreshTokenSelector)

    // User signed out, directly return
    if (!currentUser) return

    if (!refreshToken) {
      yield put(
        actions.authFailure(
          Error('login credential not found, please login again'),
        ),
      )
      return
    }

    const fourtyFiveMinutes = 1000 * 60 * 45
    if (Date.now() - lastAuthTime > fourtyFiveMinutes) {
      const user = new CognitoUser({
        Username: currentUser.email,
        Pool: userPool,
      })

      // Wrap the callback in a promise to use Redux Saga.
      const authPromise = new Promise((resolve, reject) => {
        user.refreshSession(
          new CognitoRefreshToken({ RefreshToken: refreshToken }),
          (err, data) => {
            if (err) {
              reject(err)
            }
            resolve({ data })
          },
        )
      })

      try {
        const { data } = yield authPromise

        yield put(
          actions.loginSuccess({
            appToken: data.accessToken.jwtToken,
            refreshToken: data.refreshToken.token,
            user: currentUser,
          }),
        )
      } catch (error) {
        // Auth failure might come from unstable connection. (e.g. your phone
        // lost connection for a short period). In such error, where failure is
        // not attributed to authentication, we don't dispatch auth failure and
        // kick user out of their current session.
        if (error.code != constants.COGNITO_NETWORK_ERROR_CODE)
          yield put(actions.authFailure(error))
      }

      continue
    }

    // Check every 5 minutes
    yield delay(1000 * 60 * 5)
  }
}

function* onRehydrate() {
  const state: RootState = yield* select()
  const auth = state.auth
  if (!auth.appToken || !auth.refreshToken || !auth.user) {
    yield put(
      actions.authFailure(
        Error('login credential not found, please login again'),
      ),
    )
    return
  }

  yield put(
    actions.loginSuccess({
      appToken: auth.appToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
      lastAuthTime: auth.lastAuthTime,
    }),
  )
}

function* onLoginRequest(
  action: ExtractActionFromActionCreator<typeof actions.loginRequest>,
) {
  const user = new CognitoUser({
    Username: action.payload.email,
    Pool: userPool,
  })

  const authDetails = new AuthenticationDetails({
    Username: action.payload.email,
    Password: action.payload.password,
  })

  // Wrap the callback in a promise to use Redux Saga.
  const authPromise = new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        resolve({ data })
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: (err) => reject(err),
    })
  })

  try {
    const { data } = yield authPromise

    // Create user if it's not already exist
    const userResponse: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, data.accessToken.jwtToken),
      {
        query: jsonToGraphQLQuery({
          mutation: {
            createUser: {
              __args: {
                input: {
                  id: data.accessToken.payload.sub,
                  // TODO(chenweilunster): Allow user to change name during sign
                  // up stage.
                  name: 'default',
                },
              },
              id: true,
            },
          },
        }),
      },
    )

    yield put(
      actions.loginSuccess({
        appToken: data.accessToken.jwtToken,
        refreshToken: data.refreshToken.token,
        user: {
          id: data.accessToken.payload.sub,
          name: 'DUMMY_USER_NAME',
          avatarUrl:
            'https://gravatar.com/avatar/80139cbc27fcec1066bc45100d992c79?s=400&d=robohash&r=x',
          email: action.payload.email,
        },
      }),
    )
  } catch (error) {
    yield put(actions.authFailure(error))
  }
}

function* onSignUpRequest(
  action: ExtractActionFromActionCreator<typeof actions.signUpRequest>,
) {
  const { email, password } = action.payload
  const authPromise = new Promise((resolve, reject) => {
    userPool.signUp(email, password, [], [], (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve({ data })
      }
    })
  })

  try {
    const { data } = yield authPromise
    yield put(actions.signUpSuccess())
  } catch (error) {
    yield put(actions.authFailure(error))
  }
}

// TODO: remove following eslint comments when we have implement login and auth function
/* eslint-disable */
function* onLoginSuccess(
  _action: ExtractActionFromActionCreator<typeof actions.loginSuccess>,
) {}

/* eslint-enable */
function* onAuthFailure(
  action: ExtractActionFromActionCreator<typeof actions.authFailure>,
) {
  // TODO(chenweilunster): Auth failure should kick user out of the current
  // session and force user to login again.
}

function onLogout() {
  clearOAuthQueryParams()
}

export function* authSagas() {
  yield* all([
    yield* fork(init),
    yield* takeLatest(REHYDRATE, onRehydrate),
    yield* takeLatest('LOGIN_REQUEST', onLoginRequest),
    yield* takeLatest('SIGN_UP_REQUEST', onSignUpRequest),
    yield* takeLatest('AUTH_FAILURE', onAuthFailure),
    yield* takeLatest('LOGOUT', onLogout),
  ])
}
