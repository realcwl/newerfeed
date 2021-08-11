import { createAction } from '../helpers'

export function updateFeeds(payload: {
  feeds: { id: string; posts: { id: string; title: string }[] }[]
}) {
  return createAction('UPDATE_FEEDS', payload)
}

export function markItemAsSaved(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user saves or unsaves, true for saves.
  save: boolean
}) {
  return createAction('MARK_ITEM_AS_SAVED', payload)
}

export function markItemAsRead(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user read this item or not
  read: boolean
}) {
  return createAction('MARK_ITEM_AS_READ', payload)
}
