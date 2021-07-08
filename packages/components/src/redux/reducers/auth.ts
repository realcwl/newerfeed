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

  // Indicate whether user is logged in.
  // If user is not logged in, shows the user sign-in page.
  // Otherwise shows the user the actual App.
  isLoggedIn: boolean

  // Stored user's personal data.
  user: User | undefined
}

const initialState: State = {
  appToken: undefined,
  error: undefined,
  isLoggedIn: false,
  user: undefined,
}

export const authReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state
  }
}
