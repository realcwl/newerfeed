import { Column, NewsFeedData } from '@devhub/core'
import React, { useCallback, useMemo } from 'react'
import { View, ViewProps } from 'react-native'
import { useDispatch } from 'react-redux'

import { useCardsKeyboard } from '../../hooks/use-cards-keyboard'
import { DataItemT, useCardsProps } from '../../hooks/use-cards-props'
import { BlurView } from '../../libs/blur-view/BlurView'
import { ErrorBoundary } from '../../libs/bugsnag'
import { OneList, OneListProps } from '../../libs/one-list'
import { sharedStyles } from '../../styles/shared'
import { SCROLL_WAIT_MS } from '../../utils/constants'
import { Separator } from '../common/Separator'
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

  const dispatch = useDispatch()
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
    firstVisibleItemId,
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

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (firstVisibleItemId) {
      timer = setTimeout(() => {
        const from = visibleItemIndexesRef.current.from
        const to = visibleItemIndexesRef.current.to
        const index = data.findIndex((item) => item === firstVisibleItemId)
        if (index < 0) {
          console.error(
            'lastVisitedItem not found in data: ',
            firstVisibleItemId,
          )
          return
        }
        if (listRef.current == null) {
          console.error("column's listRef is invalid")
          return
        }
        if (index < from || index > to) {
          listRef.current?.scrollToIndex(index)
        } else {
          console.log(
            `target index ${index} is already between ${from} and ${to}`,
          )
        }
      }, SCROLL_WAIT_MS) // give cards some time for layout
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const renderItem = useCallback<
    NonNullable<OneListProps<DataItemT>['renderItem']>
  >(
    ({ item: nodeIdOrId, index }) => {
      if (swipeable) {
        return (
          <View style={{ flex: 1 }}>
            <ErrorBoundary>
              <SwipeableCard
                type="COLUMN_TYPE_NEWS_FEED"
                columnId={columnId}
                nodeIdOrId={nodeIdOrId}
              />
            </ErrorBoundary>
          </View>
        )
      }
      return (
        <View style={{ flex: 1 }}>
          <ErrorBoundary>
            <NewsFeedCard nodeIdOrId={nodeIdOrId} columnId={columnId} />
          </ErrorBoundary>
        </View>
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
            clearMessage="No saved post"
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
          clearMessage="No new feed"
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
        footer={footer}
        forceRerenderOnRefChange={getItemByNodeIdOrId}
        getItemKey={getItemKey}
        onReachingListEnd={() => {
          if (fetchNextPage) fetchNextPage()
        }}
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
