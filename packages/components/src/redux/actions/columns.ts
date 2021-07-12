import { ColumnCreation } from '@devhub/core'
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
