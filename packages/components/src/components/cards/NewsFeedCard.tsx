import React from 'react'

import { CardWithLink } from './CardWithLink'

export interface EventCardProps {
  columnId: string
  nodeIdOrId: string
}

export const NewsFeedCard = React.memo((props: EventCardProps) => {
  const { columnId, nodeIdOrId } = props

  return (
    <CardWithLink
      type="COLUMN_TYPE_NEWS_FEED"
      nodeIdOrId={nodeIdOrId}
      columnId={columnId}
    />
  )
})

NewsFeedCard.displayName = 'NewsFeedCard'
