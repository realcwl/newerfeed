import { NewsFeedData } from '@devhub/core'
import { createAction } from '../helpers'

export function setItemSavedStatus(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether user saves or unsaves, true for saves.
  save: boolean
}) {
  return createAction('SET_ITEM_SAVED_STATUS', payload)
}

export function setItemDuplicationReadStatus(payload: {
  // Indicate the item under action.
  itemNodeId: string
  // Indicate whether all duplications are read
  read: boolean
  // Indicate whether this action need to syncup to database
  // mainly to avoid a loop when we syncdown the read status
  syncup: boolean
}) {
  return createAction('SET_ITEM_DUPLICATION_READ_STATUS', payload)
}

export function setItemsReadStatus(payload: {
  // Indicate the item under action.
  itemNodeIds: string[]
  // Indicate whether user read this item or not
  read: boolean
  // Indicate whether this action need to syncup to database
  // mainly to avoid a loop when we syncdown the read status
  syncup: boolean
}) {
  return createAction('SET_ITEMS_READ_STATUS', payload)
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

export function capatureViewCompleted(payload: {
  // Indicate the item under action.
  itemNodeId: string
}) {
  return createAction('CAPTURE_VIEW_COMPLETED', payload)
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

export function setColumnVisibleItems(payload: {
  columnId: string | undefined
  firstVisibleItemId: string
  lastVisibleItemId: string
}) {
  return createAction('UPDATE_COLUMN_VISIBLE_ITEMS', payload)
}

export function resetColumnVisibleItems(payload: { columnId: string }) {
  return createAction('RESET_COLUMN_VISIBLE_ITEMS', payload)
}
