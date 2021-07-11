import { Column, ColumnCreation } from '../types'
import { guid } from './shared'
import immer from 'immer'

// Convert a list of ColumnCreation into standarlize Column reducer state.
export function normalizeColumns(
  columns: ColumnCreation[],
  updatedAt?: string,
) {
  const items = columns || []
  const byId: Record<string, Column | undefined> = {}

  const allIds = items.map((column: ColumnCreation) => {
    const id = column.id || guid()

    byId[id] = immer(column, (draft) => {
      draft.id = id
      draft.createdAt = column.createdAt || new Date().toISOString()
      draft.updatedAt = column.updatedAt || new Date().toISOString()
      draft.type = column.type
      draft.itemListIds = column.itemListIds
      draft.sources = column.sources
      draft.firstItemId = column.firstItemId
      draft.lastItemId = column.lastItemId
    }) as Column

    return id
  })

  return { allIds, byId, updatedAt: updatedAt || new Date().toISOString() }
}
