import {
  NativeRouter,
  Switch as NativeSwitch,
  Route as NativeRoute,
  Link as NativeLink,
  Redirect as NativeRedirect,
  RouteProps as NativeRouteProps,
  useParams as NativeUseParams,
  useHistory as NativeHistory,
} from 'react-router-native'

export const Router = NativeRouter
export const Route = NativeRoute
export const Switch = NativeSwitch
export const link = NativeLink
export const Redirect = NativeRedirect
export const useParams = NativeUseParams
export const useHistory = NativeHistory
export type RouteProps = NativeRouteProps
