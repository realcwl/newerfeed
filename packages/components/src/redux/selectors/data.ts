import { EnhancedItem } from '@devhub/core'

import { EMPTY_ARRAY, EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'
import { createShallowEqualSelector } from './helpers'

const s = (state: RootState) => state.data || EMPTY_OBJ

export const dataByNodeIdOrId = (state: RootState) => s(state).byId

export const dataReadIds = (state: RootState) => s(state).readIds

export const dataSavedIds = (state: RootState) => s(state).savedIds
