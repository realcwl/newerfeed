import { Column } from '@devhub/core'
import _ from 'lodash'
import React from 'react'

import {
  cardsGenericOwnerFilterBarTotalHeight,
  GenericOwnerFilterBar,
} from './partials/GenericOwnerFilterBar'

export interface CardsOwnerFilterBarProps {
  columnId: Column['id']
  key: string
}

const ownersCacheByColumnId = new Map<string, Set<string>>()
const lastUsernameCacheByColumnId = new Map<string, string | undefined>()

export const cardsOwnerFilterBarTotalHeight =
  cardsGenericOwnerFilterBarTotalHeight

export const CardsOwnerFilterBar = React.memo(
  (props: CardsOwnerFilterBarProps) => {
    return (
      <GenericOwnerFilterBar
        columnType={'COLUMN_TYPE_NEWS_FEED'}
        data={[]}
        onItemPress={() => undefined}
      />
    )
  },
)

CardsOwnerFilterBar.displayName = 'CardsOwnerFilterBar'
