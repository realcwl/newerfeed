import { NewsFeedData } from '@devhub/core'
import _ from 'lodash'

import { Reducer } from '../types'
import immer from 'immer'

export interface State {
  // Contains all data IDs, that can be referenced by multiple columns.
  allIds: string[]
  // Contains data id to actual data mapping.
  byId: Record<string, NewsFeedData>
  // Saved ID list that can be rendered together in the Saved column.
  savedIds: string[]
  // Last time the data list is updated.
  updatedAt: string | undefined
}

const initialState: State = {
  allIds: ['dummyCard', 'dummyCard2', 'dummyCard3'],
  byId: {
    dummyCard: {
      id: 'dummyCard',
      title: `I am dummyCard's dummy title with more than one line as well`,
      text: `first card with some real real real long descriptions www.google.com and real long text and see if it works shorturl.at/ijksA !`,
      author: {
        avatar: {
          imageURL:
            'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
        },
        name: 'John Doe',
        profileURL: '/',
      },
      crawledTimestamp: new Date('2021-01-02'),
      attachments: [
        {
          id: 'dummyImg',
          dataType: 'img',
          url: 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aGQlMjBpbWFnZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
        },
        {
          id: 'dummyImg2',
          dataType: 'img',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/2560px-Image_created_with_a_mobile_phone.png',
        },
      ],
      isSaved: false,
      isRead: false,
    },
    dummyCard2: {
      id: 'dummyCard2',
      title: `I am dummyCard2's dummy title with more than one line as well`,
      text: `www.facebook.com second card with some descriptions!`,
      author: {
        avatar: {
          imageURL:
            'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
        },
        name: 'John Doe',
        profileURL: '/',
      },
      attachments: [
        {
          id: 'dummyData3',
          dataType: 'img',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TEIDE.JPG/2880px-TEIDE.JPG',
        },
        {
          id: 'dummyData4',
          dataType: 'img',
          url: 'https://hbimg.huabanimg.com/300251098bb1d62a1d89f40c2e8018bbb415414c912fc-5z5wMR_fw658',
        },
      ],
      crawledTimestamp: new Date('2021-05-02'),
      isSaved: false,
      isRead: false,
    },
    dummyCard3: {
      id: 'dummyCard3',
      title: `I am dummyCard3's dummy title with more than one line as well`,
      text: `third card with some longest descriptions \nwww.google.com and real long text \n
      and see if it works shorturl.at/ijksA again\n let's see!`,
      author: {
        avatar: {
          imageURL:
            'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
        },
        name: 'John Doe',
        profileURL: '/',
      },
      crawledTimestamp: new Date('2021-06-02'),
      isSaved: false,
      isRead: false,
    },
  },
  savedIds: [],
  updatedAt: undefined,
}

export const dataReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_FEEDS_SUCCESS':
      return immer(state, (draft) => {
        if (!!action.payload?.feeds && action.payload.feeds.length > 0) {
          for (const feed of action.payload.feeds) {
            // Asuume all returned posts are in descending timestamp order
            for (const post of feed.posts.slice().reverse()) {
              if (post.id in draft.byId) {
                continue
              }
              draft.allIds.unshift(post.id)
              draft.byId[post.id] = {
                id: post.id,
                title: post.title,
                text: 'whatever',
                crawledTimestamp: new Date(),
                isSaved: false,
                isRead: false,
              }
            }
          }
        }
        console.log('draft', draft.allIds)
      })
    case 'MARK_ITEM_AS_SAVED':
      return immer(state, (draft) => {
        const { itemNodeId, save } = action.payload
        const now = new Date().toISOString()
        if (!(itemNodeId in draft.byId)) {
          // if the item isn't in the data list, it indicates that we might
          // encountered an error and should return directly.
          console.warn(
            "trying to favorite/unfavorite an item that's not in the data list: ",
            itemNodeId,
          )
          return
        }
        const entry = draft.byId[itemNodeId]
        entry.isSaved = save
        draft.updatedAt = now
      })
    case 'MARK_ITEM_AS_READ':
      return immer(state, (draft) => {
        const { itemNodeId, read } = action.payload
        const now = new Date().toISOString()
        if (!(itemNodeId in draft.byId)) {
          // if the item isn't in the data list, it indicates that we might
          // encountered an error and should return directly.
          console.warn(
            "trying to favorite/unfavorite an item that's not in the data list: ",
            itemNodeId,
          )
          return
        }
        const entry = draft.byId[itemNodeId]
        entry.isRead = read
        draft.updatedAt = now
      })
    default:
      return state
  }
}
