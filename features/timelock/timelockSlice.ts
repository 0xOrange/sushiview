import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FetchError } from '../../utils'

const TIMELOCK_SLICE = 'timelock'

export interface TimelockState {
  fetchError: FetchError | null
  timelocks: Timelock[] | null
}
export interface Timelock {
  id: string
  eta: number
  functionName: string
  data: string
  targetAddress: string
  isCancelled: boolean
  isExecuted: boolean
  createdAt: number
  expiresAt: number
  cancelledAt: number | null
  executedAt: number | null
  createdTx: string
  executedTx: string | null
  cancelledTx: string | null
}

const initialState: TimelockState = {
  fetchError: null,
  timelocks: null,
}

const timelockSlice = createSlice({
  name: TIMELOCK_SLICE,
  initialState,
  reducers: {
    setTimelocks(state, action: PayloadAction<Timelock[]>) {
      state.timelocks = action.payload
      state.fetchError = null
    },
    setFetchError(state, action: PayloadAction<FetchError>) {
      state.fetchError = action.payload
    },
  },
})

export default timelockSlice.reducer
export const { setTimelocks, setFetchError } = timelockSlice.actions
export { TIMELOCK_SLICE }
