import React, { Fragment, useCallback, useState } from 'react'
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Linking,
  Modal,
} from 'react-native'
import { useDispatch } from 'react-redux'

import ImageViewer from '../../libs/image-viewer'
import {
  Attachment,
  getDateSmallText,
  getFullDateText,
  Theme,
} from '@devhub/core'

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
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { BaseCardProps, renderCardActions, sizes } from './BaseCard.shared'
import { CardActions } from './partials/CardActions'
import {
  CardItemSeparator,
  cardItemSeparatorSize,
} from './partials/CardItemSeparator'
import { REGEX_IS_URL } from '@devhub/core/src/utils/constants'
import { TouchableHighlight } from '../common/TouchableHighlight'
import { Button } from '../common/Button'
import {
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-web'

const GestureHandlerTouchableOpacity = Platform.select({
  android: () => require('react-native-gesture-handler').TouchableOpacity,
  ios: () => require('react-native-gesture-handler').TouchableOpacity,
  default: () => require('../common/TouchableOpacity').TouchableOpacity,
})()

const NUM_OF_LINES = 2

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
    // width: avatarSize,
    height: smallAvatarSize,
    paddingRight: 10 * scaleFactor,
  },

  avatarContainer: {
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
    attachments,
    height,

    author,
    timestamp,
    isRead,
    isSaved: isSaved,
    link,
    nodeIdOrId,
    text,
    title,
    type,
  } = props

  const isMuted = false // appViewMode === 'single-column' ? false : isRead

  const [textShown, setTextShown] = useState(true)
  const [imageToView, setImageToView] = useState<Attachment | null>(null)

  const toggleShowMoreText = () => {
    setTextShown(!textShown)
  }

  const parseTextWithLinks = (text: string) => {
    let prev = 0
    let match: RegExpExecArray | null = null
    const res: any[] = []
    while ((match = REGEX_IS_URL.exec(text ?? 'no content')) !== null) {
      const link = text.slice(match.index, match.index + match[0].length)
      res.push(
        <ThemedText color="foregroundColorMuted65" key={res.length}>
          {text.slice(prev, match.index)}
        </ThemedText>,
      )
      res.push(
        <ThemedText
          color="red"
          key={res.length}
          // assume most website will redirect http to https
          onPress={() =>
            Linking.openURL(link.startsWith('http') ? link : `http://${link}`)
          }
        >
          {link}
        </ThemedText>,
      )
      prev = match.index + match[0].length
    }
    res.push(
      <ThemedText color="foregroundColorMuted65" key={res.length}>
        {text.slice(prev)}
      </ThemedText>,
    )
    return res
  }

  const [hasMore, setHasMore] = useState(false)
  const checkHasMore = useCallback(
    ({
      nativeEvent: {
        layout: { height },
      },
    }) => {
      if (height > 19 * NUM_OF_LINES) {
        if (!hasMore) {
          setTextShown(false)
        }
        setHasMore(true)
      }
    },
    [height, hasMore, textShown],
  )

  return (
    <View
      key={`base-card-container-${type}-${nodeIdOrId}-inner`}
      style={[styles.container]}
    >
      <ImageViewer image={imageToView} setImage={setImageToView} />
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
                style={[
                  styles.title,
                  sharedStyles.flex,
                  sharedStyles.marginVerticalQuarter,
                ]}
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
                numberOfLines={textShown ? undefined : NUM_OF_LINES}
                onLayout={checkHasMore}
              >
                {parseTextWithLinks(text ?? 'no content')}
              </ThemedText>
            </View>
            {hasMore && (
              <View style={sharedStyles.horizontalAndVerticallyAligned}>
                <ThemedText
                  color="primaryBackgroundColor"
                  onPress={toggleShowMoreText}
                  style={[styles.text, sharedStyles.flex]}
                >
                  {textShown ? 'show less' : 'show more'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {!!attachments && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 10,
              justifyContent: 'flex-start',
            }}
          >
            {attachments.map((attachment) => {
              if (attachment.dataType === 'img') {
                return (
                  <TouchableHighlight
                    onPress={() => {
                      setImageToView(attachment)
                    }}
                  >
                    <Image
                      source={{
                        uri: attachment.url,
                      }}
                      style={{ width: 100, height: 100 }}
                    />
                  </TouchableHighlight>
                )
              }
            })}
          </View>
        )}

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
              itemNodeId={nodeIdOrId}
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
