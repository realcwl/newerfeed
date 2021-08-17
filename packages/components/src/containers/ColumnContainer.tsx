import React from 'react'

import { EventColumn } from '../components/columns/NewsFeedColumn'
import { useColumn } from '../hooks/use-column'
import { bugsnag } from '../libs/bugsnag'

export interface ColumnContainerProps {
  columnId: string
  pagingEnabled?: boolean
  swipeable: boolean
}

export const ColumnContainer = React.memo((props: ColumnContainerProps) => {
  const { columnId, pagingEnabled, swipeable } = props

  const { column, columnIndex, headerDetails } = useColumn(columnId)

  if (!(column && columnIndex >= 0 && headerDetails)) return null

  switch (column.type) {
    case 'COLUMN_TYPE_NEWS_FEED': {
      return (
        <EventColumn
          key={`event-column-${column.id}`}
          columnId={column.id}
          columnIndex={columnIndex}
          headerDetails={headerDetails}
          pagingEnabled={pagingEnabled}
          swipeable={swipeable}
        />
      )
    }

    default: {
      const message = `Invalid Column type: ${column && column.type}`
      console.error(message, { column })
      bugsnag.notify(new Error(message))
      return null
    }
  }
})

ColumnContainer.displayName = 'ColumnContainer'
