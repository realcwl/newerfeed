import { AllOf, AnyOf, NewsFeedDataExpression, NotTrue } from '@devhub/core'
import { FlatListProps } from 'react-native'

export type FlatListItemLayout = ReturnType<
  NonNullable<FlatListProps<any>['getItemLayout']>
>

// Determine the type of the expression.
// See https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
export function isAllOf(object: NewsFeedDataExpression): object is AllOf {
  return 'allOf' in object
}

export function isAnyOf(object: NewsFeedDataExpression): object is AnyOf {
  return 'anyOf' in object
}

export function isNotTrue(object: NewsFeedDataExpression): object is NotTrue {
  return 'notTrue' in object
}
