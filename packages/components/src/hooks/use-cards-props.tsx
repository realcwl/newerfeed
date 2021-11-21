import { Column, constants, getDateSmallText, NewsFeedData } from '@devhub/core'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useRef } from 'react'
import { Dimensions, View } from 'react-native'
import { useDispatch } from 'react-redux'

import {
  getCardPropsForItem,
  getCardSizeForProps,
} from '../components/cards/BaseCard.shared'
import {
  CardsFooter,
  CardsFooterProps,
  getCardsFooterSize,
} from '../components/cards/CardsFooter'
import {
  CardsOwnerFilterBar,
  cardsOwnerFilterBarTotalHeight,
} from '../components/cards/CardsOwnerFilterBar'
import { CardsSearchHeader } from '../components/cards/CardsSearchHeader'
import { EmptyCards } from '../components/cards/EmptyCards'
import { columnHeaderHeight } from '../components/columns/ColumnHeader'
import { ColumnLoadingIndicator } from '../components/columns/ColumnLoadingIndicator'
import { Button } from '../components/common/Button'
import { ButtonLink } from '../components/common/ButtonLink'
import { QuickFeedbackRow } from '../components/common/QuickFeedbackRow'
import { RefreshControl } from '../components/common/RefreshControl'
import { useAppLayout } from '../components/context/LayoutContext'
import { OneListProps } from '../libs/one-list'
import { useSafeArea } from '../libs/safe-area-view'
import { setColumnVisibleItems } from '../redux/actions'
import * as selectors from '../redux/selectors'
import { sharedStyles } from '../styles/shared'
import { useColumn } from './use-column'
import { useReduxState } from './use-redux-state'

export type DataItemT = string

