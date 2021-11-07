import { createSelector } from 'reselect'
import { EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'

const s = (state: RootState) => state.data || EMPTY_OBJ

export const dataByNodeIdOrId = (state: RootState) => s(state).byId

export const dataSavedIds = (state: RootState) => s(state).savedIds

// only be used in a single instance of a single component
// https://react-redux.js.org/api/hooks#useselector-examples
export const dataLoadingSelector = createSelector(
  (state: RootState) => s(state).loadingId,
  (_: RootState, id: string) => id,
  (loadingId, id) => loadingId === id,
)
