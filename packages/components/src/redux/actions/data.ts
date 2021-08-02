import { createAction } from '../helpers'

export function favoriteItem(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user favorites or unfavorites, true for favorite.
  save: boolean
}) {
  return createAction('FAVORITE_ITEM', payload)
}

export function markItemAsRead(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user read this item or not
  read: boolean
}) {
  return createAction('MARK_ITEM_AS_READ', payload)
}
