import { User } from '@devhub/core'
import immer from 'immer'
import _ from 'lodash'

import { Reducer } from '../types'

export interface AuthError {
  name: string
  message: string
  status?: number
  response?: any
}

export interface State {
  // Used to access Newsfeed backend server. This will be allocated when signed
  // in.
  appToken: string | undefined

  // Used for token refresher
  refreshToken: string | undefined

  // AuthError will go here, which is used during the sign in phase. User will
  // be prompted with this error message to guide sign-in.
  error: AuthError | undefined

  // Message shown to user when he/she successfully signed up, prompting them
  // to verify their email.
  signUpSuccessMsg: string

  // Indicate whether user is logging in. If the user is logged in, this will be
  // indicated by the non-empty user field.
  isLoggingIn: boolean

  // The last timestamp user is authenticated denoted in ms.
  lastAuthTime: number

  // Stored user's personal data.
  user: User | undefined
}

export const initialState: State = {
  appToken: undefined,
  error: undefined,
  signUpSuccessMsg: '',
  isLoggingIn: false,
  lastAuthTime: 0,
  refreshToken: undefined,
  user: undefined,
}

export const authReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'SIGN_UP_REQUEST': {
      return {
        appToken: undefined,
        user: undefined,
        isLoggingIn: true,
        error: undefined,
        lastAuthTime: 0,
        refreshToken: undefined,
        signUpSuccessMsg: '',
      }
    }
    case 'LOGIN_SUCCESS': {
      return {
        appToken: action.payload.appToken,
        user: action.payload.user,
        isLoggingIn: false,
        error: undefined,
        refreshToken: action.payload.refreshToken,
        lastAuthTime: action.payload.lastAuthTime
          ? action.payload.lastAuthTime
          : Date.now(),
        signUpSuccessMsg: '',
      }
    }
    case 'SIGN_UP_SUCCESS': {
      return {
        appToken: undefined,
        refreshToken: undefined,
        user: undefined,
        error: undefined,
        isLoggingIn: false,
        lastAuthTime: 0,
        signUpSuccessMsg:
          'Signed up successfully, please check your email for a confirmation link (check your Spam if not found in Inbox)',
      }
    }
    case 'AUTH_FAILURE': {
      return {
        appToken: undefined,
        refreshToken: undefined,
        user: undefined,
        isLoggingIn: false,
        error: {
          name: action.error.name,
          message: action.error.message,
        },
        lastAuthTime: 0,
        signUpSuccessMsg: '',
      }
    }
    case 'CLEAR_AUTH_ERROR': {
      return immer(state, (draft) => {
        draft.error = undefined
        // Also clean up success message.
        draft.signUpSuccessMsg = ''
      })
    }
    case 'UPDATE_SEED_STATE': {
      return immer(state, (draft) => {
        const userSeedState = action.payload.userSeedState
        if (!draft.user) return
        if (!!userSeedState.name) draft.user.name = userSeedState.name
        if (!!userSeedState.avatarUrl)
          draft.user.avatarUrl = userSeedState.avatarUrl
      })
    }

    default:
      return state
  }
}
