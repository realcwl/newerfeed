import { HeaderDetails } from '@devhub/core'
import React, { useMemo } from 'react'

import {
  NewsFeedCardsContainer,
  NewsFeedCardsContainerProps,
} from '../../containers/NewsFeedCardsContainer'
import { IconProp } from '../../libs/vector-icons'
import { ColumnRenderer, ColumnRendererProps } from './ColumnRenderer'

export interface EventColumnProps
  extends Omit<NewsFeedCardsContainerProps, 'ownerIsKnown' | 'repoIsKnown'> {
  columnIndex: number
  headerDetails: HeaderDetails
  pagingEnabled?: boolean
}

export const EventColumn = React.memo((props: EventColumnProps) => {
  const {
    columnId,
    columnIndex,
    headerDetails,
    pagingEnabled,
    pointerEvents,
    swipeable,
  } = props

  const Children = useMemo<ColumnRendererProps['children']>(
    () => (
      <NewsFeedCardsContainer
        key={`event-cards-container-${columnId}`}
        columnId={columnId}
        pointerEvents={pointerEvents}
        swipeable={swipeable}
      />
    ),
    [columnId, columnIndex, pointerEvents, swipeable],
  )

  if (!headerDetails) return null

  return (
    <ColumnRenderer
      key={`event-column-${columnId}-inner`}
      avatarImageURL={
        headerDetails.avatarProps && headerDetails.avatarProps.imageURL
      }
      avatarLinkURL={
        headerDetails.avatarProps && headerDetails.avatarProps.linkURL
      }
      columnId={columnId}
      columnType="COLUMN_TYPE_NEWS_FEED"
      columnIndex={columnIndex}
      icon={headerDetails.icon as IconProp}
      pagingEnabled={pagingEnabled}
      subtitle={headerDetails.subtitle}
      title={headerDetails.title}
    >
      {Children}
    </ColumnRenderer>
  )
})

EventColumn.displayName = 'EventColumn'
