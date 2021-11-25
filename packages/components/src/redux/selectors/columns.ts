import { Column } from '@devhub/core'

import { EMPTY_ARRAY, EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'
import { betterMemoize, createShallowEqualSelector } from './helpers'
import { createSelector } from 'reselect'

const s = (state: RootState) => state.columns || EMPTY_OBJ

export const columnSelector = (state: RootState, columnId: string) => {
  if (!columnId) return

  const byId = s(state).columnById
  return (byId && byId[columnId]) || undefined
}

export const columnsWithRefreshTimeAndNotifySettingSelector = (
  state: RootState,
) => {
  const result: {
    id: string
    refreshedAt: string
    notifyOnNewPosts: boolean
  }[] = []
  const byId: Record<string, Column> = s(state).columnById
  const allIds: string[] = s(state).allColumnIds

  for (const columnId of allIds) {
    result.push({
      id: columnId,
      refreshedAt: byId[columnId].refreshedAt,
      notifyOnNewPosts: byId[columnId].options?.notifyOnNewPosts ?? false,
    })
  }

  return result
}

export const columnIdsSelector = (state: RootState) =>
  s(state).allColumnIds || EMPTY_ARRAY

export const sharedFeedsSelector = (state: RootState) =>
  s(state).sharedColumnIds.map((id) => s(state).columnById[id]) || EMPTY_ARRAY

export const columnCountSelector = (state: RootState) =>
  columnIdsSelector(state).length

export const columnsArrSelector = createShallowEqualSelector(
  (state: RootState) => s(state).columnById,
  (state: RootState) => columnIdsSelector(state),
  (byId, columnIds) => {
    if (!(byId && columnIds)) return EMPTY_ARRAY
    return columnIds.map((columnId) => byId[columnId]).filter(Boolean)
  },
)

export const hasCreatedColumnSelector = (state: RootState) =>
  s(state).columnById !== null

export const createColumnDataSelector = () => {
  return (state: RootState, columnId: string) => {
    const column = columnSelector(state, columnId)
    if (!column) return []
    return column.itemListIds
  }
}

export const dataByNodeIdOrId = (state: RootState) => s(state).dataById

export const dataSavedIds = (state: RootState) => s(state).savedDataIds

// only be used in a single instance of a single component
// https://react-redux.js.org/api/hooks#useselector-examples
export const dataLoadingSelector = createSelector(
  (state: RootState) => s(state).loadingDataId,
  (_: RootState, id: string) => id,
  (loadingId, id) => loadingId === id,
)

export const viewCapturingItemNodeIdSelector = (state: RootState) =>
  s(state).viewCapturingItemNodeId
