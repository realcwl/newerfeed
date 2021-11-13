import _ from 'lodash'

import { LoadState } from '@devhub/core'
import { useColumn } from './use-column'

export function useColumnLoadingState(columnId: string): LoadState {
  const { column } = useColumn(columnId)
  if (!column) return 'error'

  return column.state
}
