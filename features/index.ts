export * from './queries'
export * from './client'

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import multicall from './multicall/reducer'
import application from './application/reducer'
import farm from './farm/farmSlice'

const store = configureStore({
  reducer: {
    multicall,
    application,
    farm,
  },
  middleware: [...getDefaultMiddleware({ thunk: false })],
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
