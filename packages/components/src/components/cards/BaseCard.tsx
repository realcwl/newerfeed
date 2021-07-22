import React, { Fragment } from 'react'
import { PixelRatio, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { getDateSmallText, getFullDateText, Theme } from '@devhub/core'

import { Platform } from '../../libs/platform'
import { Separator } from '../common/Separator'
import { sharedStyles } from '../../styles/shared'
import {
  avatarSize,
  contentPadding,
  normalTextSize,
  scaleFactor,
  smallAvatarSize,
  smallerTextSize,
  smallTextSize,
} from '../../styles/variables'
import { getCardBackgroundThemeColor } from '../columns/ColumnRenderer'
import { Avatar } from '../common/Avatar'
import { IntervalRefresh } from '../common/IntervalRefresh'
import { smallLabelHeight } from '../common/Label'
import { Spacer } from '../common/Spacer'
import { Text } from '../common/Text'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { BaseCardProps, renderCardActions, sizes } from './BaseCard.shared'
import { CardActions } from './partials/CardActions'
import {
  CardItemSeparator,
  cardItemSeparatorSize,
} from './partials/CardItemSeparator'

const GestureHandlerTouchableOpacity = Platform.select({
  android: () => require('react-native-gesture-handler').TouchableOpacity,
  ios: () => require('react-native-gesture-handler').TouchableOpacity,
  default: () => require('../common/TouchableOpacity').TouchableOpacity,
})()

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  innerContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: sizes.cardPaddingHorizontal,
    paddingVertical: sizes.cardPaddingVertical,
  },

  smallAvatarContainer: {
    position: 'relative',
    // width: avatarSize,
    height: smallAvatarSize,
    paddingRight: '10px',
  },

  avatarContainer: {
    position: 'relative',
    width: sizes.avatarContainerWidth,
    height: sizes.avatarContainerHeight,
  },

  authorName: {
    lineHeight: sizes.titleLineHeight,
    fontSize: smallerTextSize,
    // width: '300',
    flexGrow: 1,
    overflow: 'hidden',
    // ...Platform.select({ web: { fontFeatureSettings: '"tnum"' } }),
  },

  avatar: {},

  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: sizes.iconContainerSize,
    height: sizes.iconContainerSize,
    borderRadius: sizes.iconContainerSize / 2,
    borderWidth: 2 * scaleFactor,
  },

  icon: {
    marginLeft: 1 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: PixelRatio.roundToNearestPixel(
      sizes.iconContainerSize * (sizes.iconSize / sizes.iconContainerSize),
    ),
  },

  title: {
    flex: 1,
    // height: sizes.titleLineHeight,
    lineHeight: sizes.titleLineHeight,
    fontSize: normalTextSize,
    // fontWeight: '500',
    // overflow: 'hidden',
  },

  subtitle: {
    flexGrow: 1,
    lineHeight: sizes.subtitleLineHeight,
    fontSize: smallerTextSize,
    // fontWeight: '400',
    overflow: 'hidden',
  },

  text: {
    lineHeight: sizes.textLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  reason: {
    lineHeight: sizes.textLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    textAlign: 'right',
  },

  timestampText: {
    lineHeight: sizes.titleLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
    // ...Platform.select({ web: { fontFeatureSettings: '"tnum"' } }),
  },

  actionContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.actionContainerHeight,
  },

  action: {
    flex: 1,
    lineHeight: sizes.actionFontSize + 2 * scaleFactor,
    fontSize: sizes.actionFontSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  labelText: {
    lineHeight: smallLabelHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  subitemContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.subitemContainerHeight,
  },

  subitem: {
    flex: 1,
    maxWidth: '100%',
    lineHeight: sizes.subitemLineHeight,
    fontSize: sizes.subitemFontSize,
    fontWeight: '400',
    overflow: 'hidden',
  },

  githubAppMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.githubAppMessageContainerHeight,
    minHeight: sizes.githubAppMessageContainerHeight,
  },

  githubAppMessage: {
    flexGrow: 1,
    maxWidth: '100%',
    lineHeight: sizes.subitemLineHeight,
    fontSize: sizes.subitemFontSize,
    fontWeight: '300',
    fontStyle: 'italic',
    overflow: 'hidden',
  },
})

