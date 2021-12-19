import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { StyleSheet } from 'react-native'
import { isEmpty } from 'lodash'

import { BannerMessage, constants } from '@devhub/core'
import { useTransition } from '@react-spring/core'
import { ThemedText } from '../themed/ThemedText'
import { ThemedView } from '../themed/ThemedView'
import { useReduxState } from '../../hooks/use-redux-state'
import { scaleFactor } from '../../styles/variables'
import { SpringAnimatedView } from '../animated/spring/SpringAnimatedView'
import { getDefaultReactSpringAnimationConfig } from '../../utils/helpers/animations'
import { useTheme } from '../context/ThemeContext'
import { getNotificationColor } from '../../utils/helpers/colors'
import { resetBannerMessage } from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import {
  NOTIFICATION_LOCAL_MSG_RESET_DELAY_MS,
  NOTIFICATION_VISIBLE_DURATION_MS,
} from '../../utils/constants'
import { ThemedTouchableOpacity } from '../themed/ThemedTouchableOpacity'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 30 * scaleFactor,
    top: '50%',
    flex: 1,
    alignSelf: 'center',
    borderRadius: 5 * scaleFactor,
  },
  touchable: {
    flex: 1,
  },
})

/**
 * Notification to show app-wise messages or notifications.
 * @returns centered modal notification
 */
export const NotificationModal = () => {
  const [show, setShow] = useState(false)
  // localMsg: need to separate the animation cycle from the reducer cycle
  // otherwise flickering will happen
  const [localMsg, setLocalMsg] = useState<BannerMessage>()
  const [clearLocalMsgTimer, setClearLocalMsgTimer] =
    useState<NodeJS.Timeout | null>(null)
  const [visibilityTimer, setVisibityTimer] = useState<NodeJS.Timeout | null>(
    null,
  )
  const notificationMessage = useReduxState(selectors.bannerMessageSelector)
  const dispatch = useDispatch()

  const overlayTransition = useTransition(show, {
    config: getDefaultReactSpringAnimationConfig({ precision: 0.1 }),
    immediate: constants.DISABLE_ANIMATIONS,
    unique: true,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    update: { opacity: show ? 1 : 0 },
    leave: { opacity: 0 },
    delay: 200,
  })
  const theme = useTheme()

  // save notificationMessage to local when receiving a valid messag
  useEffect(() => {
    if (!isEmpty(notificationMessage?.message)) {
      setLocalMsg(notificationMessage)
      setShow(true)
    }
  }, [notificationMessage])

  // automatic modal disappearing effect
  useEffect(() => {
    const autoClose = localMsg?.autoClose
    if (show && autoClose) {
      handleClose(NOTIFICATION_VISIBLE_DURATION_MS)
    }
  }, [show, localMsg])

  // handle close modal with or without delay ms, to avoid flickering.
  // 1. conditional rendering for overlayTransition() will result in no
  //    animation, that's why here we always return overlayTransition()
  // 2. because of point 1, we need to update `show` before `localMsg`
  //    so that component won't show a modal with empty  message.
  const handleClose = (delayMs?: number) => {
    // consume it right away since message is copied to local state
    dispatch(resetBannerMessage())

    if (visibilityTimer) {
      clearTimeout(visibilityTimer)
    }
    setVisibityTimer(
      setTimeout(() => {
        setShow(false)
      }, delayMs || 0),
    )
    if (clearLocalMsgTimer) {
      clearTimeout(clearLocalMsgTimer)
    }
    setClearLocalMsgTimer(
      setTimeout(() => {
        setLocalMsg(undefined)
      }, (delayMs || 0) + NOTIFICATION_LOCAL_MSG_RESET_DELAY_MS),
    )
  }

  const notificationColor = getNotificationColor(localMsg?.type, theme)

  return overlayTransition(
    ({ opacity }, item) =>
      item && (
        <SpringAnimatedView
          key="overlay-notification"
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: 205,
              opacity: opacity.to((opacity) =>
                Math.max(0, Math.min(Number(opacity.toFixed(1)), 1)),
              ),
            },
          ]}
        >
          <ThemedTouchableOpacity
            onPress={() => handleClose()}
            style={styles.touchable}
          >
            <ThemedView
              backgroundColor={'backgroundColorLighther3'}
              style={[
                styles.container,
                {
                  borderWidth: 2,
                  borderTopColor: notificationColor,
                  borderBottomColor: notificationColor,
                  borderLeftColor: notificationColor,
                  borderRightColor: notificationColor,
                },
              ]}
            >
              <ThemedText color={'foregroundColor'}>
                {localMsg?.message}
              </ThemedText>
            </ThemedView>
          </ThemedTouchableOpacity>
        </SpringAnimatedView>
      ),
  )
}
