import { ThemeName, ThemePair } from '../types'

const pkg = require('../../package.json') // eslint-disable-line

export const APP_VERSION = `${pkg.version || ''}`.replace(/\-\d+$/g, '')

const _window = typeof window !== 'undefined' ? window : undefined
export const HOSTNAME =
  _window &&
  _window.location &&
  _window.location.hostname &&
  _window.location.hostname

export const IS_BETA =
  APP_VERSION.includes('beta') || (!!HOSTNAME && HOSTNAME.includes('beta'))

export const REGEX_IS_URL =
  /(https?|ftp|smtp):\/\/(www.)?[a-zA-Z0-9]+\.[a-zA-Z]+(\/[a-zA-Z0-9#-]+)*\/?/g

export const COLUMNS_LIMIT = 25
export const MIN_COLUMN_WIDTH = 300
export const MAX_COLUMN_WIDTH = 340

export const DISABLE_ANIMATIONS = false
export const DISABLE_SWIPEABLE_CARDS = false

export const DEFAULT_DARK_THEME: ThemeName = 'dark-gray'
export const DEFAULT_LIGHT_THEME: ThemeName = 'light-white'
export const DEFAULT_THEME_PAIR: ThemePair = {
  id: 'auto',
  color: '',
}

export const DEFAULT_GITHUB_OAUTH_SCOPES = ['notifications', 'user:email']
export const FULL_ACCESS_GITHUB_OAUTH_SCOPES =
  DEFAULT_GITHUB_OAUTH_SCOPES.includes('repo')
    ? DEFAULT_GITHUB_OAUTH_SCOPES
    : [...DEFAULT_GITHUB_OAUTH_SCOPES, 'repo']

// unfortunately github permissions are still not granular enough.
// code permission is required to support some events, e.g. commits
export const GITHUB_APP_HAS_CODE_ACCESS = true

export const ENABLE_GITHUB_OAUTH_SUPPORT = true
export const ENABLE_GITHUB_APP_SUPPORT = true
export const ENABLE_GITHUB_PERSONAL_ACCESS_TOKEN_SUPPORT = true

export const LOCAL_ONLY_PERSONAL_ACCESS_TOKEN = true

export const APPSTORE_ID = '1191864199'
export const GOOGLEPLAY_ID = 'com.devhubapp'

export const APP_BASE_URL = 'rnr.capital'
export const API_BASE_URL = 'rnr.capital'
export const GRAPHQL_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? `https://${APP_BASE_URL}/api/graphql`
    : 'http://localhost:8080/api/graphql'
export const GRAPHQL_SUBSCRIPTION_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? `wss://${APP_BASE_URL}/api/subscription`
    : 'ws://localhost:8080/api/subscription'
export const CURRENT_APP_URL =
  process.env.NODE_ENV === 'production'
    ? `https://${APP_BASE_URL}`
    : 'http://localhost:3000'

const LANDING_BASE_URL = 'https://devhubapp.com'
export const DEVHUB_LINKS = {
  LANDING_PAGE_HOME: LANDING_BASE_URL,
  ACCOUNT_PAGE: `${LANDING_BASE_URL}/account`,
  DOWNLOAD_PAGE: `${LANDING_BASE_URL}/download`,
  PRICING_PAGE: `${LANDING_BASE_URL}/pricing`,
  SUBSCRIBE_PAGE: `${LANDING_BASE_URL}/subscribe`,
  SLACK_INVITATION: 'https://slack.devhubapp.com',
  GITHUB_REPOSITORY: 'https://github.com/devhubapp/devhub',
  TWITTER_PROFILE: 'https://twitter.com/devhub_app',
}

export const APP_DEEP_LINK_SCHEMA = 'devhub'
export const APP_DEEP_LINK_URLS = {
  github_oauth: `${APP_DEEP_LINK_SCHEMA}://github/oauth`,
  preferences: `${APP_DEEP_LINK_SCHEMA}://preferences`,
  pricing: `${APP_DEEP_LINK_SCHEMA}://pricing`,
  redux: `${APP_DEEP_LINK_SCHEMA}://redux`,
  subscribe: `${APP_DEEP_LINK_SCHEMA}://purchase`,
}

// prettier-ignore
export const EMPTY_ARRAY = []

// prettier-ignore
export const EMPTY_OBJ = {}

// banner related
// delay for banner auto closure in ms.
export const BANNER_AUTO_CLOSE_DURATION = 3000

// how many posts to fetch in one batch.
export const FEED_FETCH_LIMIT = 15

// how long in milli-second do we consider a column to be out of sync.
export const COLUMN_OUT_OF_SYNC_TIME_IN_MILLI_SECOND = 1000 * 60 * 1 // 1 minute

// Error code when cognito fail due to lost connection.
export const COGNITO_NETWORK_ERROR_CODE = 'NetworkError'

export const SOURCE_NAMES_ENABLE_ADD_SUBSOURCE = ['微博', '推特']

// Hamming distance for 2 posts to be considered as semantically identical.
// For 2 x 128 bit hashing, if with maximal entrophy, the chance of hamming
// distance < 37 is C(128, 91)/(2^128) < 0.0001% which is pretty safe.
export const SIMILARITY_THRESHOLD = 37

// Only consider 2 posts to be similar if they are posted within this time
// window.
export const SIMILARITY_WINDOW_MILLISECOND = 1000 * 60 * 60 // 1 hour

export enum AddSourceStatus {
  Loading = 'LOADING',
  Loaded = 'LOADED',
  Failed = 'FAILED',
}

export enum TryCustomizedCrawlerStatus {
  Loading = 'LOADING',
  Loaded = 'LOADED',
  Failed = 'FAILED',
}

export enum AddSubSourceStatus {
  Loading = 'LOADING',
  Loaded = 'LOADED',
  Failed = 'FAILED',
}