export const BaseCard = React.memo((props: BaseCardProps) => {
  const {
    action,
    height,

    author,
    timestamp,
    isRead,
    isSaved,
    link,
    nodeIdOrId,
    text,
    title,
    type,
  } = props

  const isMuted = false // appViewMode === 'single-column' ? false : isRead

  const backgroundThemeColor = (theme: Theme) =>
    getCardBackgroundThemeColor({
      isDark: theme.isDark,
      isMuted,
    })

  const dispatch = useDispatch()

  return (
    <View
      key={`base-card-container-${type}-${nodeIdOrId}-inner`}
      style={[styles.container]}
    >
      <View
        style={[
          styles.innerContainer,
          // { height: height - cardItemSeparatorSize },
        ]}
      >
        <View
          style={[sharedStyles.horizontal, sharedStyles.marginVerticalQuarter]}
        >
          <View style={styles.smallAvatarContainer}>
            <Avatar
              avatarUrl={author?.avatar?.imageURL}
              disableLink={author?.profileURL === link}
              linkURL={author?.profileURL}
              style={styles.avatar}
              size={smallAvatarSize}
            />
          </View>
          <ThemedText
            color="foregroundColorMuted65"
            numberOfLines={1}
            style={[styles.authorName]}
            {...Platform.select({
              web: { title: getFullDateText(timestamp) },
            })}
          >
            {author?.name}
          </ThemedText>
          {/* <Spacer width={sizes.horizontalSpaceSize} /> */}
          <View
            style={[
              sharedStyles.horizontal,
              sharedStyles.marginVerticalQuarter,
            ]}
          >
            <IntervalRefresh interval={5000} date={timestamp}>
              {() => {
                const dateText = getDateSmallText(timestamp)
                if (!dateText) return null

                return (
                  <>
                    <Text>{'  '}</Text>
                    <ThemedText
                      color="foregroundColorMuted65"
                      numberOfLines={1}
                      style={styles.timestampText}
                      {...Platform.select({
                        web: { title: getFullDateText(timestamp) },
                      })}
                    >
                      {dateText.toLowerCase()}
                    </ThemedText>
                  </>
                )
              }}
            </IntervalRefresh>
            {!!isSaved && (
              <>
                <Text>{'  '}</Text>
                <ThemedIcon
                  family="octicon"
                  name="bookmark"
                  color="orange"
                  size={smallTextSize}
                />
              </>
            )}

            {!isRead && (
              <>
                <Text>{'  '}</Text>
                <ThemedIcon
                  family="octicon"
                  name="dot-fill"
                  color={'primaryBackgroundColor'}
                  size={smallTextSize}
                />
              </>
            )}
          </View>
        </View>

        <Separator horizontal backgroundThemeColor="backgroundColorLighther2" />

        <View
          style={[sharedStyles.horizontal, sharedStyles.marginVerticalQuarter]}
        >
          <View style={[sharedStyles.flex, sharedStyles.alignSelfCenter]}>
            <View style={sharedStyles.horizontalAndVerticallyAligned}>
              <ThemedText
                color="foregroundColor"
                style={[styles.title, sharedStyles.flex]}
              >
                {title}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={sharedStyles.horizontal}>
          <View style={[sharedStyles.flex, sharedStyles.alignSelfCenter]}>
            <View style={sharedStyles.horizontalAndVerticallyAligned}>
              <ThemedText
                color="foregroundColorMuted65"
                style={[styles.text, sharedStyles.flex]}
              >
                {text}
              </ThemedText>
            </View>
          </View>
        </View>

        {!!renderCardActions && (
          <>
            <Spacer height={sizes.verticalSpaceSize} />

            <CardActions
              commentsCount={
                undefined
                // issueOrPullRequest ? issueOrPullRequest.comments : undefined
              }
              commentsLink={link}
              isRead={isRead}
              isSaved={isSaved}
              itemNodeIdOrIds={[nodeIdOrId]}
              type={type}
            />

            <Spacer height={sizes.verticalSpaceSize} />
          </>
        )}

        <Spacer flex={1} />
      </View>

      <CardItemSeparator
        leftOffset={
          sizes.cardPaddingHorizontal +
          sizes.avatarContainerWidth +
          sizes.horizontalSpaceSize
        }
        muted={isMuted}
      />
    </View>
  )
})

BaseCard.displayName = 'BaseCard'
