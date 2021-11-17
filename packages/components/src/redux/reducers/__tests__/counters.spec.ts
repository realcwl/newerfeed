import { REHYDRATE } from 'redux-persist'
import { loginSuccess } from '../../actions'
import { AllActions } from '../../types'
import { countReducer, initialState } from '../counters'

describe('countReducer', () => {
  const stateWithSomeCounts = {
    loginSuccess: 5,
  }

  // REHYDRATE
  test('should not change state when error in rehydrate', () => {
    const errorAction = {
      type: REHYDRATE as any,
      err: true,
      payload: {},
    }
    expect(countReducer(stateWithSomeCounts, errorAction)).toEqual(
      stateWithSomeCounts,
    )
  })

  test('should rehydrate when for valid key', () => {
    const action = {
      type: REHYDRATE as any,
      err: false,
      payload: {
        counters: {
          loginSuccess: 10,
          someOtherrCount: 4,
        },
      },
    } as AllActions
    expect(countReducer(stateWithSomeCounts, action).loginSuccess).toBe(10)
  })

  test('should not rehydrate when for invalid key', () => {
    const action = {
      type: REHYDRATE as any,
      err: false,
      payload: {
        counters: {
          someOtherrCount: 4,
        },
      },
    } as AllActions
    expect(countReducer(stateWithSomeCounts, action)).toEqual(initialState)
  })

  // LOGIN_SUCCESS
  test('should increase login success count when login success', () => {
    const action = loginSuccess({
      appToken: 'appToken',
      refreshToken: 'refreshToken',
      user: {
        id: 'id',
        name: 'name',
        email: 'email@email.com',
      },
    })
    expect(countReducer(stateWithSomeCounts, action).loginSuccess).toBe(
      stateWithSomeCounts.loginSuccess + 1,
    )
  })
})
