import _ from 'lodash'

import { SourceOrSubSource } from '@devhub/core'
import { useReduxState } from './use-redux-state'
import { idToSourceOrSubSourceMapSelector } from '../redux/selectors'

export function useSubSource(subSourceId: string): SourceOrSubSource {
  const idToSourceOrSubSourceMap = useReduxState(
    idToSourceOrSubSourceMapSelector,
  )

  return idToSourceOrSubSourceMap[subSourceId]
}
