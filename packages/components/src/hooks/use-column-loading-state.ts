import _ from 'lodash'
import { useCallback } from 'react'

import { LoadState } from '@devhub/core'
import * as selectors from '../redux/selectors'
import { useColumn } from './use-column'
import { useReduxState } from './use-redux-state'

export function useColumnLoadingState(columnId: string): LoadState {
  const { column } = useColumn(columnId)
  if (!column) return 'error'

  return column.state
}
