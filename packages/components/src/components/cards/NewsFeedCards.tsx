import { Column, NewsFeedData } from '@devhub/core'
import React, { useCallback, useMemo } from 'react'
import { View, ViewProps } from 'react-native'

import { useCardsKeyboard } from '../../hooks/use-cards-keyboard'
import { DataItemT, useCardsProps } from '../../hooks/use-cards-props'
import { useReduxState } from '../../hooks/use-redux-state'
import { BlurView } from '../../libs/blur-view/BlurView'
import { ErrorBoundary } from '../../libs/bugsnag'
import { OneList, OneListProps } from '../../libs/one-list'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { EmptyCards, EmptyCardsProps } from './EmptyCards'
import { NewsFeedCard } from './NewsFeedCard'
import { SwipeableCard } from './SwipeableCard'

type ItemT = NewsFeedData

export interface EventCardsProps {
  columnId: Column['id']
  errorMessage: EmptyCardsProps['errorMessage']
  fetchNextPage: (() => void) | undefined
  getItemByNodeIdOrId: (nodeIdOrId: string) => ItemT | undefined
  isShowingOnlyBookmarks: boolean
  itemNodeIdOrIds: string[]
  lastFetchSuccessAt: string | undefined
  pointerEvents?: ViewProps['pointerEvents']
  refresh: EmptyCardsProps['refresh']
  swipeable: boolean
}

export const NewsFeedCards = React.memo((props: EventCardsProps) => {
  const {
    columnId,
    errorMessage,
    fetchNextPage,
    getItemByNodeIdOrId,
    isShowingOnlyBookmarks,
    itemNodeIdOrIds,
    lastFetchSuccessAt,
    pointerEvents,
    refresh,
    swipeable,
  } = props

  const listRef = React.useRef<typeof OneList>(null)

  const getItemKey = useCallback(
    (nodeIdOrId: DataItemT, index: number) => {
      return `event-card-${nodeIdOrId || index}`
    },
    [getItemByNodeIdOrId],
  )

  const {
    OverrideRender,
    data,
    fixedHeaderComponent,
    footer,
    getItemSize,
    header,
    itemSeparator,
    onVisibleItemsChanged,
    refreshControl,
    safeAreaInsets,
    visibleItemIndexesRef,
  } = useCardsProps({
    columnId,
    fetchNextPage,
    getItemByNodeIdOrId,
    itemNodeIdOrIds,
    lastFetchSuccessAt,
    refresh,
    type: 'COLUMN_TYPE_NEWS_FEED',
  })

  useCardsKeyboard(listRef, {
    columnId,
    getItemByNodeIdOrId,
    itemNodeIdOrIds:
      OverrideRender && OverrideRender.Component && OverrideRender.overlay
        ? []
        : itemNodeIdOrIds,
    type: 'COLUMN_TYPE_NEWS_FEED',
    visibleItemIndexesRef,
  })

  const renderItem = useCallback<
    NonNullable<OneListProps<DataItemT>['renderItem']>
  >(
    ({ item: nodeIdOrId, index }) => {
      const height = getItemSize(nodeIdOrId, index)

      return (
        <ErrorBoundary>
          <View style={{ height }}>
            <NewsFeedCard nodeIdOrId={nodeIdOrId} columnId={columnId} />
          </View>
        </ErrorBoundary>
      )
    },
    [swipeable],
  )

  const ListEmptyComponent = useMemo<
    NonNullable<OneListProps<DataItemT>['ListEmptyComponent']>
  >(
    () => () => {
      if (OverrideRender && OverrideRender.Component && OverrideRender.overlay)
        return null

      if (isShowingOnlyBookmarks) {
        return (
          <EmptyCards
            clearEmoji="bookmark"
            clearMessage="No bookmarks matching your filters"
            columnId={columnId}
            disableLoadingIndicator
            errorMessage={errorMessage}
            fetchNextPage={fetchNextPage}
            refresh={refresh}
          />
        )
      }

      return (
        <EmptyCards
          clearMessage="No activity"
          columnId={columnId}
          disableLoadingIndicator={false}
          errorMessage={errorMessage}
          fetchNextPage={fetchNextPage}
          refresh={refresh}
        />
      )
    },
    [
      itemNodeIdOrIds.length ? undefined : columnId,
      itemNodeIdOrIds.length ? undefined : errorMessage,
      itemNodeIdOrIds.length ? undefined : fetchNextPage,
      itemNodeIdOrIds.length ? undefined : refresh,
      itemNodeIdOrIds.length ? undefined : isShowingOnlyBookmarks,
      itemNodeIdOrIds.length
        ? undefined
        : !!(
            OverrideRender &&
            OverrideRender.Component &&
            OverrideRender.overlay
          ),
    ],
  )

  if (OverrideRender && OverrideRender.Component && !OverrideRender.overlay)
    return <OverrideRender.Component />

  return (
    <View style={[sharedStyles.relative, sharedStyles.flex]}>
      {fixedHeaderComponent}

      <OneList
        ref={listRef}
        key="event-cards-list"
        ListEmptyComponent={ListEmptyComponent}
        containerStyle={
          OverrideRender && OverrideRender.Component && OverrideRender.overlay
            ? sharedStyles.superMuted
            : undefined
        }
        data={data}
        estimatedItemSize={getItemSize(data[0], 0) || 123}
        // footer={footer}
        forceRerenderOnRefChange={getItemByNodeIdOrId}
        getItemKey={getItemKey}
        getItemSize={getItemSize}
        header={header}
        horizontal={false}
        itemSeparator={itemSeparator}
        onVisibleItemsChanged={onVisibleItemsChanged}
        overscanCount={1}
        pointerEvents={
          OverrideRender && OverrideRender.Component && OverrideRender.overlay
            ? 'none'
            : pointerEvents
        }
        refreshControl={refreshControl}
        renderItem={renderItem}
        safeAreaInsets={safeAreaInsets}
      />

      {!!(
        OverrideRender &&
        OverrideRender.Component &&
        OverrideRender.overlay
      ) && (
        <BlurView intensity={8} style={sharedStyles.absoluteFill}>
          <OverrideRender.Component />
        </BlurView>
      )}
    </View>
  )
})

NewsFeedCards.displayName = 'NewsFeedCards'
