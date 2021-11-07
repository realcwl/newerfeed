import {
  BrowserRouter,
  Switch as WebSwitch,
  Route as WebRoute,
  Link as WebLink,
  Redirect as WebRedirect,
  RouteProps as WebRouteProps,
  useParams as WebUseParams,
  useHistory as WebUseHisotry,
} from 'react-router-dom'

export const Router = BrowserRouter
export const Route = WebRoute
export const Switch = WebSwitch
export const link = WebLink
export const Redirect = WebRedirect
export const useParams = WebUseParams
export const useHistory = WebUseHisotry
export type RouteProps = WebRouteProps
