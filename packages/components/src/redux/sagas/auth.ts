import { REHYDRATE } from 'redux-persist'
import { all, fork, put, select, take, takeLatest } from 'typed-redux-saga'

import { clearOAuthQueryParams } from '../../utils/helpers/auth'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import userPool from '../../libs/auth/userPool'

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
  yield put(
    actions.loginSuccess({
      appToken: 'data.accessToken.jwtToken',
      user: {
        id: 'data.accessToken.payload.sub',
        name: 'DUMMY_USER_NAME',
        avatarUrl:
          'https://gravatar.com/avatar/80139cbc27fcec1066bc45100d992c79?s=400&d=robohash&r=x',
      },
    }),
  )

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
      newPasswordRequired: (data) => console.log(data),
    })
  })

  try {
    const { data } = yield authPromise

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
    yield put(actions.loginFailure(error))
  }
}

function* onLoginSuccess(
  _action: ExtractActionFromActionCreator<typeof actions.loginSuccess>,
) {}

function* onLoginFailure(
  action: ExtractActionFromActionCreator<typeof actions.loginFailure>,
) {}

function onLogout() {
  clearOAuthQueryParams()
}

export function* authSagas() {
  yield* all([
    yield* fork(init),
    yield* takeLatest(REHYDRATE, onRehydrate),
    yield* takeLatest('LOGIN_REQUEST', onLoginRequest),
    yield* takeLatest('LOGIN_FAILURE', onLoginFailure),
    yield* takeLatest('LOGIN_SUCCESS', onLoginSuccess),
    yield* takeLatest('LOGOUT', onLogout),
  ])
}
