import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { TimeFrame } from '../constants'
import { healthClient, SUBGRAPH_HEALTH } from '../features'
dayjs.extend(utc)

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_SESSION_START = 'UPDATE_SESSION_START'
const UPDATE_WEB3 = 'UPDATE_WEB3'
const UPDATED_SUPPORTED_TOKENS = 'UPDATED_SUPPORTED_TOKENS'
const UPDATE_LATEST_BLOCK = 'UPDATE_LATEST_BLOCK'

const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SESSION_START = 'SESSION_START'
const WEB3 = 'WEB3'
const LATEST_BLOCK = 'LATEST_BLOCK'

const ApplicationContext = createContext(null)

export function useLatestBlock(): number | null {
  const [state, { updateLatestBlock }] = useApplicationContext()

  const latestBlock = state?.[LATEST_BLOCK]

  useEffect(() => {
    async function fetch() {
      try {
        const res = await healthClient.query({
          query: SUBGRAPH_HEALTH,
        })
        const block = res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        if (block) {
          updateLatestBlock(block)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!latestBlock) {
      fetch()
    }
  }, [latestBlock, updateLatestBlock])

  return latestBlock
}

function useApplicationContext() {
  return useContext(ApplicationContext)
}

const INITIAL_STATE = {
  CURRENCY: 'USD',
  TIME_KEY: TimeFrame.ALL_TIME,
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { currency } = payload
      return {
        ...state,
        [CURRENCY]: currency,
      }
    }
    case UPDATE_TIMEFRAME: {
      const { newTimeFrame } = payload
      return {
        ...state,
        [TIME_KEY]: newTimeFrame,
      }
    }
    case UPDATE_SESSION_START: {
      const { timestamp } = payload
      return {
        ...state,
        [SESSION_START]: timestamp,
      }
    }
    case UPDATE_WEB3: {
      const { web3 } = payload
      return {
        ...state,
        [WEB3]: web3,
      }
    }

    case UPDATE_LATEST_BLOCK: {
      const { block } = payload
      return {
        ...state,
        [LATEST_BLOCK]: block,
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }: { children: any }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const update = useCallback((currency) => {
    dispatch({
      type: UPDATE,
      payload: {
        currency,
      },
    })
  }, [])

  // global time window for charts - see timeframe options in constants
  const updateTimeframe = useCallback((newTimeFrame) => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame,
      },
    })
  }, [])

  // used for refresh button
  const updateSessionStart = useCallback((timestamp) => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp,
      },
    })
  }, [])

  const updateWeb3 = useCallback((web3) => {
    dispatch({
      type: UPDATE_WEB3,
      payload: {
        web3,
      },
    })
  }, [])

  const updateSupportedTokens = useCallback((supportedTokens) => {
    dispatch({
      type: UPDATED_SUPPORTED_TOKENS,
      payload: {
        supportedTokens,
      },
    })
  }, [])

  const updateLatestBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block,
      },
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(
        () => [
          state,
          { update, updateSessionStart, updateTimeframe, updateWeb3, updateSupportedTokens, updateLatestBlock },
        ],
        [state, update, updateTimeframe, updateWeb3, updateSessionStart, updateSupportedTokens, updateLatestBlock],
      )}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useTimeframe(): [TimeFrame, (TimeFrame) => any] {
  const [state, { updateTimeframe }] = useApplicationContext()
  const activeTimeframe = state?.[TIME_KEY]
  return [activeTimeframe, updateTimeframe]
}
