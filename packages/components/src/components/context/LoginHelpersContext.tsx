import React, { useContext } from 'react'

import _ from 'lodash'
import { useReduxState } from '../../hooks/use-redux-state'
import * as selectors from '../../redux/selectors'

export interface LoginHelpersProviderProps {
  children?: React.ReactNode
}

export interface LoginHelpersProviderState {
  isLoggingIn: boolean
}

export const LoginHelpersContext =
  React.createContext<LoginHelpersProviderState>({
    isLoggingIn: false,
  })
LoginHelpersContext.displayName = 'LoginHelpersContext'

export function LoginHelpersProvider(props: LoginHelpersProviderProps) {
  const value = {
    isLoggingIn: useReduxState(selectors.isLoggingInSelector),
  }

  return (
    <LoginHelpersContext.Provider value={value}>
      {props.children}
    </LoginHelpersContext.Provider>
  )
}

export const LoginHelpersConsumer = LoginHelpersContext.Consumer

export function useLoginHelpers() {
  return useContext(LoginHelpersContext)
}
