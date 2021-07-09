import { Middleware } from '../types'

export const devhubMiddleware: Middleware = (store) => {
  return (next) => (action) => {
    switch (action?.type) {
      default: {
        next(action)
        break
      }
    }
  }
}
