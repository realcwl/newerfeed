import _ from 'lodash'

import { Column } from '@devhub/core'
import { Reducer } from '../types'

export interface State {
  // All column ids, each id is a hex string. The rendering order will be the
  // same as the list order.
  allIds: string[]

  // byId maps the hex string column id to the Column type, where details of the
  // Column such as column header, type, are defined. Note that this is onlt a
  // definition of the column, the actual mapping between column->data are
  // defined in Subscription reducer.
  byId: Record<string, Column | undefined> | null

  // The last time this column is updated.
  updatedAt: string | null
}

const initialState: State = {
  allIds: [],
  byId: null,
  updatedAt: null,
}

export const columnsReducer: Reducer<State> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    // TODO(chenweilunster): Implement Columns Reducer.
    default:
      return state
  }
}