export function useCardsProps<ItemT extends NewsFeedData>({
  columnId,
  fetchNextPage,
  getItemByNodeIdOrId,
  itemNodeIdOrIds,
  lastFetchSuccessAt,
  refresh,
  type,
}: {
  columnId: Column['id'] | undefined
  fetchNextPage: CardsFooterProps['fetchNextPage']
  getItemByNodeIdOrId: (nodeIdOrId: string) => ItemT | undefined
  itemNodeIdOrIds: string[] | undefined
  lastFetchSuccessAt: string | undefined
  refresh: CardsFooterProps['refresh']
  type: 'COLUMN_TYPE_NEWS_FEED'
}) {
  const visibleItemIndexesRef = useRef({ from: -1, to: -1 })

  const appSafeAreaInsets = useSafeArea()
  const { appOrientation } = useAppLayout()
  const { column, columnIndex, isOverMaxColumnLimit } = useColumn(
    columnId || '',
  )

  const dispatch = useDispatch()
  const appToken = useReduxState(selectors.appTokenSelector)

  const data: DataItemT[] = itemNodeIdOrIds || []
  const firstVisibleItemId = column?.firstVisibleItemId

  const getItemSize = useCallback<
    NonNullable<OneListProps<DataItemT>['getItemSize']>
  >(
    (nodeIdOrId) => {
      const item = getItemByNodeIdOrId(nodeIdOrId)
      if (!item) return 0

      const itemCardProps = getCardPropsForItem(type, columnId || '', item)
      if (!itemCardProps) return 0

      return getCardSizeForProps(itemCardProps)
    },
    [columnId, getCardSizeForProps, type],
  )

  const itemSeparator = undefined

  const fixedHeaderComponent = useMemo(
    () =>
      !!column && (
        <View style={[sharedStyles.relative, sharedStyles.fullWidth]}>
          <CardsSearchHeader
            key={`cards-search-header-column-${column.id}`}
            columnId={column.id}
          />

          <ColumnLoadingIndicator columnId={column.id} />
        </View>
      ),
    [column && column.id],
  )

  const header = useMemo<OneListProps<DataItemT>['header']>(() => {
    const renderOwnerFilterBar = false

    const size = column
      ? renderOwnerFilterBar
        ? cardsOwnerFilterBarTotalHeight
        : 0
      : 0

    return {
      size,
      sticky: false,
      Component() {
        return (
          <View style={[sharedStyles.fullWidth, { height: size }]}>
            {!!column && (
              <>
                {!!renderOwnerFilterBar && (
                  <CardsOwnerFilterBar
                    key={`cards-owner-filter-bar-column-${column.id}`}
                    columnId={column.id}
                  />
                )}
              </>
            )}
          </View>
        )
      },
    }
  }, [column && column.id, column && column.type, !!(data || []).length])

  const cardsFooterProps: CardsFooterProps = {
    clearedAt: 'DUMMY_CLEAR_AT',
    columnId: (column && column.id)!,
    fetchNextPage,
    isEmpty: !((data || []).length > 0),
    refresh,
    topSpacing: (!data.length && header && header.size) || 0,
  }

  let _tempTotalOffset = 0
  const sticky = !!(
    !fetchNextPage &&
    cardsFooterProps.clearedAt &&
    itemNodeIdOrIds &&
    !itemNodeIdOrIds.some((nodeIdOrId, index) => {
      const itemSize = getItemSize(nodeIdOrId, index)
      if (!itemSize) return

      _tempTotalOffset += itemSize

      if (
        _tempTotalOffset >
        Dimensions.get('window').height -
          ((header && header.size) || 0) -
          columnHeaderHeight
      ) {
        return true
      }
    })
  )

  const footer = useMemo<OneListProps<DataItemT>['footer']>(() => {
    if (isOverMaxColumnLimit) return undefined

    return {
      size: getCardsFooterSize({
        clearedAt: cardsFooterProps.clearedAt,
        hasFetchNextPage: !!cardsFooterProps.fetchNextPage,
        isEmpty: cardsFooterProps.isEmpty,
        topSpacing: cardsFooterProps.topSpacing,
      }),
      sticky,
      Component() {
        return <CardsFooter {...cardsFooterProps} />
      },
    }
  }, [
    (!data.length && header && header.size) || 0,
    cardsFooterProps.clearedAt,
    cardsFooterProps.columnId,
    cardsFooterProps.fetchNextPage,
    cardsFooterProps.isEmpty,
    cardsFooterProps.refresh,
    isOverMaxColumnLimit,
    sticky,
  ])

  const safeAreaInsets: OneListProps<DataItemT>['safeAreaInsets'] = useMemo(
    () => ({
      bottom: appOrientation === 'landscape' ? appSafeAreaInsets.bottom : 0,
    }),
    [appOrientation, appSafeAreaInsets.bottom],
  )

  const onVisibleItemsChanged = useCallback<
    NonNullable<OneListProps<DataItemT>['onVisibleItemsChanged']>
  >(
    (from, to) => {
      visibleItemIndexesRef.current = { from, to }
      dispatch(
        setColumnVisibleItems({
          columnId,
          firstVisibleItemId: data[from],
          lastVisibleItemId: data[to],
        }),
      )
    },
    [data],
  )

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        intervalRefresh={lastFetchSuccessAt}
        onRefresh={refresh}
        refreshing={false}
        title={
          lastFetchSuccessAt
            ? `Last updated ${getDateSmallText(lastFetchSuccessAt, {
                includeExactTime: true,
              })}`
            : 'Pull to refresh'
        }
      />
    ),
    [lastFetchSuccessAt, refresh],
  )

  const OverrideRender = useMemo<{
    Component: React.ComponentType | undefined
    overlay?: boolean
  }>(() => {
    if (!(column && column.id)) return { Component: undefined, overlay: false }

    if (isOverMaxColumnLimit) {
      return {
        Component() {
          return (
            <EmptyCards
              columnId={column.id}
              errorMessage={`You have reached the limit of ${constants.COLUMNS_LIMIT} columns. This is to maintain a healthy usage of the GitHub API.`}
              errorTitle="Too many columns"
              fetchNextPage={undefined}
              loadState="error"
              refresh={undefined}
            />
          )
        },
        overlay: false,
      }
    }

    return { Component: undefined, overlay: false }
  }, [column && column.id, columnIndex, isOverMaxColumnLimit, appToken])

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  )
}
