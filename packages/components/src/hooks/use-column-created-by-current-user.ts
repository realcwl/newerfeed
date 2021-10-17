import * as selectors from '../redux/selectors'
import { useReduxState } from './use-redux-state'
import { useColumn } from './use-column'

export function useColumnCreatedByCurrentUser(columnId: string): boolean {
  const currentUserId = useReduxState(selectors.currentUserIdSelector)
  const column = useColumn(columnId)
  return (
    // return true if there is no creator or creator is current user
    !column?.column?.creator?.id || column.column.creator.id === currentUserId
  )
}
