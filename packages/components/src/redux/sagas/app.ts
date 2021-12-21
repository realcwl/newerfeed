import { BANNER_AUTO_CLOSE_DURATION } from '@devhub/core/src/utils/constants'
import axios, { AxiosResponse } from 'axios'
import {
  all,
  delay,
  put,
  takeLatest,
  takeEvery,
  select,
} from 'typed-redux-saga'
import {
  closeBannerMessage,
  handleSignal,
  setBannerMessage,
  setItemDuplicationReadStatus,
  setItemsReadStatus,
  updateSeedState,
} from '../actions'
import { ExtractActionFromActionCreator } from '../types/base'
import * as selectors from '../selectors'
import { WrapUrlWithToken } from '../../utils/api'
import { constants, SeedState } from '@devhub/core'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import { split } from 'lodash'

// Response returned from the backend for userState.
interface UserStateResponse {
  data: {
    userState: {
      user: {
        avatarUrl: string
        id: string
        name: string
        subscribedFeeds: {
          id: string
          name: string
        }[]
      }
    }
  }
}

function* onSetBannerMessage(
  action: ExtractActionFromActionCreator<typeof setBannerMessage>,
) {
  // If the banner is set as AutoClose, dispatch a CLOSE_BANNER_MESSAGE later.
  // Most of the error message should set auto close.
  if (action.payload.autoClose) {
    yield delay(BANNER_AUTO_CLOSE_DURATION)
    yield put(closeBannerMessage(action.payload.id))
  }
}

// Handle backend signal, this is the *only* handler that handles backend signal
// sending through the Websocket channel.
function* onSignal(
  action: ExtractActionFromActionCreator<typeof handleSignal>,
) {
  switch (action.payload.signalType) {
    case 'SEED_STATE': {
      yield* fetchSeedState()
      break
    }
    case 'SET_ITEMS_READ_STATUS': {
      // TODO: move the payload parser to a dedicated file when we have more types of signals
      const REDIS_TRUE = '1'
      const PAYLOAD_DELIMITER = '__'
      const splits = action.payload.signalPayload.split(PAYLOAD_DELIMITER)
      if (splits.length < 3) {
        // TODO: add log when we have frontend monitoring
        console.log('Invalid signal type:', action.payload)
        break
      }
      switch (splits[0]) {
        case 'POST':
          yield put(
            setItemsReadStatus({
              itemNodeIds: splits.slice(2),
              read: splits[1] === REDIS_TRUE,
              syncup: false,
            }),
          )
          break
        case 'DUPLICATION':
          yield put(
            setItemDuplicationReadStatus({
              itemNodeId: splits[2],
              read: splits[1] === REDIS_TRUE,
              syncup: false,
            }),
          )
          break
        default:
          // TODO: add log when we have frontend monitoring
          console.log('Unknown signal type:', action.payload)
          break
      }
      break
    }
    default: {
      console.error('Unknown signal: ' + String(action.payload.signalType))
      break
    }
  }
}

function* fetchSeedState() {
  const appToken = yield* select(selectors.appTokenSelector)
  const userId = yield* select(selectors.currentUserIdSelector)
  try {
    const userStateResponse: AxiosResponse<UserStateResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: jsonToGraphQLQuery({
          query: {
            userState: {
              __args: {
                input: {
                  userId: userId,
                },
              },
              user: {
                id: true,
                avatarUrl: true,
                name: true,
                subscribedFeeds: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        }),
      })

    const seedState: SeedState = {
      userSeedState: userStateResponse.data.data.userState.user,
      feedSeedState:
        userStateResponse.data.data.userState.user.subscribedFeeds.map(
          (feed) => {
            return {
              id: feed.id,
              name: feed.name,
            }
          },
        ),
    }

    yield put(updateSeedState(seedState))
  } catch (err) {
    console.error('fail to get seedState from userState', err)
  }
}

export function* appSagas() {
  yield* all([
    yield* takeLatest('SET_BANNER_MESSAGE', onSetBannerMessage),
    yield* takeEvery('HANDLE_SIGNAL', onSignal),
  ])
}
