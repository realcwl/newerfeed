import immer from 'immer'
import {
  authFailure,
  clearAuthError,
  loginRequest,
  loginSuccess,
  signUpRequest,
  signUpSuccess,
  updateSeedState,
} from '../../actions'
import { State, initialState, authReducer, AuthError } from '../auth'

const fakeTime = new Date(Date.UTC(2021, 10, 6)).getTime()
jest.useFakeTimers('modern').setSystemTime(fakeTime)

describe('authReducer', () => {
  const loginPayload = {
    appToken: 'appToken',
    refreshToken: 'refreshToken',
    user: {
      id: 'userId',
      name: 'userName',
      email: 'user@gmail.com',
      avatarUrl: 'http://cdn.newsfeed.com/avatar/123.jpg',
    },
    lastAuthTIme: Date.now(),
  }

  const loggedInState = {
    appToken: loginPayload.appToken,
    user: loginPayload.user,
    isLoggingIn: false,
    error: undefined,
    lastAuthTime: loginPayload.lastAuthTIme,
    refreshToken: loginPayload.refreshToken,
    signUpSuccessMsg: '',
  }

  const loggingInState: State = {
    appToken: undefined,
    user: undefined,
    isLoggingIn: true,
    error: undefined,
    lastAuthTime: 0,
    refreshToken: undefined,
    signUpSuccessMsg: '',
  }

  const singupSuccessState = {
    appToken: undefined,
    refreshToken: undefined,
    user: undefined,
    error: undefined,
    isLoggingIn: false,
    lastAuthTime: 0,
    signUpSuccessMsg:
      'Signed up successfully, please check your email for a confirmation link (check your Spam if not found in Inbox)',
  }

  const authError = {
    name: '',
    message: 'string',
  } as AuthError

  const authFailureState = {
    appToken: undefined,
    refreshToken: undefined,
    user: undefined,
    isLoggingIn: false,
    error: authError,
    lastAuthTime: 0,
    signUpSuccessMsg: '',
  }

  const allStates = [
    initialState,
    loggedInState,
    loggingInState,
    singupSuccessState,
    authFailureState,
  ]

  // LOGIN_REQUEST, SIGN_UP_REQUEST
  test('should in logging in state', () => {
    const credentials = {
      email: 'email',
      password: 'password',
    }
    const loginAction = loginRequest(credentials)
    const signupAction = signUpRequest(credentials)

    allStates.map((state) => {
      expect(authReducer(state, loginAction)).toEqual(loggingInState)
      expect(authReducer(state, signupAction)).toEqual(loggingInState)
    })
  })

  // LOGIN_SUCCESS
  test('should update state after successful login', () => {
    const action = loginSuccess(loginPayload)

    allStates.map((state) => {
      expect(authReducer(state, action)).toEqual(loggedInState)
    })
  })

  // SIGN_UP_SUCCESS
  test('should update state after successful signup', () => {
    const action = signUpSuccess()

    allStates.map((state) => {
      expect(authReducer(state, action)).toEqual(singupSuccessState)
    })
  })

  // AUTH_FAILURE
  test('should update state after auth faliure', () => {
    const action = authFailure<AuthError>(authError)

    allStates.map((state) => {
      expect(authReducer(state, action)).toEqual(authFailureState)
    })
  })

  // CLEAR_AUTH_ERROR
  test('should clear auth error', () => {
    const action = clearAuthError()

    allStates.map((state) => {
      const updatedState = authReducer(state, action)
      expect(updatedState.error).toBe(undefined)
      expect(updatedState.signUpSuccessMsg).toBe('')
    })
  })

  // UPDATE_SEED_STATE
  test('update seed state', () => {
    const seedState = {
      userSeedState: {
        id: 'userSeedStateId',
        name: 'userSeedStateName',
        avatarUrl: 'userSeedStateAvatarUrl',
        email: 'userSeedStateEmail',
      },
      feedSeedState: [],
    }
    const action = updateSeedState(seedState)

    allStates.map((state) => {
      const expectedState = immer(state, (draft) => {
        if (!draft.user) return
        draft.user = {
          ...draft.user,
          name: seedState.userSeedState.name,
          avatarUrl: seedState.userSeedState.avatarUrl,
        }
      })
      expect(authReducer(state, action)).toEqual(expectedState)
    })
  })
})
