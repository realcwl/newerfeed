import {
  fetchColumnDataSuccess,
  markItemAsRead,
  markItemAsSaved,
} from '../../actions'
import { dataReducer, State } from '../data'

const fakeTime = new Date(Date.UTC(2021, 10, 6)).getTime()
jest.useFakeTimers('modern').setSystemTime(fakeTime)

describe('dataReducer', () => {
  const invalidItemNodeId = 'invalidItemNodeId'
  const newsFeedDataArray = [0, 1, 2, 3, 4].map((n) => ({
    id: `NewsFeedDataId_${n}`,
    cursor: n,
    isSaved: n % 2 === 0,
    isRead: n % 2 === 0,
  }))

  // newsFeedDataArray[0] ~ [3], exclude [4]
  const stateWithData: State = {
    allIds: newsFeedDataArray
      .filter((data) => data.cursor !== 4)
      .map((data) => data.id),
    byId: {
      [newsFeedDataArray[0].id]: newsFeedDataArray[0],
      [newsFeedDataArray[1].id]: newsFeedDataArray[1],
      [newsFeedDataArray[2].id]: newsFeedDataArray[2],
      [newsFeedDataArray[3].id]: newsFeedDataArray[3],
    },
    savedIds: [],
    updatedAt: undefined,
  }

  // MARK_ITEM_AS_SAVED
  test('should mark item as saved/unsaved', () => {
    const itemNodeId = newsFeedDataArray[0].id
    expect(stateWithData.savedIds.includes(itemNodeId)).toBe(false)
    const saveAction = markItemAsSaved({
      itemNodeId,
      save: true,
    })
    const itemSavedState = dataReducer(stateWithData, saveAction)
    expect(itemSavedState.savedIds.includes(itemNodeId)).toBe(true)
    expect(itemSavedState.byId[itemNodeId].isSaved).toBe(true)

    const unsaveAction = markItemAsSaved({
      itemNodeId,
      save: false,
    })
    const itemUnsavedState = dataReducer(itemSavedState, unsaveAction)
    expect(itemUnsavedState.savedIds.includes(itemNodeId)).toBe(false)
    expect(itemUnsavedState.byId[itemNodeId].isSaved).toBe(false)
  })

  test('should not change state if id is not in data', () => {
    const saveAction = markItemAsSaved({
      itemNodeId: invalidItemNodeId,
      save: true,
    })
    expect(dataReducer(stateWithData, saveAction)).toEqual(stateWithData)

    const unsaveAction = markItemAsSaved({
      itemNodeId: invalidItemNodeId,
      save: false,
    })
    expect(dataReducer(stateWithData, unsaveAction)).toEqual(stateWithData)
  })

  // MARK_ITEM_AS_READ
  test('should mark item as read/unread', () => {
    const readIds = [newsFeedDataArray[1].id, newsFeedDataArray[3].id]
    const unchangedIds = [newsFeedDataArray[0].id, newsFeedDataArray[2].id]

    readIds.map((readId) => {
      expect(stateWithData.byId[readId].isRead).toBe(false)
    })
    unchangedIds.map((unchangedId) => {
      expect(stateWithData.byId[unchangedId].isRead).toBe(true)
    })

    const readAction = markItemAsRead({
      itemNodeIds: readIds,
      read: true,
    })
    const readState = dataReducer(stateWithData, readAction)
    readIds.map((readId) => {
      expect(readState.byId[readId].isRead).toBe(true)
    })
    unchangedIds.map((unchangedId) => {
      expect(stateWithData.byId[unchangedId].isRead).toBe(true)
    })

    const unreadAction = markItemAsRead({
      itemNodeIds: readIds,
      read: false,
    })
    const unreadState = dataReducer(readState, unreadAction)
    readIds.map((readId) => {
      expect(unreadState.byId[readId].isRead).toBe(false)
    })
    unchangedIds.map((unchangedId) => {
      expect(stateWithData.byId[unchangedId].isRead).toBe(true)
    })
  })

  // FETCH_COLUMN_DATA_SUCCESS
  test('should update data when column data is fetched', () => {
    const action = fetchColumnDataSuccess({
      columnId: 'id',
      direction: 'NEW',
      data: newsFeedDataArray,
      updatedAt: 'updatedAt',
      dropExistingData: true,
      dataByNodeId: {},
      sources: [],
    })

    expect(stateWithData.byId[newsFeedDataArray[4].id]).toBe(undefined)
    expect(stateWithData.allIds.includes(newsFeedDataArray[4].id)).toBe(false)
    expect(stateWithData.byId[newsFeedDataArray[0].id]).toEqual(
      newsFeedDataArray[0],
    )
    expect(stateWithData.allIds.includes(newsFeedDataArray[0].id)).toBe(true)

    // newsFeedDataArray[4] is new
    const updatedState = dataReducer(stateWithData, action)
    expect(updatedState.byId[newsFeedDataArray[4].id]).toBe(
      newsFeedDataArray[4],
    )
    expect(updatedState.allIds.includes(newsFeedDataArray[4].id)).toBe(true)
    expect(updatedState.byId[newsFeedDataArray[0].id]).toEqual(
      newsFeedDataArray[0],
    )
    expect(updatedState.allIds.includes(newsFeedDataArray[0].id)).toBe(true)
  })
})
