import React from 'react'
import { View } from 'react-native'

import { useDispatch } from 'react-redux'
import { Platform } from '../../../libs/platform'
import * as actions from '../../../redux/actions'
import { sharedStyles } from '../../../styles/shared'
import { ThemedIcon } from '../../themed/ThemedIcon'
import {
  contentPadding,
  scaleFactor,
  smallerTextSize,
} from '../../../styles/variables'
import { Link } from '../../common/Link'
import { Spacer } from '../../common/Spacer'
import { sizes } from '../BaseCard.shared'

export interface CardActionsProps {
  commentsCount: number | undefined
  commentsLink: string | undefined
  isRead: boolean
  isSaved: boolean
  itemNodeId: string
  leftSpacing?: number
  // muted?: boolean
  rightSpacing?: number
  type: 'COLUMN_TYPE_NEWS_FEED'
}

export const cardActionsHeight = smallerTextSize + 3 * scaleFactor

export function CardActions(props: CardActionsProps) {
  const {
    commentsCount,
    commentsLink,
    isRead,
    isSaved,
    itemNodeId,
    leftSpacing = sizes.avatarContainerWidth + sizes.horizontalSpaceSize,
    rightSpacing = 0,
    type,
  } = props

  const muted = false

  const dispatch = useDispatch()

  return (
    <View style={sharedStyles.horizontal}>
      {/* {leftSpacing > 0 && <Spacer width={leftSpacing} />} */}

      <Link
        analyticsCategory="card_action"
        analyticsLabel={isSaved ? 'unsave_for_later' : 'save_for_later'}
        enableUnderlineHover
        hitSlop={{
          top: 2,
          bottom: 2,
          left: contentPadding / 4,
          right: contentPadding / 4,
        }}
        onPress={() => {
          dispatch(
            actions.setItemSavedStatus({
              itemNodeId: itemNodeId,
              save: !isSaved,
            }),
          )
        }}
        textProps={{
          color: muted ? 'foregroundColorMuted40' : 'foregroundColorMuted65',
          style: {
            lineHeight: smallerTextSize + 3 * scaleFactor,
            fontSize: smallerTextSize,
          },
        }}
      >
        {isSaved ? 'saved' : 'save'}
      </Link>

      <Spacer width={contentPadding / 2} />

      <Link
        analyticsCategory="card_action"
        analyticsLabel={isRead ? 'mark_as_unread' : 'mark_as_read'}
        enableUnderlineHover
        hitSlop={{
          top: 2,
          bottom: 2,
          left: contentPadding / 4,
          right: contentPadding / 4,
        }}
        onPress={() => {
          dispatch(
            actions.setItemsReadStatus({
              itemNodeIds: [itemNodeId],
              read: !isRead,
              syncup: true,
            }),
          )
        }}
        textProps={{
          color: muted ? 'foregroundColorMuted40' : 'foregroundColorMuted65',
          style: { fontSize: smallerTextSize },
        }}
      >
        {isRead ? 'mark as unread' : 'mark as read'}
      </Link>

      <Spacer width={contentPadding / 2} />

      {!!commentsLink && (
        <>
          <ThemedIcon
            family={'material'}
            name={'link'}
            color={muted ? 'foregroundColorMuted40' : 'foregroundColorMuted65'}
          />
          <Link
            analyticsCategory="card_action"
            analyticsLabel={'card_link'}
            enableUnderlineHover
            hitSlop={{
              top: 2,
              bottom: 2,
              left: contentPadding / 4,
              right: contentPadding / 4,
            }}
            href={commentsLink}
            textProps={{
              color: muted
                ? 'foregroundColorMuted40'
                : 'foregroundColorMuted65',
              style: { fontSize: smallerTextSize },
            }}
          >
            {'link'}
          </Link>
        </>
      )}

      {rightSpacing > 0 && <Spacer width={rightSpacing} />}
    </View>
  )
}
