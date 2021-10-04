import { Column } from '@devhub/core'

import { EMPTY_ARRAY, EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'
import { betterMemoize, createShallowEqualSelector } from './helpers'

const s = (state: RootState) => state.columns || EMPTY_OBJ

export const columnSelector = (state: RootState, columnId: string) => {
  if (!columnId) return

  const byId = s(state).byId
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
  const byId: Record<string, Column> = s(state).byId
  for (const columnId in byId) {
    result.push({
      id: columnId,
      refreshedAt: byId[columnId].refreshedAt,
      notifyOnNewPosts: byId[columnId].options.notifyOnNewPosts ?? false,
    })
  }
  return result
}

export const columnIdsSelector = (state: RootState) =>
  s(state).allIds || EMPTY_ARRAY

export const columnCountSelector = (state: RootState) =>
  columnIdsSelector(state).length

export const columnsArrSelector = createShallowEqualSelector(
  (state: RootState) => s(state).byId,
  (state: RootState) => columnIdsSelector(state),
  (byId, columnIds) => {
    if (!(byId && columnIds)) return EMPTY_ARRAY
    return columnIds.map((columnId) => byId[columnId]).filter(Boolean)
  },
)

export const hasCreatedColumnSelector = (state: RootState) =>
  s(state).byId !== null

export const createColumnDataSelector = () => {
  return (state: RootState, columnId: string) => {
    const column = columnSelector(state, columnId)
    if (!column) return []
    return column.itemListIds
  }
}
