import { createAction } from '../helpers'

export function fetchFeedsRequest(payload: {
  feeds: {
    id: string
  }[]
}) {
  return createAction('FETCH_FEEDS_REQUEST', payload)
}

export function fetchFeedsSuccess(payload: {
  feeds: {
    id: string
    posts: { id: string; title: string; content: string }[]
  }[]
}) {
  return createAction('FETCH_FEEDS_SUCCESS', payload)
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
