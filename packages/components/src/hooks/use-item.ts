import { NewsFeedData } from '@devhub/core'
import { useCallback } from 'react'

import * as selectors from '../redux/selectors'
import { useReduxState } from './use-redux-state'

export function useItem<T extends NewsFeedData>(
  nodeIdOrId: string,
): T | undefined {
  const dataItem = useReduxState(
    useCallback(
      (state) => selectors.dataByNodeIdOrId(state)[nodeIdOrId],
      [nodeIdOrId],
    ),
  )
  if (!dataItem) return undefined

  return dataItem as T
}
