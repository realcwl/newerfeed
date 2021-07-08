import immer from 'immer'

import { constants, ThemePair } from '@devhub/core'
import { Reducer } from '../types'

export interface State {
  theme?: ThemePair
}

const initialState: State = {
  theme: constants.DEFAULT_THEME_PAIR,
}

export const configReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return immer(state, (draft) => {
        draft.theme = action.payload
      })
    default:
      return state
  }
}
