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

export const columnIdsSelector = (state: RootState) =>
  s(state).allIds || EMPTY_ARRAY

export const columnCountSelector = (state: RootState) =>
  columnIdsSelector(state).length

export const columnsArrSelector = createShallowEqualSelector(
  (state: RootState) => s(state).byId,
  (state: RootState) => columnIdsSelector(state),
  (byId, columnIds) => {
    if (!(byId && columnIds)) return EMPTY_ARRAY
    return columnIds
      .map((columnId) => byId[columnId])
      .filter(Boolean) as Column[]
  },
)

export const hasCreatedColumnSelector = (state: RootState) =>
  s(state).byId !== null

// TODO(chenweilunster): Implement this function.
export const createColumnDataSelector = () => {
  return (state: RootState, columnId: string) => {
    return []
  }
}
