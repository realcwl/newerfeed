import { ThemeColors } from './themes'

// Although it seems unnecessary to do a one level indirect here, it gives us
// the extensability to expand this Column to be more than news feed. For
// example, in the future we might want to define a TrendingSearchColumn, and
// we could just expand Column to be
// export type Column =
// | NewsfeedColumn
// | TrendingSearchColumn;
export type Column = NewsFeedColumn

// Newsfeed column.
export type COLUMN_TYPE_NEWS_FEED = 'COLUMN_TYPE_NEWS_FEED'

// Each column extends the BaseColumn, where some common fields are defined.
export interface NewsFeedColumn extends BaseColumn {
  // Constant defined in another place.
  type: COLUMN_TYPE_NEWS_FEED

  // itemListIds is a list containing all Newsfeed data that are going to be
  // rendered inside this column. Only data ids are stored, the actual data
  // should be retrieved from the data reducer.
  itemListIds: string[]

  // Id of the last item (earliest item) in this column.
  lastItemId: string

  // Id of the first item (latest item) in this column.
  firstItemId: string

  // Each news column must also have multiple News Sources. Each source is
  // comprised of main type and subtype. E.g. (Weibo, <user_id>).
  sources: NewsFeedColumnSources

  // Each news column can have a data filter composed of a logical expression.
  // This is stored in the column so that it can pull new data with those
  // expression from backend. Note that frondend doesn't actually use this
  // expression, this expression is passed to backend as part of the pull
  // request, and backend filters data based on this expression.
  dataExpression?: NewsFeedDataExpression

  // Different from NewsFeedDataExpression, filter is a purely frontend data
  // that is used to quickly filter column data to let user find useful
  // information.
  filter?: ColumnFilter
}

export interface NewsFeedColumnSources {
  // A list of source that forms this column.
  sources: NewsFeedColumnSource[]
}

export interface NewsFeedColumnSource {
  // Source is a predefined list of information sources, such as "weibo",
  // "twitter", "caixin".
  source: string

  // Subtypes is a predefined list of subtypes of type string.
  subtypes: string[]
}

// Base column datastructure.
export interface BaseColumn {
  id: string

  // Title of the Column, user defined.
  title: string

  // creation time as denoted in the frontend.
  createdAt: string

  // Last update time.
  updatedAt: string
}

export interface NewsFeedDataExpression {
  // Expression can be any of the following type.
  expr: AllOf | AnyOf | NotTrue | Predicate
}

export type PredicateType = 'LITERAL'

export interface LiteralPredicateParam {
  str: string
}

export type PredicateParam = LiteralPredicateParam

export interface Predicate {
  // PredicateType is a predefined list of string.
  type: PredicateType
  // A PredicateParam is a predefined list of params matching the predicate.
  param?: PredicateParam
}

export interface AllOf {
  // AllOf contains a list of objects. A content is valid if all of the
  // expressions are evaluated to true.
  allOf: NewsFeedDataExpression[]
}

export interface AnyOf {
  // AnyOf contains a list of objects. A content is valid if any of the
  // expression is evaluated to true.
  anyOf: NewsFeedDataExpression[]
}

export interface NotTrue {
  // A content is valid if the expression is evaluated false.
  notTrue: NewsFeedDataExpression
}

export interface ColumnFilter {
  // Render the data only when the content string.Contains(query).
  query?: string
  // Show only saved data.
  saved?: boolean
  // Show only unread data.
  unread?: boolean
  // more filters when needed...
}

export interface NewsFeedData {
  id: string
  // message shown to user.
  message: string
  // if this is not null, user can click a card to go to original page.
  url: string | undefined
  // A list of attachment that will be rendered together with this card.
  attachments: Attachment[]
  // This is the timestamp of original post
  postTimestamp: Date
  // We might not be able to get postTimestamp
  // in which case we use crawledTimestamp as alternative
  crawledTimestamp: Date
  // It is a linked list of all repost/retweet
  repostedFrom: NewsFeedData
  // When this field is a string,
  // which is the parent data ID, don't render it
  parent: string | undefined
  // Put all deplicate children messages.
  duplicateIds: string[] | undefined
}

export interface Attachment {
  id: string
  dataType: 'img' | 'pdf' | 'other'
  url: string
}

export interface User {
  // User's id, used when retrieving personalized content (e.g. User's sharing)
  id: string

  // User name, created during the account creation process.
  name: string

  // User's avartar. If not provided we'll use a random default icon.
  avatarUrl: string | null
}

export type ModalPayload =
  | {
      name: 'ADD_COLUMN'
      params?: undefined
    }
  | {
      name: 'ADD_COLUMN_DETAILS'
      params?: undefined
    }
  | {
      name: 'ADVANCED_SETTINGS'
      params?: undefined
    }
  | {
      name: 'KEYBOARD_SHORTCUTS'
      params?: undefined
    }
  | {
      name: 'SETTINGS'
      params?: undefined
    }

export type ModalPayloadWithIndex = ModalPayload & { index: number }

export type LoadState = 'error' | 'loaded' | 'loading' | 'not_loaded'

export type EnhancedLoadState = LoadState | 'loading_first' | 'loading_more'

export type EnhancementCache = Map<
  string,
  false | { timestamp: number; data: any }
>

export type AppViewMode = 'single-column' | 'multi-column'

export interface BannerMessage {
  id: string
  message: string
  href?: string
  openOnNewTab?: boolean
  disableOnSmallScreens?: boolean
  minLoginCount?: number
  closedAt?: string | undefined
  createdAt?: string
}

export interface ItemFilterCountMetadata {
  read: 0
  unread: 0
  saved: 0
  total: 0
}

export type DesktopOS = 'macos' | 'windows' | 'linux'
export type MobileOS = 'ios' | 'android'
export type OS = DesktopOS | MobileOS

export interface ItemPushNotification<
  A extends { type: string; payload: any } = { type: string; payload: any },
> {
  title: string
  subtitle?: string
  body: string
  imageURL?: string
  onClickDispatchAction?: A
}

export interface GenericIconProp {
  family: string
  name: string
  color?: keyof ThemeColors
}
