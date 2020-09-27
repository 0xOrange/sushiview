export * from './queries'
export * from './client'

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import multicall from './multicall/reducer'
import application from './application/reducer'
import farm from './farm/farmSlice'
import compare from './compare/compareSlice'

const store = configureStore({
  reducer: {
    multicall,
    application,
    farm,
    compare,
  },
  middleware: [...getDefaultMiddleware({ thunk: false })],
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
