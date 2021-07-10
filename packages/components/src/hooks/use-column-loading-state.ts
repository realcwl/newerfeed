import _ from 'lodash'
import { useCallback } from 'react'

import { EnhancedLoadState } from '@devhub/core'
import * as selectors from '../redux/selectors'
import { useColumn } from './use-column'
import { useReduxState } from './use-redux-state'

export function useColumnLoadingState(columnId: string): EnhancedLoadState {
  const { hasCrossedColumnsLimit } = useColumn(columnId)

  // TODO(chenweilunster): Fix loading state React Hook.
  const loadState: EnhancedLoadState = 'not_loaded'

  return loadState
}
