import React from 'react'

import { useReduxState } from '../hooks/use-redux-state'
import * as selectors from '../redux/selectors'
import { LoginScreen } from '../screens/LoginScreen'
import { MainScreen } from '../screens/MainScreen'

export const AppNavigator = React.memo(() => {
  const user = useReduxState(selectors.currentUserSelector)

  return (
    <>
      {user ? (
        <MainScreen key="app-main-screen" />
      ) : (
        <LoginScreen key="app-login-screen" />
      )}
    </>
  )
})

AppNavigator.displayName = 'AppNavigator'
