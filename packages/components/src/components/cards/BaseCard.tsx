import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  PixelRatio,
  StyleSheet,
  View,
  Text,
  Image,
  Linking,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { getDateSmallText, getFullDateText, NewsFeedData } from '@devhub/core'
import { Platform } from '../../libs/platform'
import { sharedStyles } from '../../styles/shared'
import {
  avatarSize,
  largeTextSize,
  mediumAvatarSize,
  normalTextSize,
  scaleFactor,
  smallAvatarSize,
  smallerTextSize,
  smallTextSize,
} from '../../styles/variables'
import { Avatar } from '../common/Avatar'
import { useSubSource } from '../../hooks/use-sub-source'
import { IntervalRefresh } from '../common/IntervalRefresh'
import { smallLabelHeight } from '../common/Label'
import { Spacer } from '../common/Spacer'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { BaseCardProps, getCardPropsForItem, sizes } from './BaseCard.shared'
import { REGEX_IS_URL } from '@devhub/core/src/utils/constants'
import { TouchableHighlight } from '../common/TouchableHighlight'
import { useTheme } from '../context/ThemeContext'
import ImageViewer from '../../libs/image-viewer'
import FileDownloader from '../../libs/file-downloader'
import { useHistory } from '../../libs/react-router'
import {
  capatureView,
  setItemSavedStatus,
  setItemDuplicationReadStatus,
  setItemsReadStatus,
} from '../../redux/actions'
import { Link } from '../common/Link'
import { useFastScreenshot } from '../../hooks/use-fast-screenshot'
import { RouteConfiguration } from '../../navigation/AppNavigator'
import { Button } from '../common/Button'
import { useItem } from '../../hooks/use-item'
import { ButtonGroup } from '../common/ButtonGroup'
import { viewCapturingItemNodeIdSelector } from '../../redux/selectors'
import { TouchableOpacity } from '../common/TouchableOpacity'

const SIGNAL_RESET_MAX = 100
// Number of characters to render show more button.
const LENGTH_TO_SHOW_MORE = 70

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  innerContainer: {
    paddingHorizontal: sizes.cardPaddingHorizontal,
    paddingVertical: sizes.cardPaddingVertical,
  },

  smallAvatarContainer: {
    // width: avatarSize,
    height: smallAvatarSize,
    paddingRight: 10 * scaleFactor,
  },

  fileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10 * scaleFactor,
    justifyContent: 'flex-start',
  },

  deduplicationBarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6 * scaleFactor,
    justifyContent: 'flex-start',
  },

  avatarContainer: {
    width: sizes.avatarContainerWidth,
    height: sizes.avatarContainerHeight,
  },

  authorName: {
    fontSize: smallTextSize,
    lineHeight: sizes.titleLineHeight,
    flexGrow: 1,
    overflow: 'hidden',
    fontWeight: '800',
    paddingTop: 2 * scaleFactor,
  },

  avatar: { marginBottom: 5 * scaleFactor },

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
    lineHeight: sizes.titleLineHeight,
    fontSize: normalTextSize,
    fontWeight: '800',
  },

  subtitle: {
    flexGrow: 1,
    lineHeight: sizes.subtitleLineHeight,
    fontSize: smallerTextSize,
    // fontWeight: '400',
    overflow: 'hidden',
  },

  showMoreOrLessText: {
    lineHeight: sizes.textLineHeight,
    fontSize: smallTextSize,
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

  actionIcon: {
    marginLeft: 12 * scaleFactor,
  },

  marginTop6: {
    marginTop: 6 * scaleFactor,
  },
})

