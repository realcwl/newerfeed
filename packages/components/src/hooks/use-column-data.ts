import { ColumnFilter, NewsFeedData } from '@devhub/core'
import _ from 'lodash'
import { useCallback, useMemo, useRef } from 'react'

import * as selectors from '../redux/selectors'
import { EMPTY_ARRAY } from '../utils/constants'
import { useColumn } from './use-column'
import { usePreviousRef } from './use-previous-ref'
import { useReduxState } from './use-redux-state'

// A match is considered as query string is a substring of either title or text.
function dataMatchesQuery(data: NewsFeedData, query: string): boolean {
  if (!query) return true
  return (
    (!!data.text && data.text.includes(query)) ||
    (!!data.title && data.title.includes(query))
  )
}

// The core matching function, for now it matches by text
function dataMatchesFilters(
  data: NewsFeedData,
  filters: ColumnFilter,
): boolean {
  const { query } = filters
  if (!!query && !dataMatchesQuery(data, query)) {
    console.log(query)
    return false
  }
  return true
}

export function useColumnData<ItemT extends NewsFeedData>(
  columnId: string,
  {
    mergeSimilar,
  }: {
    mergeSimilar?: boolean
  } = {},
) {
  const columnDataSelector = useMemo(selectors.createColumnDataSelector, [
    columnId,
  ])

  const { column, dashboardFromUsername, hasCrossedColumnsLimit } =
    useColumn(columnId)

  const dataByNodeIdOrId = useReduxState(selectors.dataByNodeIdOrId)

  const _allItemsIds = useReduxState((state) => {
    if (!(column && column.id)) return EMPTY_ARRAY
    return columnDataSelector(state, column.id)
  })

  const allItemsIds = useMemo(() => _allItemsIds, [_allItemsIds.join(',')])

  const filteredItemsIds = useMemo(() => {
    const filters = column?.filters
    if (!filters) return allItemsIds
    return allItemsIds.filter((id) => {
      const data = dataByNodeIdOrId[id]
      return dataMatchesFilters(data, filters)
    })
  }, [
    allItemsIds,
    column && column.filters,
    column && column.type,
    hasCrossedColumnsLimit,
    mergeSimilar,
    dashboardFromUsername,
  ])

  const previousDataByNodeIdOrIdRef = usePreviousRef(dataByNodeIdOrId)
  const getItemByNodeIdOrIdChangeCountRef = useRef(0)
  useMemo(() => {
    const changed = filteredItemsIds.some(
      (id) =>
        !previousDataByNodeIdOrIdRef.current ||
        previousDataByNodeIdOrIdRef.current[id] !== dataByNodeIdOrId[id],
    )
    if (changed)
      getItemByNodeIdOrIdChangeCountRef.current =
        getItemByNodeIdOrIdChangeCountRef.current + 1
  }, [dataByNodeIdOrId, filteredItemsIds])

  const getItemByNodeIdOrId = useCallback(
    (nodeIdOrId: string) => {
      return (dataByNodeIdOrId[nodeIdOrId] && dataByNodeIdOrId[nodeIdOrId]!) as
        | ItemT
        | undefined
    },
    [getItemByNodeIdOrIdChangeCountRef.current],
  )

  return useMemo(
    () => ({
      allItemsIds,
      filteredItemsIds,
      getItemByNodeIdOrId,
      hasCrossedColumnsLimit,
    }),
    [
      allItemsIds,
      filteredItemsIds,
      getItemByNodeIdOrId,
      hasCrossedColumnsLimit,
    ],
  )
}
