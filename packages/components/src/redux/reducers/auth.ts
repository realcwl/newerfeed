import { User } from '@devhub/core'
import immer from 'immer'
import _ from 'lodash'
import { REHYDRATE } from 'redux-persist'

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

  // AuthError will go here, which is used during the sign in phase. User will
  // be prompted with this error message to guide sign-in.
  error: AuthError | undefined

  // Message shown to user when he/she successfully signed up, prompting them
  // to verify their email.
  signUpSuccessMsg: string

  // Indicate whether user is logging in. If the user is logged in, this will be
  // indicated by the non-empty user field.
  isLoggingIn: boolean

  // Stored user's personal data.
  user: User | undefined
}

const initialState: State = {
  appToken: undefined,
  error: undefined,
  signUpSuccessMsg: '',
  isLoggingIn: false,
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
        signUpSuccessMsg: '',
      }
    }
    case 'LOGIN_SUCCESS': {
      return {
        appToken: action.payload.appToken,
        user: action.payload.user,
        isLoggingIn: false,
        error: undefined,
        signUpSuccessMsg: '',
      }
    }
    case 'SIGN_UP_SUCCESS': {
      return {
        appToken: undefined,
        user: undefined,
        error: undefined,
        isLoggingIn: false,
        signUpSuccessMsg:
          'Signed up successfully, please check your email for a confirmation link (check your Spam if not found in Inbox)',
      }
    }
    case 'AUTH_FAILURE': {
      return {
        appToken: undefined,
        user: undefined,
        isLoggingIn: false,
        error: {
          name: action.error.name,
          message: action.error.message,
        },
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

        // field "id" should only be changed at the login time, from undefined
        // to the actual user id.
        const user: User = {
          ...userSeedState,
        }
        draft.user = user
      })
    }

    default:
      return state
  }
}