export const BaseCard = React.memo((props: BaseCardProps) => {
  const {
    type,
    nodeIdOrId,
    columnId,
    isRetweeted,
    shareMode = false,
    hideActions,
    rootRef,
    rootNodeIdOrId,
    setThreadVisibility,
    defaultExpand,
  } = props
  const dispatch = useDispatch()
  const item = useItem(nodeIdOrId)
  const rootItem: NewsFeedData | undefined = !!rootNodeIdOrId
    ? useItem(rootNodeIdOrId)
    : undefined

  if (!item) return null

  const {
    attachments,
    subSourceId,
    time,
    isRead,
    isSaved,
    link,
    text,
    title,
    repostedFrom,
    duplicateIds,
    isDuplicationRead,
    tags,
  } = getCardPropsForItem(type, columnId, item)

  if (!subSourceId) return null

  const shouldExpand =
    defaultExpand || item.subSource?.profileURL?.includes('twitter.com')
  // Whether has thread to show.
  const hasThread = !!item.thread && item.thread.length > 0
  const timestamp = time ? Date.parse(time) : new Date().toISOString()
  const parentShowMoreSignal = props.showMoreSignal

  const [textShown, setTextShown] = useState(false)
  const [showThread, setShowThread] = useState(shareMode)
  const [showMoreSignal, setShowMoreSignal] = useState<number>(0)

  // index of -1 will hide the image viewer, otherwise it's the image index to show
  const [imageIndexToView, setImageIndexToView] = useState<number>(-1)
  const ref = useRef<View>(null)
  const history = useHistory()

  const toggleShowMoreText = () => {
    setTextShown(!textShown)
  }

  const subSource = useSubSource(subSourceId)
  const profileUrl = subSource?.profileURL

  // Whether we should show "show more" button for the text. We calculate this
  // flag before rendering so that we don't need to render twice. This would
  // greatly save frontend resources.
  const hasMore = !!text && text.length > LENGTH_TO_SHOW_MORE && !shouldExpand

  // Hide or show duplication status for a single post.
  const [showDuplication, setShowDuplication] = useState<boolean>(false)

  const theme = useTheme()
  const [supportFastScreenshot] = useFastScreenshot()
  const isCapturingView =
    useSelector(viewCapturingItemNodeIdSelector) === nodeIdOrId
  const hasTitle: boolean = title != null && title !== ''
  const hasText: boolean = text != null && text !== ''
  const isWeb: boolean = Platform.OS === 'web'
  const largeMode = shareMode

  const images = attachments?.filter((a) => a.dataType === 'img') ?? []
  const files = attachments?.filter((a) => a.dataType === 'file') ?? []

  const textStyle = largeMode && sharedStyles.extraLargeText
  const parseSpecialCharacter = (text: string) => {
    text = text.replace('&amp;', '&')
    return text.split('\\n').map((txt, i, row) => (
      <ThemedText color="foregroundColorMuted65" key={txt} style={textStyle}>
        {txt}
        {i + 1 == row.length ? '' : `\n`}
      </ThemedText>
    ))
  }

  const parseTextWithLinks = (text: string) => {
    let prev = 0
    let match: RegExpExecArray | null = null
    const res: any[] = []

    while ((match = REGEX_IS_URL.exec(text ?? 'no content')) !== null) {
      const textLink = text.slice(match.index, match.index + match[0].length)
      res.push(parseSpecialCharacter(text.slice(prev, match.index)))
      res.push(
        <ThemedText
          color="red"
          key={res.length}
          style={textStyle}
          // assume most website will redirect http to https
          onPress={() =>
            Linking.openURL(
              textLink.startsWith('http') || textLink.startsWith('https')
                ? textLink
                : `http://${textLink}`,
            )
          }
        >
          {textLink}
        </ThemedText>,
      )
      prev = match.index + match[0].length
    }
    res.push(parseSpecialCharacter(text.slice(prev)))
    return res
  }

  const routeToSharedPostPage = useCallback(() => {
    history.push(
      RouteConfiguration.sharedPost.replace(
        ':id',
        rootNodeIdOrId ?? nodeIdOrId,
      ),
    )
  }, [nodeIdOrId, rootNodeIdOrId])

  // 0 initial, adding up to trigger expand
  useEffect(() => {
    if (
      showMoreSignal !== 0 ||
      (!!parentShowMoreSignal && parentShowMoreSignal !== 0)
    ) {
      setTextShown(true)
      if (setThreadVisibility) setThreadVisibility()
    }
  }, [showMoreSignal, parentShowMoreSignal])

  // Show a text summary snippet when text is too long, otherwise show the
  // entire text.
  function getTextComponentToShow(text: string | undefined) {
    return textShown || shareMode || !hasMore
      ? parseTextWithLinks(text ?? 'empty content')
      : parseTextWithLinks(
          `${text?.substring(0, LENGTH_TO_SHOW_MORE)}...` ?? 'empty content',
        )
  }

  // If user explicitly wants to hide actions, return false. Othe
  function shouldHideActions(): boolean {
    return hideActions || isRetweeted || shareMode || hasThread
  }

  function renderDeduplicationBar() {
    return (
      <View style={{ width: '100%' }}>
        <Button
          round={false}
          type={'custom'}
          style={{
            width: '100%',
            whiteSpace: 'nowrap',
            height: 24 * scaleFactor,
          }}
          colors={{
            backgroundThemeColor: 'backgroundColorLess2',
            foregroundThemeColor: 'foregroundColor',
            backgroundHoverThemeColor: 'backgroundColorLess3',
            foregroundHoverThemeColor: 'foregroundColor',
          }}
          contentContainerStyle={{ alignItems: 'flex-end' }}
          onPress={() => {
            setShowDuplication(!showDuplication)
            // Click on the deduplication bar means:
            // 1. user already read all duplication messages
            // 2. user must also read the original message
            dispatch(
              setItemDuplicationReadStatus({
                itemNodeId: nodeIdOrId,
                read: true,
                syncup: true,
              }),
            )
            dispatch(
              setItemsReadStatus({
                itemNodeIds: [nodeIdOrId],
                read: true,
                syncup: true,
              }),
            )
          }}
        >
          <View
            style={[sharedStyles.horizontal, sharedStyles.alignItemsCenter]}
          >
            {!isDuplicationRead && (
              <ThemedIcon
                family="octicon"
                name="dot-fill"
                color={'primaryBackgroundColor'}
                size={smallTextSize}
              />
            )}
            <Spacer width={sizes.horizontalSpaceSize} />
            <ThemedText color={'foregroundColor'}>
              {showDuplication ? 'hide' : 'show'}
              <ThemedText color={'foregroundColor'} style={[styles.title]}>
                {` ${duplicateIds?.length} `}
              </ThemedText>
              similar messages
            </ThemedText>
            <Spacer width={sizes.horizontalSpaceSize} />
            <ThemedIcon
              style={
                showDuplication ? { transform: [{ rotate: '180deg' }] } : {}
              }
              family="material"
              name={'arrow-drop-down-circle'}
              color={'foregroundColor'}
              size={largeTextSize}
            />
          </View>
        </Button>
      </View>
    )
  }

  const handleAvatarClick = useCallback(() => {
    if (profileUrl) {
      Linking.openURL(profileUrl).catch((err) =>
        console.error('An error occurred', err),
      )
    }
  }, [profileUrl])

  const handleClickCamera = useCallback(() => {
    if (isCapturingView) return
    setShowMoreSignal((showMoreSignal % SIGNAL_RESET_MAX) + 1)
    dispatch(
      capatureView({
        itemNodeId: nodeIdOrId,
        viewRef: rootRef ? rootRef : ref,
        backgroundColor: theme.backgroundColor,
      }),
    )
  }, [nodeIdOrId, ref, theme, isCapturingView, rootRef])

  function getAvatarSize(): number {
    return (
      (largeMode && (!isRetweeted ? avatarSize : mediumAvatarSize)) ||
      smallAvatarSize
    )
  }

  function renderBaseCardSummary() {
    if (!item || !item.thread || item?.thread.length == 0) return null
    return (
      <BaseCard
        columnId={columnId}
        nodeIdOrId={item.thread[0].id}
        isRetweeted={isRetweeted}
        shareMode={shareMode}
        type="COLUMN_TYPE_NEWS_FEED"
        rootRef={ref}
        rootNodeIdOrId={nodeIdOrId}
        defaultExpand={true}
        setThreadVisibility={() => setShowThread(true)}
      />
    )
  }

  function renderBaseCard() {
    if (!item) return null
    return (
      <View ref={rootRef ? undefined : ref}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            dispatch(
              setItemsReadStatus({
                itemNodeIds: rootNodeIdOrId
                  ? [nodeIdOrId, rootNodeIdOrId]
                  : [nodeIdOrId],
                read: true,
                syncup: true,
              }),
            )
          }
        >
          {!!item.thread &&
            item.thread?.map((data, idx) =>
              idx == 0 ? (
                <View key={`thread-card-${nodeIdOrId}-${data.id}`}>
                  <BaseCard
                    columnId={columnId}
                    nodeIdOrId={data.id}
                    isRetweeted={isRetweeted}
                    shareMode={shareMode}
                    type="COLUMN_TYPE_NEWS_FEED"
                    rootRef={ref}
                    rootNodeIdOrId={nodeIdOrId}
                    defaultExpand={true}
                  />
                </View>
              ) : (
                <View key={`thread-card-${nodeIdOrId}-${data.id}`}>
                  <BaseCard
                    columnId={columnId}
                    nodeIdOrId={data.id}
                    isRetweeted={isRetweeted}
                    shareMode={shareMode}
                    hideActions={true}
                    type="COLUMN_TYPE_NEWS_FEED"
                    rootRef={ref}
                    defaultExpand={true}
                  />
                </View>
              ),
            )}
          <View
            key={`base-card-container-${type}-${nodeIdOrId}-inner`}
            style={{
              backgroundColor: !isRetweeted
                ? 'transparent'
                : theme.backgroundColorLess2,
              overflow: 'hidden',
            }}
          >
            <ImageViewer
              images={images}
              index={imageIndexToView}
              setIndex={setImageIndexToView}
            />
            <View style={[styles.innerContainer]}>
              {/* Render Header part of the card */}
              <View
                style={[
                  sharedStyles.horizontal,
                  sharedStyles.marginVerticalQuarter,
                  isWeb && !hasTitle && sharedStyles.marginBottomHalf,
                ]}
              >
                <View
                  style={
                    largeMode && !isRetweeted
                      ? styles.avatarContainer
                      : styles.smallAvatarContainer
                  }
                >
                  <Avatar
                    avatarUrl={subSource ? subSource.avatarURL : ''}
                    disableLink={false}
                    linkURL={subSource ? subSource.profileURL : ''}
                    style={styles.avatar}
                    size={getAvatarSize()}
                  />
                </View>
                <ThemedText
                  color="foregroundColorMuted65"
                  numberOfLines={1}
                  style={[
                    styles.authorName,
                    sharedStyles.alignSelfCenter,
                    largeMode &&
                      (isRetweeted
                        ? sharedStyles.largeText
                        : sharedStyles.extraLargeText),
                  ]}
                  {...Platform.select({
                    web: { title: getFullDateText(timestamp) },
                  })}
                  onPress={handleAvatarClick}
                >
                  {subSource ? subSource.name : ''}
                </ThemedText>

                <View
                  style={[
                    sharedStyles.horizontal,
                    sharedStyles.alignItemsCenter,
                  ]}
                >
                  {!isRead &&
                    !isRetweeted &&
                    !shareMode &&
                    !rootItem?.isRead && (
                      <ThemedIcon
                        family="octicon"
                        name="dot-fill"
                        color={'primaryBackgroundColor'}
                        size={smallTextSize}
                      />
                    )}

                  <IntervalRefresh interval={60000} date={timestamp}>
                    {() => {
                      const dateText = getDateSmallText(timestamp)
                      if (!dateText) return null

                      return (
                        <>
                          <Text>{'  '}</Text>
                          <Link
                            analyticsCategory="card_action"
                            analyticsLabel={'card_link'}
                            enableUnderlineHover
                            href={link}
                            textProps={{
                              color: 'foregroundColorMuted65',
                              style: { fontSize: smallTextSize },
                            }}
                          >
                            <ThemedText
                              color="foregroundColorMuted65"
                              numberOfLines={1}
                              style={[
                                styles.timestampText,
                                largeMode && sharedStyles.largeText,
                              ]}
                              {...Platform.select({
                                web: { title: getFullDateText(timestamp) },
                              })}
                            >
                              {dateText.toLowerCase()}
                            </ThemedText>
                          </Link>
                        </>
                      )
                    }}
                  </IntervalRefresh>
                  {!shouldHideActions() && (
                    <>
                      {supportFastScreenshot && (
                        <ThemedIcon
                          family="material"
                          name={isCapturingView ? 'camera' : 'camera-alt'}
                          color={'foregroundColorMuted65'}
                          size={smallTextSize}
                          style={styles.actionIcon}
                          onPress={handleClickCamera}
                        />
                      )}
                      <ThemedIcon
                        family="material"
                        name={'share'}
                        color={'foregroundColorMuted65'}
                        size={smallTextSize}
                        style={styles.actionIcon}
                        onPress={routeToSharedPostPage}
                      />
                      <ThemedIcon
                        family="octicon"
                        name={isSaved ? 'bookmark-fill' : 'bookmark'}
                        color={isSaved ? 'orange' : 'foregroundColorMuted65'}
                        size={smallTextSize}
                        style={styles.actionIcon}
                        onPress={() => {
                          dispatch(
                            setItemSavedStatus({
                              itemNodeId: nodeIdOrId,
                              save: !isSaved,
                            }),
                          )
                        }}
                      />
                    </>
                  )}
                </View>
              </View>

              {/* Render Non Header part of the card */}
              <View>
                <View style={[sharedStyles.vertical]}>
                  {hasTitle && (
                    <View
                      style={[
                        sharedStyles.horizontal,
                        sharedStyles.marginVerticalQuarter,
                      ]}
                    >
                      <View
                        style={[
                          sharedStyles.flex,
                          sharedStyles.alignSelfCenter,
                        ]}
                      >
                        <View
                          style={sharedStyles.horizontalAndVerticallyAligned}
                        >
                          <ThemedText
                            color="foregroundColor"
                            style={[
                              styles.title,
                              sharedStyles.flex,
                              largeMode && sharedStyles.extraLargeText,
                            ]}
                            onPress={() =>
                              link &&
                              Linking.openURL(
                                link.startsWith('http') ||
                                  link.startsWith('https')
                                  ? link
                                  : `http://${link}`,
                              )
                            }
                          >
                            {title}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  )}

                  {hasText && (
                    <View
                      style={[
                        sharedStyles.horizontal,
                        sharedStyles.marginTopQuarter,
                      ]}
                    >
                      <View
                        style={[
                          sharedStyles.flex,
                          sharedStyles.alignSelfCenter,
                        ]}
                      >
                        <View
                          style={sharedStyles.horizontalAndVerticallyAligned}
                        >
                          <ThemedText
                            color="foregroundColorMuted65"
                            style={largeMode && sharedStyles.extraLargeText}
                            numberOfLines={9999}
                          >
                            {getTextComponentToShow(text)}
                          </ThemedText>
                        </View>
                        {!shareMode && hasMore && !hasThread && (
                          <View
                            style={[
                              sharedStyles.horizontalAndVerticallyAligned,
                              styles.marginTop6,
                            ]}
                          >
                            <ThemedText
                              color="primaryBackgroundColor"
                              onPress={toggleShowMoreText}
                              style={[
                                styles.showMoreOrLessText,
                                sharedStyles.flex,
                              ]}
                            >
                              {textShown ? 'show less' : 'show more'}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* {!isRetweeted && tags && tags.length > 0 && (
            <ButtonGroup data={tags.map((tag) => ({ id: tag, name: tag }))} />
          )} */}

                  {images.length > 0 && (
                    <View style={[styles.fileContainer]}>
                      {images.map((image, i) => {
                        return (
                          <TouchableHighlight
                            onPress={() => {
                              setImageIndexToView(i)
                            }}
                            key={image.id}
                          >
                            <Image
                              source={{
                                uri: image.url,
                              }}
                              style={{
                                width: (shareMode ? 80 : 60) * scaleFactor,
                                height: (shareMode ? 80 : 60) * scaleFactor,
                                margin: (shareMode ? 4 : 2) * scaleFactor,
                              }}
                              resizeMode="cover"
                            />
                          </TouchableHighlight>
                        )
                      })}
                    </View>
                  )}

                  {files.length > 0 && (
                    <View style={[styles.fileContainer]}>
                      {files.map((file) => {
                        return <FileDownloader key={file.id} file={file} />
                      })}
                    </View>
                  )}

                  {!!repostedFrom && (
                    <View>
                      <Spacer height={sizes.verticalSpaceSize} />
                      <BaseCard
                        {...repostedFrom}
                        columnId={columnId}
                        isRetweeted={true}
                        showMoreSignal={showMoreSignal}
                        defaultExpand={shouldExpand}
                        shareMode={shareMode}
                      />
                    </View>
                  )}

                  {!isRetweeted &&
                    !!duplicateIds &&
                    duplicateIds.length > 0 &&
                    !isCapturingView && (
                      <View style={[styles.deduplicationBarContainer]}>
                        {renderDeduplicationBar()}
                      </View>
                    )}

                  <Spacer height={sizes.verticalSpaceSize} />
                  {/* 
        {!!renderCardActions && !isRetweeted && (
          <>
            <CardActions
              commentsCount={
                undefined
                // issueOrPullRequest ? issueOrPullRequest.comments : undefined
              }
              commentsLink={link}
              isRead={!!isRead}
              isSaved={!!isSaved}
              itemNodeId={nodeIdOrId}
              type={type}
            />

            <Spacer height={sizes.verticalSpaceSize} />
          </>
        )} */}
                </View>
              </View>
            </View>
          </View>

          {(hasThread || !!setThreadVisibility) && (
            <View style={[styles.innerContainer]}>
              <View style={[sharedStyles.horizontal]}>
                <View style={[sharedStyles.horizontalAndVerticallyAligned]}>
                  <ThemedText
                    color="primaryBackgroundColor"
                    onPress={() => {
                      !!setThreadVisibility
                        ? setThreadVisibility()
                        : setShowThread(!showThread)
                    }}
                    style={[styles.showMoreOrLessText, sharedStyles.flex]}
                  >
                    {!!setThreadVisibility ? 'show thread' : 'hide thread'}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {!isRetweeted &&
            showDuplication &&
            duplicateIds?.map((id, idx) => (
              <View
                key={`duplication-card-${nodeIdOrId}-${id}`}
                style={
                  idx === 0
                    ? {
                        shadowRadius: 10,
                        shadowColor: theme.foregroundColorMuted40,
                      }
                    : {
                        borderTopColor: theme.backgroundColorTransparent05,
                        borderTopWidth: 1 * scaleFactor,
                      }
                }
              >
                <BaseCard
                  columnId={columnId}
                  nodeIdOrId={id}
                  isRetweeted={true}
                  type="COLUMN_TYPE_NEWS_FEED"
                />
              </View>
            ))}
        </TouchableOpacity>
      </View>
    )
  }

  return hasThread
    ? showThread
      ? renderBaseCard()
      : renderBaseCardSummary()
    : renderBaseCard()
})

BaseCard.displayName = 'BaseCard'
