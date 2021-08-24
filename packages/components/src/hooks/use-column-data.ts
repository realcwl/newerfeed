import { NewsFeedData } from '@devhub/core'
import _ from 'lodash'
import { useCallback, useMemo, useRef } from 'react'

import * as selectors from '../redux/selectors'
import { EMPTY_ARRAY } from '../utils/constants'
import { getItemNodeIdOrId } from '../utils/helpers/shared'
import { useColumn } from './use-column'
import { usePreviousRef } from './use-previous-ref'
import { useReduxState } from './use-redux-state'

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
    return allItemsIds
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
