import React from 'react'
import { View } from 'react-native'

import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { useSafeArea } from '../../libs/safe-area-view'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, scaleFactor } from '../../styles/variables'
import { IconButton } from '../common/IconButton'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { useTheme } from '../context/ThemeContext'
import { ThemedText } from '../themed/ThemedText'
import { getNotificationColor } from '../../utils/helpers/colors'

export function AppBannerMessage() {
  const safeAreaInsets = useSafeArea()

  const bannerMessage = useReduxState(selectors.bannerMessageSelector)
  const closeBannerMessage = useReduxAction(actions.closeBannerMessage)
  const theme = useTheme()

  if (!(bannerMessage && bannerMessage.message)) return null
  const backgroundColor = getNotificationColor(bannerMessage.type, theme)

  return (
    <View
      style={[
        sharedStyles.fullWidth,
        {
          paddingTop: safeAreaInsets.top,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        },
        { backgroundColor },
      ]}
    >
      <View
        style={[
          sharedStyles.fullWidth,
          sharedStyles.horizontal,
          sharedStyles.alignItemsCenter,
        ]}
      >
        <Spacer width={contentPadding / 2} />
        <View style={{ width: 18 + contentPadding }} />
        <Spacer width={contentPadding / 2} />

        <View
          style={[
            sharedStyles.flex,
            sharedStyles.center,
            {
              paddingVertical: contentPadding,
              paddingHorizontal: contentPadding / 2,
            },
          ]}
        >
          <Link
            analyticsCategory="banner_link"
            analyticsLabel={bannerMessage.id}
            href={bannerMessage.href}
            openOnNewTab={bannerMessage.openOnNewTab}
            tooltip={undefined}
          >
            <ThemedText
              color="foregroundColor"
              style={[
                sharedStyles.textCenter,
                {
                  fontWeight: 'bold',
                },
              ]}
            >
              {bannerMessage.message}
            </ThemedText>
          </Link>
        </View>

        <Spacer width={contentPadding / 2} />

        <IconButton
          family="octicon"
          name="x"
          onPress={() => closeBannerMessage(bannerMessage.id)}
          size={18 * scaleFactor}
          tooltip="Dismiss"
        />

        <Spacer width={contentPadding / 2} />
      </View>

      <Separator horizontal />
    </View>
  )
}
