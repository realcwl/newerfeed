import {
  NewsFeedColumnType,
  constants,
  AddColumnDetailsPayload,
} from '@devhub/core'
import { rgba } from 'polished'
import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { View } from 'react-native'
import { useSpring } from '@react-spring/native'

import { useHover } from '../../hooks/use-hover'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import { IconProp } from '../../libs/vector-icons'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  normalTextSize,
  scaleFactor,
} from '../../styles/variables'
import { getDefaultReactSpringAnimationConfig } from '../../utils/helpers/animations'
import { SpringAnimatedTouchableOpacity } from '../animated/spring/SpringAnimatedTouchableOpacity'
import { ModalColumn } from '../columns/ModalColumn'
import { H2 } from '../common/H2'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { useTheme } from '../context/ThemeContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'

export interface AddColumnModalProps {
  showBackButton: boolean
}

const columnTypes: {
  title: string
  type: NewsFeedColumnType
  icon: IconProp
  items: {
    payload: AddColumnDetailsPayload
  }[]
  soon?: boolean
  soonLink?: string
}[] = [
  {
    title: 'News',
    type: 'COLUMN_TYPE_NEWS_FEED',
    icon: { family: 'octicon', name: 'bell' },
    items: [
      {
        payload: {
          icon: { family: 'octicon', name: 'rss' },
          title: 'News',
        },
      },
    ],
  },
]

function AddColumnModalItem({
  disabled,
  icon,
  payload,
  title,
}: {
  disabled?: boolean
  icon: IconProp
  payload: any
  title: string
}) {
  const cacheRef = useRef({
    isHovered: false,
    isPressing: false,
  })

  const theme = useTheme()

  const touchableRef = useRef(null)
  const initialIsHovered = useHover(touchableRef, (isHovered) => {
    if (cacheRef.current.isHovered === isHovered) return
    cacheRef.current.isHovered = isHovered
    updateStyles()
  })
  cacheRef.current.isHovered = initialIsHovered

  const pushModal = useReduxAction(actions.pushModal)

  const getStyles = useCallback(() => {
    const { isHovered, isPressing } = cacheRef.current

    const immediate = constants.DISABLE_ANIMATIONS || isHovered

    return {
      config: getDefaultReactSpringAnimationConfig(),
      immediate,
      backgroundColor:
        (isHovered || isPressing) && !disabled
          ? theme.backgroundColorLess1
          : rgba(theme.backgroundColor, 0),
    }
  }, [disabled, theme])

  const [springAnimatedStyles, setSpringAnimatedStyles] = useSpring(getStyles)

  const updateStyles = useCallback(() => {
    setSpringAnimatedStyles(getStyles())
  }, [getStyles])

  const isFirstRendeRef = useRef(true)
  useLayoutEffect(() => {
    if (isFirstRendeRef.current) {
      isFirstRendeRef.current = false
      return
    }

    updateStyles()
  }, [updateStyles])

  return (
    <SpringAnimatedTouchableOpacity
      ref={touchableRef}
      activeOpacity={Platform.supportsTouch ? 1 : undefined}
      disabled={disabled || !payload}
      onPress={
        payload
          ? () => {
              console.log('what', payload)
              pushModal({
                name: 'ADD_COLUMN_DETAILS',
                params: {
                  columnId: payload.feedId,
                },
              })
            }
          : undefined
      }
      onPressIn={() => {
        if (!Platform.supportsTouch) return

        cacheRef.current.isPressing = true
        updateStyles()
      }}
      onPressOut={() => {
        if (!Platform.supportsTouch) return

        cacheRef.current.isPressing = false
        updateStyles()
      }}
      style={[sharedStyles.flex, springAnimatedStyles]}
    >
      <View
        style={[
          sharedStyles.flex,
          sharedStyles.horizontal,
          sharedStyles.alignItemsCenter,
          {
            padding: contentPadding,
          },
        ]}
      >
        <ThemedIcon
          {...icon}
          color="foregroundColor"
          size={18 * scaleFactor}
          style={{ width: 20 * scaleFactor }}
        />

        <Spacer width={contentPadding / 2} />

        <ThemedText color="foregroundColor">{title}</ThemedText>
      </View>
    </SpringAnimatedTouchableOpacity>
  )
}

export function AddColumnModal(props: AddColumnModalProps) {
  const { showBackButton } = props

  const columnIds = useReduxState(selectors.columnIdsSelector)
  const sharedFeeds = useReduxState(selectors.sharedFeedsSelector)

  const publicFeedsColumn = {
    title: 'PUBLIC FEEDS',
    type: 'COLUMN_TYPE_NEWSFEED' as NewsFeedColumnType,
    icon: { family: 'octicon', name: 'bell' } as IconProp,
    items: sharedFeeds.map((feed) => {
      return {
        payload: {
          icon: { family: 'octicon', name: 'rss' } as IconProp,
          title: feed.title,
          feedId: feed.id,
        } as AddColumnDetailsPayload,
      }
    }),
  }

  if (!columnTypes.find((c) => c.title === 'PUBLIC FEEDS')) {
    columnTypes.push(publicFeedsColumn)
  }

  const hasReachedColumnLimit = columnIds.length >= constants.COLUMNS_LIMIT

  return (
    <ModalColumn
      name="ADD_COLUMN"
      showBackButton={showBackButton}
      title="Add Column"
    >
      <>
        {columnTypes.map((group, groupIndex) => (
          <View key={`add-column-header-group-${groupIndex}`}>
            <SubHeader muted={group.soon} title={group.title}>
              {!!group.soon && (
                <Link
                  analyticsLabel={`add-column-${group.title}-soon`}
                  href={group.soonLink}
                >
                  <H2 muted withMargin={false} style={sharedStyles.flex}>
                    {group.soonLink && group.soonLink.includes('beta')
                      ? ' (beta)'
                      : ' (soon)'}
                  </H2>
                </Link>
              )}
            </SubHeader>

            <View style={sharedStyles.flex}>
              {group.items.map((item, itemIndex) => (
                <AddColumnModalItem
                  key={`add-column-button-group-${groupIndex}-item-${itemIndex}`}
                  disabled={
                    hasReachedColumnLimit || !item.payload || group.soon
                  }
                  icon={
                    item.payload
                      ? (item.payload.icon as IconProp)
                      : { family: 'octicon', name: 'mark-github' }
                  }
                  payload={item.payload}
                  title={item.payload ? item.payload.title : 'Not available'}
                />
              ))}
            </View>

            {groupIndex < columnTypes.length - 1 && (
              <>
                <Spacer height={contentPadding / 2} />
                <Separator leftOffset={contentPadding} horizontal />
                <Spacer height={contentPadding / 2} />
              </>
            )}
          </View>
        ))}

        <Spacer flex={1} minHeight={contentPadding} />

        {!!hasReachedColumnLimit && (
          <>
            <ThemedText
              color="foregroundColorMuted65"
              style={[
                sharedStyles.textCenter,
                {
                  marginTop: contentPadding,
                  paddingHorizontal: contentPadding,
                  lineHeight: normalTextSize * 1.5,
                  fontSize: normalTextSize,
                },
              ]}
            >
              {`You have reached the limit of ${constants.COLUMNS_LIMIT} columns. This is to maintain a healthy usage of the GitHub API.`}
            </ThemedText>

            <Spacer height={contentPadding} />
          </>
        )}
      </>
    </ModalColumn>
  )
}
