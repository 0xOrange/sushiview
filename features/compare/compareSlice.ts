import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const COMPARE_SLICE = 'compare'

export interface CompareState {
  uniPriceTable: PriceTable[] | null
  sushiPriceTable: PriceTable[] | null
  fetchError: FetchError | null
}

export interface FetchError {
  code: number
  message: string
}

export interface PriceTable {
  id: string
  symbol: string
  priceUSD: string
  liquidityUSD: string
  volumeUsd: string
}

const initialState: CompareState = {
  uniPriceTable: null,
  sushiPriceTable: null,
  fetchError: null,
}

const compareSlice = createSlice({
  name: COMPARE_SLICE,
  initialState,
  reducers: {
    updateSushiPriceData(state, action: PayloadAction<PriceTable[] | null>) {
      state.sushiPriceTable = action.payload
    },
    updateUniPriceData(state, action: PayloadAction<PriceTable[] | null>) {
      state.uniPriceTable = action.payload
    },
    setFetchError(state, action: PayloadAction<FetchError>) {
      state.fetchError = action.payload
    },
  },
})

export default compareSlice.reducer
export const { updateSushiPriceData, updateUniPriceData, setFetchError } = compareSlice.actions
export { COMPARE_SLICE }
