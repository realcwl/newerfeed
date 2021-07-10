import React, { useContext, useEffect, useMemo, useRef } from 'react'

import { ItemPushNotification } from '@devhub/core'
import { PixelRatio } from 'react-native'
import { useStore } from 'react-redux'
import { useDesktopOptions } from '../../hooks/use-desktop-options'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as selectors from '../../redux/selectors'

export interface UnreadCountProviderProps {
  children?: React.ReactNode
}

export type UnreadCountProviderState = number

export const UnreadCountContext =
  React.createContext<UnreadCountProviderState>(0)
UnreadCountContext.displayName = 'UnreadCountContext'

export function UnreadCountProvider(props: UnreadCountProviderProps) {
  // TODO(chenweilunster): Figure out how this context is used.
  return (
    <UnreadCountContext.Provider value={0}>
      {props.children}
    </UnreadCountContext.Provider>
  )
}

export const UnreadCountConsumer = UnreadCountContext.Consumer

export function useUnreadCount() {
  return useContext(UnreadCountContext)
}
