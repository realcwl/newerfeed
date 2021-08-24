import {
  ColumnCreation,
  ColumnFilter,
  NewsFeedData,
  NewsFeedDataExpressionWrapper,
} from '@devhub/core'
import { EmitterTypes } from '../../libs/emitter'
import { createAction } from '../helpers'

export function removeSubscriptionFromColumn(payload: {
  columnId: string
  subscriptionId: string
}) {
  return createAction('REMOVE_SUBSCRIPTION_FROM_COLUMN', payload)
}

export function deleteColumn(payload: {
  columnId: string
  columnIndex: number
}) {
  return createAction('DELETE_COLUMN', payload)
}

export function moveColumn(
  payload: {
    columnId: string
    columnIndex: number
  } & Omit<EmitterTypes['FOCUS_ON_COLUMN'], 'focusOnVisibleItem'>,
) {
  return createAction('MOVE_COLUMN', payload)
}

export function addColumn(payload: ColumnCreation) {
  return createAction('ADD_COLUMN', payload)
}

export function clearColumnFilters(payload: { columnId: string }) {
  return createAction('CLEAR_COLUMN_FILTERS', payload)
}

export function setColumnSavedFilter(payload: {
  columnId: string
  saved?: boolean | null
}) {
  return createAction('SET_COLUMN_SAVED_FILTER', payload)
}

export function setColumnParticipatingFilter(payload: {
  columnId: string
  participating: boolean
}) {
  return createAction('SET_COLUMN_PARTICIPATING_FILTER', payload)
}

export function setColumnLabelFilter(payload: {
  columnId: string
  label: string
  value: boolean | null
  removeIfAlreadySet?: boolean
  removeOthers?: boolean
}) {
  return createAction('SET_COLUMN_LABEL_FILTER', payload)
}

export function setColumnInvolvesFilter(payload: {
  columnId: string
  user: string
  value: boolean | null
}) {
  return createAction('SET_COLUMN_INVOLVES_FILTER', payload)
}

export function replaceColumnWatchingFilter(payload: {
  columnId: string
  owner: string | null
}) {
  return createAction('REPLACE_COLUMN_WATCHING_FILTER', payload)
}

export function setColumnWatchingFilter(payload: {
  columnId: string
  owner: string
  value: boolean | null
}) {
  return createAction('SET_COLUMN_WATCHING_FILTER', payload)
}

export function replaceColumnOwnerFilter(payload: {
  columnId: string
  owner: string | null
}) {
  return createAction('REPLACE_COLUMN_OWNER_FILTER', payload)
}

export function setColumnOwnerFilter(payload: {
  columnId: string
  owner: string
  value: boolean | null
}) {
  return createAction('SET_COLUMN_OWNER_FILTER', payload)
}

export function setColumnRepoFilter(payload: {
  columnId: string
  owner: string
  repo: string
  value: boolean | null
}) {
  return createAction('SET_COLUMN_REPO_FILTER', payload)
}

export function setColumnClearedAtFilter(payload: {
  columnId: string
  clearedAt: string | null
}) {
  return createAction('SET_COLUMN_CLEARED_AT_FILTER', payload)
}

export function clearAllColumnsWithConfirmation(
  payload: { clearedAt?: string | null } = {},
) {
  return createAction('CLEAR_ALL_COLUMNS_WITH_CONFIRMATION', payload)
}

export function clearAllColumns(payload: { clearedAt?: string | null } = {}) {
  return createAction('CLEAR_ALL_COLUMNS', payload)
}

export function changeIssueNumberFilter(payload: {
  columnId: string
  issueNumber: number
  value: boolean | null
  removeIfAlreadySet?: boolean
  removeOthers?: boolean
}) {
  return createAction('CHANGE_ISSUE_NUMBER_FILTER', payload)
}

export function fetchColumnDataRequest(payload: {
  // columnId is the subject column we're fetching data for
  columnId: string
  // NEW stands for "refresh", OLD stands for "load more". The initial fetch or
  // the first fetch after column attribute change is denoted as OLD.
  direction: 'NEW' | 'OLD'
}) {
  return createAction('FETCH_COLUMN_DATA_REQUEST', payload)
}

export function fetchColumnDataSuccess(payload: {
  // columnId is the subject column we're fetching data for
  columnId: string
  // NEW stands for "refresh", OLD stands for "load more". The initial fetch or
  // the first fetch after column attribute change is denoted as OLD.
  direction: 'NEW' | 'OLD'
  // a list of NewsFeedData that we fetched
  data: NewsFeedData[]
  // Timestamp in seconds. Backend should return updatedAt to make sure the
  // frontend is always up to date with this timestamp.
  updatedAt: number
  // the caller should decide whether to drop existing data in this column.
  // e.g. when the data fetched reached the limit, it's very likely that there's
  // a "gap" between existing data and newly fetched data, and thus should drop
  // the existing ones.
  dropExistingData: boolean
  // optionally, pass data expression to update the column attributes.
  dataExpression?: NewsFeedDataExpressionWrapper
}) {
  return createAction('FETCH_COLUMN_DATA_SUCCESS', payload)
}
