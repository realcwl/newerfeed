import { capitalizeFirstLetter, constants, NewsFeedData } from '@devhub/core'
import React, { useCallback } from 'react'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'

import { CardsSearchHeader } from '../components/cards/CardsSearchHeader'
import { EmptyCards } from '../components/cards/EmptyCards'
import {
  NewsFeedCards,
  EventCardsProps,
} from '../components/cards/NewsFeedCards'
import { GenericMessageWithButtonView } from '../components/cards/GenericMessageWithButtonView'
import { NoTokenView } from '../components/cards/NoTokenView'
import { Button } from '../components/common/Button'
import { ButtonLink } from '../components/common/ButtonLink'
import { Spacer } from '../components/common/Spacer'
import { useColumn } from '../hooks/use-column'
import { useColumnData } from '../hooks/use-column-data'
import { useReduxState } from '../hooks/use-redux-state'
import { useLoginHelpers } from '../components/context/LoginHelpersContext'
import * as selectors from '../redux/selectors'

export interface NewsFeedCardsContainerProps
  extends Omit<
    EventCardsProps,
    | 'column'
    | 'errorMessage'
    | 'fetchNextPage'
    | 'getItemByNodeIdOrId'
    | 'isShowingOnlyBookmarks'
    | 'itemNodeIdOrIds'
    | 'lastFetchSuccessAt'
    | 'refresh'
  > {
  columnId: string
}

export const NewsFeedCardsContainer = React.memo(
  (props: NewsFeedCardsContainerProps) => {
    const { columnId, ...otherProps } = props

    const { allItems, filteredItemsIds, getItemByNodeIdOrId } =
      useColumnData<NewsFeedData>(columnId, { mergeSimilar: false })

    const { isLoggingIn } = useLoginHelpers()

    const appToken = useReduxState(selectors.appTokenSelector)
    const { column, hasCrossedColumnsLimit } = useColumn(columnId)

    if (!column) return null

    return (
      <NewsFeedCards
        {...otherProps}
        key={`event-cards-${columnId}`}
        columnId={columnId}
        errorMessage={''}
        fetchNextPage={() => undefined}
        getItemByNodeIdOrId={getItemByNodeIdOrId}
        isShowingOnlyBookmarks={!!(column.filters && column.filters.saved)}
        itemNodeIdOrIds={[]}
        lastFetchSuccessAt={''}
        refresh={() => undefined}
      />
    )
  },
)

NewsFeedCardsContainer.displayName = 'NewsFeedCardsContainer'
