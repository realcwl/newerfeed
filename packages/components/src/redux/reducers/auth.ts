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

  // Indicate whether user is logging in. If the user is logged in, this will be
  // indicated by the non-empty user field.
  isLoggingIn: boolean

  // Stored user's personal data.
  user: User | undefined
}

const initialState: State = {
  appToken: undefined,
  error: undefined,
  isLoggingIn: false,
  user: undefined,
}

export const authReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST': {
      return immer(state, (draft) => {
        draft.isLoggingIn = true
      })
    }
    case 'LOGIN_SUCCESS': {
      return {
        appToken: action.payload.appToken,
        user: action.payload.user,
        isLoggingIn: false,
        error: undefined,
      }
    }
    case 'LOGIN_FAILURE': {
      return {
        appToken: undefined,
        user: undefined,
        isLoggingIn: false,
        error: {
          name: action.error.name,
          message: action.error.message,
        },
      }
    }

    default:
      return state
  }
}
