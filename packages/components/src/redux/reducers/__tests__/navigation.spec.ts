import { ModalPayload } from '@devhub/core'
import {
  closeAllModals,
  popModal,
  pushModal,
  replaceModal,
} from '../../actions'
import { initialState, navigationReducer } from '../navigation'

describe('navigationReducer', () => {
  const addColumnPayload = {
    name: 'ADD_COLUMN',
  } as ModalPayload

  const addColumnDetailPayload = {
    name: 'ADD_COLUMN_DETAILS',
  } as ModalPayload

  const advancedSettingPayload = {
    name: 'ADVANCED_SETTINGS',
  } as ModalPayload

  const twoStackState = {
    modalStack: [
      { ...addColumnPayload, index: 0 },
      { ...addColumnDetailPayload, index: 1 },
    ],
  }
  const oneStackState = {
    modalStack: [{ ...addColumnPayload, index: 0 }],
  }

  // PUSH_MODAL
  test('should push modal', () => {
    const addColumnAction = pushModal(addColumnPayload)
    let state = navigationReducer(initialState, addColumnAction)
    expect(state).toEqual(oneStackState)

    const addColumnDetailAction = pushModal(addColumnDetailPayload)
    state = navigationReducer(state, addColumnDetailAction)
    expect(state).toEqual(twoStackState)
  })

  // REPLACE_MODAL
  test('should clear modal when modal in payload is the only one in the stack', () => {
    const action = replaceModal(addColumnPayload)
    expect(navigationReducer(oneStackState, action)).toEqual(initialState)
  })

  test('should replace modal stack with modal in payload', () => {
    const action = replaceModal(advancedSettingPayload)
    const expectedState = {
      modalStack: [{ ...advancedSettingPayload, index: 0 }],
    }
    expect(navigationReducer(twoStackState, action)).toEqual(expectedState)
  })

  // POP_MODAL
  test('should pop modal', () => {
    const action = popModal()
    expect(navigationReducer(twoStackState, action)).toEqual(oneStackState)
    expect(navigationReducer(oneStackState, action)).toEqual(initialState)
    expect(navigationReducer(initialState, action)).toEqual(initialState)
  })

  // CLOSE_ALL_MODALS
  test('should close all modals', () => {
    const action = closeAllModals()
    expect(navigationReducer(twoStackState, action)).toEqual(initialState)
    expect(navigationReducer(oneStackState, action)).toEqual(initialState)
    expect(navigationReducer(initialState, action)).toEqual(initialState)
  })
})
