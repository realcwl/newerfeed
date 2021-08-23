import { REHYDRATE } from 'redux-persist'
import { all, fork, put, select, take, takeLatest } from 'typed-redux-saga'

import { clearOAuthQueryParams } from '../../utils/helpers/auth'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import userPool from '../../libs/auth/userPool'
import axios, { AxiosResponse } from 'axios'
import { WrapUrlWithToken } from '../../utils/api'
import { constants } from '@devhub/core'

function* init() {
  yield take('LOGIN_SUCCESS')
  // TODO(chenweilunster): Implement Init function.
}

function* onRehydrate() {
  const appToken = yield* select(selectors.appTokenSelector)
  if (!appToken) return

  // yield put(actions.loginRequest({}))
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
      WrapUrlWithToken(
        constants.DEV_GRAPHQL_ENDPOINT,
        data.accessToken.jwtToken,
      ),
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
        user: {
          id: data.accessToken.payload.sub,
          name: 'DUMMY_USER_NAME',
          avatarUrl:
            'https://gravatar.com/avatar/80139cbc27fcec1066bc45100d992c79?s=400&d=robohash&r=x',
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

function* onLoginSuccess(
  _action: ExtractActionFromActionCreator<typeof actions.loginSuccess>,
) {}

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
    yield* takeLatest('LOGIN_SUCCESS', onLoginSuccess),
    yield* takeLatest('LOGOUT', onLogout),
  ])
}
