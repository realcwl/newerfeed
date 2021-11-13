import immer from 'immer'
import _ from 'lodash'
import { combineReducers } from 'redux'

import * as selectors from '../selectors'
import { ExtractStateFromReducer } from '../types/base'
import { appReducer } from './app'
import { authReducer } from './auth'
import { columnsReducer } from './columns'
import { configReducer } from './config'
import { countReducer } from './counters'
import { navigationReducer } from './navigation'

const _rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  columns: columnsReducer,
  config: configReducer,
  counters: countReducer,
  navigation: navigationReducer,
})

export const rootReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'LOGOUT':
      return _rootReducer(_.pick(state, ['config', 'counters']) as any, action)

    // TODO(chenweilunster): Figure out when this function is called.
    case 'CLEANUP_ARCHIVED_ITEMS':
      return cleanupArchivedItemsReducer(state)

    default:
      return _rootReducer(state, action)
  }
}

function cleanupArchivedItemsReducer(
  state: ExtractStateFromReducer<typeof _rootReducer>,
) {
  return immer(state, (draft) => undefined)
}
