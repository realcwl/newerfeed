import _ from 'lodash'
import { RootState } from './types'

// Define migration strategy, where version is defined in store.ts
// Each migration is composed of a version number VERSION and a migration
// strategy callback function `MIGRATOR(state: RootState)`, defines how to
// transform the redux store from *${VERSION} - 1 => {VERSION}*. The new redux
// store state will be MIGRATOR(RootState_${VERSION-1}).
// Note that in the case where user's version is way behind the production
// version, each migrator will be executed sequentially to bump user version to
// latest.
//
// The simplest usecase is when we're rolling out a new version of frontend code
// which isn't compatible with existing local redux storage. In this case we'll
// define a migration, which simply kicks user out of the current session using
// the following migrator:
//
// ${VERSION}: (state: RootState) => {
//   return {
//     config: state.config,
//   }
// },
//
// We keep only config to retain the color theme.
// For more details refer to: https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md
export default {
  0: (state: RootState) => {
    return { config: state.config }
  },
  1: (state: RootState) => {
    return {
      config: state.config,
    }
  },
  2: (state: RootState) => {
    return {
      config: state.config,
    }
  },
  3: (state: RootState) => {
    return {
      config: state.config,
    }
  },
}
