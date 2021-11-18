import { NewsFeedData } from '@devhub/core'
import { createAction } from '../helpers'

export function markItemAsSaved(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user saves or unsaves, true for saves.
  save: boolean
}) {
  return createAction('MARK_ITEM_AS_SAVED', payload)
}

export function markItemDuplicationAsRead(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether all duplications are read
  read: boolean
}) {
  return createAction('MARK_ITEM_DUPLICATION_AS_READ', payload)
}

export function markItemAsRead(payload: {
  // Indicate the item under action.
  itemNodeIds: string[]
  // Indicate whether user read this item or not
  read: boolean
}) {
  return createAction('MARK_ITEM_AS_READ', payload)
}

export function capatureView(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // reference to the view
  viewRef: any
  // background color
  backgroundColor: string
}) {
  return createAction('CAPTURE_VIEW', payload)
}

export function itemViewSavedToClipboard(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // reference to the view
  viewRef: any
}) {
  return createAction('VIEW_SAVED_TO_CLIPBOARD', payload)
}

export function fetchPost(payload: {
  // post id, which is same as NewsFeedData's itemNodeId
  id: string
}) {
  return createAction('FETCH_POST', payload)
}

export function fetchPostSuccess(payload: {
  // post id, which is same as NewsFeedData's itemNodeId
  id: string
  // NewsFeedData
  data: NewsFeedData
}) {
  return createAction('FETCH_POST_SUCCESS', payload)
}

export function fetchPostFailure(payload: {
  // post id, which is same as NewsFeedData's itemNodeId
  id: string
}) {
  return createAction('FETCH_POST_FAILURE', payload)
}
