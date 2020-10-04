import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FetchError } from '../../utils'
import JSBI from 'jsbi'

const FARM_SLICE = 'farm'

export interface FarmState {
  sushiData: SushiData | null
  sushiMenu: ISushiMenu[] | null
  fetchError: FetchError | null
  sushiMenuListeners: number
}

interface TokenReserve {
  id: string
  symbol: string
  reserve: number
  valueUSD: number
}
export interface ISushiMenu {
  token0: TokenReserve
  token1: TokenReserve
  pairID: string
  totalValueUSD: number
  totalValueUsd24HChange: number
  liquidityTokenBalance: number
  rewardPerHour: number
  hourlyROI: number
}

export interface SushiData {
  sushiBarTotalSupply: JSBI
  totalSupply: JSBI
  valueUSD: number
  marketCap: number
}

const initialState: FarmState = {
  sushiData: null,
  fetchError: null,
  sushiMenu: null,
  sushiMenuListeners: 0,
}

const farmsSlice = createSlice({
  name: FARM_SLICE,
  initialState,
  reducers: {
    updateSushiData(state, action: PayloadAction<SushiData>) {
      state.sushiData = action.payload
      state.fetchError = null
    },
    setFetchError(state, action: PayloadAction<FetchError>) {
      state.fetchError = action.payload
    },
    updateSushiMenu(state, action: PayloadAction<ISushiMenu[]>) {
      state.sushiMenu = action.payload
      state.fetchError = null
    },
  },
})

export default farmsSlice.reducer
export const { updateSushiData, updateSushiMenu, setFetchError } = farmsSlice.actions
export { FARM_SLICE }
