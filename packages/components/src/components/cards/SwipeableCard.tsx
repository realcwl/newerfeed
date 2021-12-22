import React, { useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { useItem } from '../../hooks/use-item'
import { SwipeableRow } from '../../libs/swipeable'
import * as actions from '../../redux/actions'
import { useTheme } from '../context/ThemeContext'
import { CardWithLink, CardWithLinkProps } from './CardWithLink'

export type SwipeableCardProps = CardWithLinkProps

export function SwipeableCard(props: CardWithLinkProps) {
  const { columnId, nodeIdOrId, type } = props

  const swipeableRef = useRef<SwipeableRow>(null)
  const theme = useTheme()
  const dispatch = useDispatch()
  const item = useItem(nodeIdOrId)
  if (!item) return null

  const isRead = item.isRead
  const isSaved = item.isSaved

  function handleMarkAsReadOrUnread() {
    if (!item) return null
    dispatch(
      actions.setItemsReadStatus({
        itemNodeIds: [item.id],
        read: !isRead,
        syncup: true,
      }),
    )
  }

  function handleSave() {
    if (!item) return null
    dispatch(
      actions.setItemSavedStatus({
        itemNodeId: item.id,
        save: !isSaved,
      }),
    )
  }

  const Content = useMemo(
    () => <CardWithLink {...props} isInsideSwipeable />,
    [columnId, item, type],
  )

  return (
    <SwipeableRow
      ref={swipeableRef}
      leftActions={[
        {
          key: 'read',
          onPress: handleMarkAsReadOrUnread,
          ...(isRead
            ? {
                backgroundColor: theme.primaryBackgroundColor,
                foregroundColor: theme.primaryForegroundColor,
                icon: { family: 'octicons', name: 'eye-closed' },
                label: 'Unread',
                type: 'FULL',
              }
            : {
                backgroundColor: theme.backgroundColorDarker2,
                foregroundColor: theme.foregroundColor,
                icon: { family: 'octicons', name: 'eye' },
                label: 'Read',
                type: 'FULL',
              }),
        },
      ]}
      rightActions={[
        {
          key: 'bookmark',
          onPress: handleSave,
          backgroundColor: theme.orange,
          foregroundColor: theme.primaryForegroundColor,
          ...(isSaved
            ? {
                icon: { family: 'octicon', name: 'bookmark-slash-fill' },
                type: 'FULL',
                label: 'Unsave',
              }
            : {
                icon: { family: 'octicon', name: 'bookmark-fill' },
                type: 'FULL',
                label: 'Save',
              }),
        },
      ]}
    >
      {Content}
    </SwipeableRow>
  )
}
