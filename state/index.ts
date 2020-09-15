export * from './queries'
export * from './client'

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import multicall from './multicall/reducer'
import application from './application/reducer'

const store = configureStore({
  reducer: {
    multicall,
    application,
  },
  middleware: [...getDefaultMiddleware({ thunk: false })],
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
