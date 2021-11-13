import immer from 'immer'

import { Column, normalizeColumns, SeedState } from '@devhub/core'
import {
  addColumn,
  deleteColumn,
  fetchColumnDataFailure,
  fetchColumnDataRequest,
  fetchColumnDataSuccess,
  moveColumn,
  replaceColumnFilters,
  setColumnLoading,
  setColumnOption,
  setColumnSavedFilter,
  updateColumnId,
  updateSeedState,
  fetchPost,
  fetchPostFailure,
  fetchPostSuccess,
  markItemAsRead,
  markItemAsSaved,
} from '../../actions'
import { columnsReducer, State } from '../columns'

const fakeTime = new Date(Date.UTC(2021, 10, 3)).getTime()
jest.useFakeTimers('modern').setSystemTime(fakeTime)

describe('columnsReducer', () => {
  const newColumnId = 'newColumnId'
  const invalidColumnId = 'invalidColumnId'
  const newsFeedColumns = [1, 2, 3, 4, 5].map(
    (n) =>
      ({
        id: `newsFeedColumnId${n}`,
        title: `newsFeedColumnTitle${n}`,
        createdAt: (1633285337000 + n).toString(),
        updatedAt: (1633285348000 + n).toString(),
        refreshedAt: (1633285349000 + n).toString(),
        state: 'loaded',
        options: {
          enableAppIconUnreadIndicator: true,
        },
        type: 'COLUMN_TYPE_NEWS_FEED',
        icon: {
          family: `iconFamily${n}`,
          name: `iconName${n}`,
        },
        itemListIds: [1, 2].map((m) => `itemListId${n}_${m}`),
        oldestItemId: `itemListId${n}_${1}`,
        newestItemId: `itemListId${n}_${2}`,
        sources: [1, 2].map((l) => ({
          sourceId: `sourceId${n}_${l}`,
          subSourceIds: [1, 2].map((k) => `subSourceId${k}`),
        })),
        dataExpression: undefined,
        filters: {
          query: 'query',
          saved: false,
          unread: false,
        },
        visibility: 'PRIVATE',
        subscriberCount: 1,
      } as Column),
  )

  const invalidItemNodeId = 'invalidItemNodeId'
  const newsFeedDataArray = [0, 1, 2, 3, 4, 5].map((n) => ({
    id: `NewsFeedDataId_${n}`,
    cursor: n,
    isSaved: n % 2 === 0,
    isRead: n % 2 === 0,
  }))
  const defaultState = {
    allColumnIds: [],
    columnById: {},
    sharedColumnIds: [],
    allDataIds: newsFeedDataArray
      .filter((data) => data.cursor < 4)
      .map((data) => data.id),
    dataById: {
      [newsFeedDataArray[0].id]: newsFeedDataArray[0],
      [newsFeedDataArray[1].id]: newsFeedDataArray[1],
      [newsFeedDataArray[2].id]: newsFeedDataArray[2],
      [newsFeedDataArray[3].id]: newsFeedDataArray[3],
    },
    savedDataIds: [],
    loadingDataId: '',
    dataUpdatedAt: undefined,
  } as State

  const getState = (items: number[]): State => {
    const state = immer(defaultState, (draft) => {
      items.forEach((n) => {
        if (newsFeedColumns.length > n && n > -1) {
          const newsFeedColumn = newsFeedColumns[n]
          const id = newsFeedColumn.id
          draft.allColumnIds.push(id)
          draft.columnById[id] = newsFeedColumn
        } else {
          throw new Error('item index is out of newsFeedColumns range')
        }
      })
    })
    return state
  }

  // default case
  // unable to test invalid action since it's not allowed by type check
  // use invalid deleteColumn instead to test default state
  test('should return the initial state', () => {
    const doNothingAction = deleteColumn({
      columnId: invalidColumnId,
      columnIndex: -1,
    })
    expect(columnsReducer(undefined, doNothingAction)).toEqual(defaultState)
  })

  // case 'ADD_COLUMN':
  test('should add new column', () => {
    const addColumnAction = addColumn(newsFeedColumns[0])
    expect(columnsReducer(undefined, addColumnAction)).toEqual(getState([0]))
  })
  test('should update column when add the colume with same id', () => {
    const newTitle = `${newsFeedColumns[0].title}_new`
    const updatedNewsFeed = immer(newsFeedColumns[0], (draft) => {
      draft.title = newTitle
    })
    const addColumnAction = addColumn(updatedNewsFeed)
    const updatedState = immer(getState([0]), (draft) => {
      draft.columnById[updatedNewsFeed.id].title = newTitle
    })
    expect(columnsReducer(getState([0]), addColumnAction)).toEqual(updatedState)
  })

  // case 'DELETE_COLUMN':
  test('should delete column', () => {
    const deleteColumnAction = deleteColumn({
      columnId: newsFeedColumns[0].id,
      columnIndex: -1, // columnIndex not used
    })
    expect(columnsReducer(getState([0, 1]), deleteColumnAction)).toEqual(
      getState([1]),
    )
  })

  test('should delete no column if colmun id does not exists in state', () => {
    const deleteColumnAction = deleteColumn({
      columnId: newsFeedColumns[1].id,
      columnIndex: -1, // columnIndex not used
    })
    expect(columnsReducer(getState([0]), deleteColumnAction)).toEqual(
      getState([0]),
    )
  })

  // case 'MOVE_COLUMN':
  test('should move column to the end', () => {
    const moveColumnAction = moveColumn({
      columnId: newsFeedColumns[0].id,
      columnIndex: 1,
    })
    expect(columnsReducer(getState([0, 1]), moveColumnAction)).toEqual(
      getState([1, 0]),
    )
  })

  test('should move column to the start', () => {
    const moveColumnAction = moveColumn({
      columnId: newsFeedColumns[1].id,
      columnIndex: 0,
    })
    expect(columnsReducer(getState([0, 1]), moveColumnAction)).toEqual(
      getState([1, 0]),
    )
  })

  test('should not move if column does not exist', () => {
    const moveColumnAction = moveColumn({
      columnId: invalidColumnId,
      columnIndex: 0,
    })
    expect(columnsReducer(getState([0, 1]), moveColumnAction)).toEqual(
      getState([0, 1]),
    )
  })

  test('should move to first if index is outside of range', () => {
    const moveColumnAction = moveColumn({
      columnId: newsFeedColumns[1].id,
      columnIndex: -1,
    })
    expect(columnsReducer(getState([0, 1, 2]), moveColumnAction)).toEqual(
      getState([1, 0, 2]),
    )
  })

  // case 'UPDATE_SEED_STATE':
  test('should update seed state', () => {
    const newsFeedColumnIndexToUpdate = 0
    const newsFeedColumnIndexToAdd = 3
    const newsFeedColumnToUpdate = newsFeedColumns[newsFeedColumnIndexToUpdate]
    const newsFeedColumnToAdd = newsFeedColumns[newsFeedColumnIndexToAdd]
    const seedState = {
      userSeedState: {
        id: 'userSeedStateId',
        name: 'userSeedStateName',
        avatarUrl: 'userSeedStateAvatarUrl',
      },
      feedSeedState: [
        {
          // update existing
          id: newsFeedColumnToUpdate.id,
          name: `${newsFeedColumnToUpdate.title}_new`,
        },
        {
          // add new
          id: newsFeedColumnToAdd.id,
          name: `${newsFeedColumnToAdd.title}_new`,
        },
      ],
    } as SeedState
    const updateSeedStateAction = updateSeedState(seedState)

    const getAddFeedColumn = (id: string, name: string) =>
      normalizeColumns([
        {
          title: name,
          type: 'COLUMN_TYPE_NEWS_FEED',
          icon: {
            family: 'material',
            name: 'rss-feed',
          },
          id: id,
          itemListIds: [],
          newestItemId: '',
          oldestItemId: '',
          sources: [],
          state: 'not_loaded',
          dataExpression: undefined,
          options: { enableAppIconUnreadIndicator: true },
          visibility: 'PRIVATE',
          subscriberCount: 1,
        },
      ]).byId[id]

    // newsFeedColumns[1] and [2] will be deleted, [0] is updated to new feed
    const newState = immer(getState([newsFeedColumnIndexToUpdate]), (draft) => {
      draft.columnById[newsFeedColumns[newsFeedColumnIndexToUpdate].id].title =
        seedState.feedSeedState[0].name
      draft.columnById[newsFeedColumns[newsFeedColumnIndexToAdd].id] =
        getAddFeedColumn(
          seedState.feedSeedState[1].id,
          seedState.feedSeedState[1].name,
        )
      draft.allColumnIds.push(newsFeedColumns[newsFeedColumnIndexToAdd].id)
    })

    expect(columnsReducer(getState([0, 1, 2]), updateSeedStateAction)).toEqual(
      newState,
    )
  })

  // case 'REPLACE_COLUMN_FILTER':
  test('should replace column filter', () => {
    const newFilter = {
      query: 'newQuery',
      saved: true,
      unread: false,
    }
    const replaceColumnFiltersAction = replaceColumnFilters({
      columnId: newsFeedColumns[0].id,
      filter: newFilter,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[newsFeedColumns[0].id].filters = newFilter
    })
    expect(
      columnsReducer(getState([0, 1, 2]), replaceColumnFiltersAction),
    ).toEqual(newState)
  })

  test('should replace no column filter if columnId is not in the state', () => {
    const newFilter = {
      query: 'newQuery',
      saved: true,
      unread: false,
    }
    const replaceColumnFiltersAction = replaceColumnFilters({
      columnId: invalidColumnId,
      filter: newFilter,
    })
    expect(
      columnsReducer(getState([0, 1, 2]), replaceColumnFiltersAction),
    ).toEqual(getState([0, 1, 2]))
  })

  // case 'SET_COLUMN_SAVED_FILTER':
  test('should set column filter', () => {
    const setColumnSavedFilterAction = setColumnSavedFilter({
      columnId: newsFeedColumns[0].id,
      saved: !newsFeedColumns[0].filters?.saved,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      const filters = draft.columnById[newsFeedColumns[0]?.id]?.filters
      if (filters) {
        draft.columnById[newsFeedColumns[0].id].filters = {
          ...filters,
          saved: !newsFeedColumns[0].filters?.saved,
        }
      }
    })
    expect(
      columnsReducer(getState([0, 1, 2]), setColumnSavedFilterAction),
    ).toEqual(newState)
  })

  test('should set no column filter if columnId is not in the state', () => {
    const setColumnSavedFilterAction = setColumnSavedFilter({
      columnId: invalidColumnId,
      saved: !newsFeedColumns[0].filters?.saved,
    })
    expect(
      columnsReducer(getState([0, 1, 2]), setColumnSavedFilterAction),
    ).toEqual(getState([0, 1, 2]))
  })

  // case 'SET_COLUMN_OPTION':
  test('should set column option', () => {
    const newOptionValue =
      !newsFeedColumns[0].options.enableAppIconUnreadIndicator
    const setColumnOptionAction = setColumnOption({
      columnId: newsFeedColumns[0].id,
      option: 'enableAppIconUnreadIndicator',
      value: newOptionValue,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[
        newsFeedColumns[0].id
      ].options.enableAppIconUnreadIndicator = newOptionValue
    })
    expect(columnsReducer(getState([0, 1, 2]), setColumnOptionAction)).toEqual(
      newState,
    )
  })

  test('should set no column option if columnId is not in the state', () => {
    const setColumnOptionAction = setColumnOption({
      columnId: invalidColumnId,
      option: 'enableAppIconUnreadIndicator',
      value: false,
    })
    expect(columnsReducer(getState([0, 1, 2]), setColumnOptionAction)).toEqual(
      getState([0, 1, 2]),
    )
  })

  // case 'FETCH_COLUMN_DATA_REQUEST':
  test('should set column loading state when fetching column data request', () => {
    const fetchColumnDataRequestAction = fetchColumnDataRequest({
      columnId: newsFeedColumns[0].id,
      direction: 'NEW',
      notifyOnNewPosts: false,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[newsFeedColumns[0].id].state = 'loading'
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataRequestAction),
    ).toEqual(newState)
  })

  test('should set no column loading state when fetching column data request for invalid columnId', () => {
    const fetchColumnDataRequestAction = fetchColumnDataRequest({
      columnId: invalidColumnId,
      direction: 'NEW',
      notifyOnNewPosts: false,
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataRequestAction),
    ).toEqual(getState([0, 1, 2]))
  })

  // case 'SET_COLUMN_LOADING':
  test('should set column loading state', () => {
    const setColumnLoadingAction = setColumnLoading({
      columnId: newsFeedColumns[0].id,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[newsFeedColumns[0].id].state = 'loading'
    })
    expect(columnsReducer(getState([0, 1, 2]), setColumnLoadingAction)).toEqual(
      newState,
    )
  })

  test('should set no column loading state for invalid columnId', () => {
    const setColumnLoadingAction = setColumnLoading({
      columnId: invalidColumnId,
    })
    expect(columnsReducer(getState([0, 1, 2]), setColumnLoadingAction)).toEqual(
      getState([0, 1, 2]),
    )
  })

  // case 'UPDATE_COLUMN_ID':
  test('should update column id', () => {
    const previousId = newsFeedColumns[0].id
    const updateColumnIdAction = updateColumnId({
      prevId: previousId,
      updatedId: newColumnId,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      const index = draft.allColumnIds.findIndex((id) => id === previousId)
      if (index > -1) {
        draft.allColumnIds[index] = newColumnId
      }
      draft.columnById[newColumnId] = draft.columnById[previousId]
      draft.columnById[newColumnId].id = newColumnId
      delete draft.columnById[newsFeedColumns[0].id]
    })
    expect(columnsReducer(getState([0, 1, 2]), updateColumnIdAction)).toEqual(
      newState,
    )
  })

  test('should update no column id for invalid columnId', () => {
    const previousId = invalidColumnId
    const updateColumnIdAction = updateColumnId({
      prevId: previousId,
      updatedId: newColumnId,
    })
    expect(columnsReducer(getState([0, 1, 2]), updateColumnIdAction)).toEqual(
      getState([0, 1, 2]),
    )
  })

  // case 'FETCH_COLUMN_DATA_SUCCESS':
  test('should update column when fetching column data success - direction: NEW, dropExistingData: true', () => {
    const columnFetched = newsFeedColumns[0]
    const newsFeedData = [
      {
        id: newsFeedColumns[0].itemListIds[0],
        cursor: 1000,
      },
      {
        id: newsFeedColumns[4].itemListIds[0],
        cursor: 1040,
      },
    ]
    const fetchColumnDataSuccessAction = fetchColumnDataSuccess({
      columnId: columnFetched.id,
      direction: 'NEW',
      data: newsFeedData,
      updatedAt: columnFetched.updatedAt,
      dropExistingData: true,
      dataByNodeId: {},
      dataExpression: columnFetched.dataExpression,
      sources: columnFetched.sources,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[columnFetched.id].itemListIds = [
        newsFeedColumns[0].itemListIds[0],
        newsFeedColumns[4].itemListIds[0],
      ]
      draft.columnById[columnFetched.id].newestItemId =
        newsFeedColumns[4].itemListIds[0]
      draft.columnById[columnFetched.id].refreshedAt = new Date(
        fakeTime,
      ).toISOString()
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataSuccessAction),
    ).toEqual(newState)
  })

  test('should update column when fetching column data success - direction: NEW, dropExistingData: false', () => {
    const columnFetched = newsFeedColumns[0]
    const newsFeedData = [
      {
        id: newsFeedColumns[0].itemListIds[0], // existing
        cursor: 1000,
      },
      {
        id: newsFeedColumns[4].itemListIds[0], // new
        cursor: 1040,
      },
    ]
    const fetchColumnDataSuccessAction = fetchColumnDataSuccess({
      columnId: columnFetched.id,
      direction: 'NEW',
      data: newsFeedData,
      updatedAt: columnFetched.updatedAt,
      dropExistingData: false,
      dataByNodeId: {},
      dataExpression: columnFetched.dataExpression,
      sources: columnFetched.sources,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[columnFetched.id].itemListIds = [
        newsFeedColumns[4].itemListIds[0], // new
        newsFeedColumns[0].itemListIds[0], // existing
        newsFeedColumns[0].itemListIds[1],
      ]
      draft.columnById[columnFetched.id].newestItemId =
        newsFeedColumns[0].itemListIds[1]
      draft.columnById[columnFetched.id].refreshedAt = new Date(
        fakeTime,
      ).toISOString()
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataSuccessAction),
    ).toEqual(newState)
  })

  test('should update column when fetching column data success - direction: OLD, dropExistingData: true', () => {
    const columnFetched = newsFeedColumns[0]
    const newsFeedData = [
      {
        id: newsFeedColumns[0].itemListIds[0],
        cursor: 1000,
      },
      {
        id: newsFeedColumns[4].itemListIds[0],
        cursor: 1040,
      },
    ]
    const fetchColumnDataSuccessAction = fetchColumnDataSuccess({
      columnId: columnFetched.id,
      direction: 'OLD',
      data: newsFeedData,
      updatedAt: columnFetched.updatedAt,
      dropExistingData: true,
      dataByNodeId: {},
      dataExpression: columnFetched.dataExpression,
      sources: columnFetched.sources,
    })

    // direction doesn't matter if dropExistingData is truue
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[columnFetched.id].itemListIds = [
        newsFeedColumns[0].itemListIds[0],
        newsFeedColumns[4].itemListIds[0],
      ]
      draft.columnById[columnFetched.id].newestItemId =
        newsFeedColumns[4].itemListIds[0]
      draft.columnById[columnFetched.id].refreshedAt = new Date(
        fakeTime,
      ).toISOString()
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataSuccessAction),
    ).toEqual(newState)
  })

  test('should update column when fetching column data success - direction: OLD, dropExistingData: false', () => {
    const columnFetched = newsFeedColumns[0]
    const newsFeedData = [
      {
        id: newsFeedColumns[0].itemListIds[0], // existing
        cursor: 1000,
      },
      {
        id: newsFeedColumns[4].itemListIds[0], // new
        cursor: 1040,
      },
    ]
    const fetchColumnDataSuccessAction = fetchColumnDataSuccess({
      columnId: columnFetched.id,
      direction: 'OLD',
      data: newsFeedData,
      updatedAt: columnFetched.updatedAt,
      dropExistingData: false,
      dataByNodeId: {},
      dataExpression: columnFetched.dataExpression,
      sources: columnFetched.sources,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[columnFetched.id].itemListIds = [
        newsFeedColumns[0].itemListIds[0], // existing
        newsFeedColumns[0].itemListIds[1],
        newsFeedColumns[4].itemListIds[0], // new
      ]
      draft.columnById[columnFetched.id].newestItemId =
        newsFeedColumns[0].itemListIds[1]
      draft.columnById[columnFetched.id].refreshedAt = new Date(
        fakeTime,
      ).toISOString()
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataSuccessAction),
    ).toEqual(newState)
  })

  test('should update no column when fetching column data success for columnId not in the state', () => {
    const fetchColumnDataSuccessAction = fetchColumnDataSuccess({
      columnId: invalidColumnId,
      direction: 'NEW',
      data: [],
      updatedAt: newsFeedColumns[4].updatedAt,
      dropExistingData: false,
      dataByNodeId: {},
      dataExpression: undefined,
      sources: [],
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataSuccessAction),
    ).toEqual(getState([0, 1, 2]))
  })

  // case 'FETCH_COLUMN_DATA_FAILURE':
  test('should update column when fetching volumn data failure', () => {
    const fetchColumnDataFailureAction = fetchColumnDataFailure({
      columnId: newsFeedColumns[0].id,
    })
    const newState = immer(getState([0, 1, 2]), (draft) => {
      draft.columnById[newsFeedColumns[0].id].refreshedAt = new Date(
        fakeTime,
      ).toISOString()
      draft.columnById[newsFeedColumns[0].id].state = 'not_loaded'
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataFailureAction),
    ).toEqual(newState)
  })

  test('should update no column when fetching volumn data failure for invalid columnId', () => {
    const fetchColumnDataFailureAction = fetchColumnDataFailure({
      columnId: invalidColumnId,
    })
    expect(
      columnsReducer(getState([0, 1, 2]), fetchColumnDataFailureAction),
    ).toEqual(getState([0, 1, 2]))
  })
  // MARK_ITEM_AS_SAVED
  test('should mark item as saved/unsaved', () => {
    const itemNodeId = newsFeedDataArray[0].id
    expect(defaultState.savedDataIds.includes(itemNodeId)).toBe(false)
    const saveAction = markItemAsSaved({
      itemNodeId,
      save: true,
    })
    const itemSavedState = columnsReducer(defaultState, saveAction)
    expect(itemSavedState.savedDataIds.includes(itemNodeId)).toBe(true)
    expect(itemSavedState.dataById[itemNodeId].isSaved).toBe(true)

    const unsaveAction = markItemAsSaved({
      itemNodeId,
      save: false,
    })
    const itemUnsavedState = columnsReducer(itemSavedState, unsaveAction)
    expect(itemUnsavedState.savedDataIds.includes(itemNodeId)).toBe(false)
    expect(itemUnsavedState.dataById[itemNodeId].isSaved).toBe(false)
  })

  test('should not change state if id is not in data', () => {
    const saveAction = markItemAsSaved({
      itemNodeId: invalidItemNodeId,
      save: true,
    })
    expect(columnsReducer(defaultState, saveAction)).toEqual(defaultState)

    const unsaveAction = markItemAsSaved({
      itemNodeId: invalidItemNodeId,
      save: false,
    })
    expect(columnsReducer(defaultState, unsaveAction)).toEqual(defaultState)
  })

  // MARK_ITEM_AS_READ
  test('should mark item as read/unread', () => {
    const readIds = [newsFeedDataArray[1].id, newsFeedDataArray[3].id]
    const unchangedIds = [newsFeedDataArray[0].id, newsFeedDataArray[2].id]

    readIds.map((readId) => {
      expect(defaultState.dataById[readId].isRead).toBe(false)
    })
    unchangedIds.map((unchangedId) => {
      expect(defaultState.dataById[unchangedId].isRead).toBe(true)
    })

    const readAction = markItemAsRead({
      itemNodeIds: readIds,
      read: true,
    })
    const readState = columnsReducer(defaultState, readAction)
    readIds.map((readId) => {
      expect(readState.dataById[readId].isRead).toBe(true)
    })
    unchangedIds.map((unchangedId) => {
      expect(defaultState.dataById[unchangedId].isRead).toBe(true)
    })

    const unreadAction = markItemAsRead({
      itemNodeIds: readIds,
      read: false,
    })
    const unreadState = columnsReducer(readState, unreadAction)
    readIds.map((readId) => {
      expect(unreadState.dataById[readId].isRead).toBe(false)
    })
    unchangedIds.map((unchangedId) => {
      expect(defaultState.dataById[unchangedId].isRead).toBe(true)
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

    expect(defaultState.dataById[newsFeedDataArray[4].id]).toBe(undefined)
    expect(defaultState.allDataIds.includes(newsFeedDataArray[4].id)).toBe(
      false,
    )
    expect(defaultState.dataById[newsFeedDataArray[0].id]).toEqual(
      newsFeedDataArray[0],
    )
    expect(defaultState.allDataIds.includes(newsFeedDataArray[0].id)).toBe(true)

    // newsFeedDataArray[4] is new
    const updatedState = columnsReducer(defaultState, action)
    expect(updatedState.dataById[newsFeedDataArray[4].id]).toBe(
      newsFeedDataArray[4],
    )
    expect(updatedState.allDataIds.includes(newsFeedDataArray[4].id)).toBe(true)
    expect(updatedState.dataById[newsFeedDataArray[0].id]).toEqual(
      newsFeedDataArray[0],
    )
    expect(updatedState.allDataIds.includes(newsFeedDataArray[0].id)).toBe(true)
  })

  // FETCH_POST, FETCH_POST_SUCCESS, FETCH_POST_FAILURE
  test('should update state for fetching post either success or failure', () => {
    // fetch post for newsFeedDataArray[4]
    let id = newsFeedDataArray[4].id
    let data = newsFeedDataArray[4]
    let fetchPostAction = fetchPost({ id })
    expect(defaultState.loadingDataId).toBe('')
    let updatedState = columnsReducer(defaultState, fetchPostAction)
    expect(updatedState.loadingDataId).toBe(id)

    // fetch success for newsFeedDataArray[4]
    expect(updatedState.dataById[id]).toBe(undefined)
    expect(updatedState.allDataIds.includes(id)).toBe(false)
    const fetchPostSuccessAction = fetchPostSuccess({ id, data })
    updatedState = columnsReducer(updatedState, fetchPostSuccessAction)
    expect(updatedState.loadingDataId).toBe('')
    expect(updatedState.allDataIds.includes(id)).toBe(true)
    expect(updatedState.dataById[id]).toBe(data)

    // fetch post for newsFeedDataArray[5]
    id = newsFeedDataArray[5].id
    data = newsFeedDataArray[5]
    fetchPostAction = fetchPost({ id })
    expect(defaultState.loadingDataId).toBe('')
    updatedState = columnsReducer(defaultState, fetchPostAction)
    expect(updatedState.loadingDataId).toBe(id)

    // fetch failure for newsFeedDataArray[5]
    expect(updatedState.dataById[id]).toBe(undefined)
    const fetchPostFailureAction = fetchPostFailure({ id })
    updatedState = columnsReducer(updatedState, fetchPostFailureAction)
    expect(updatedState.loadingDataId).toBe('')
    expect(updatedState.allDataIds.includes(id)).toBe(false)
  })
})
