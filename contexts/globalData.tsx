import React, { createContext, useContext, useEffect, useMemo, useCallback, useReducer, useState } from 'react'
import dayjs from 'dayjs'
import {
  getPercentChange,
  getBlockFromTimestamp,
  getTimeframe,
  get2DayPercentChange,
  getBlocksFromTimestamps,
} from '../utils'
import { exchangeClient } from '../gql/client'
import { ETH_PRICE, GLOBAL_CHART, GLOBAL_DATA } from '../gql/queries'
import { useTimeframe } from './application'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ExchangeSource, factoryAddress } from '../constants'
import _get from 'lodash/get'
dayjs.extend(utc)
dayjs.extend(weekOfYear)

const GlobalDataContext = createContext(null)

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

export function useEthPrice(exchangeSource: ExchangeSource) {
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const ethPrice = _get(state, `${exchangeSource}.${ETH_PRICE_KEY}`, null)
  const ethPriceOld = _get(state, `${exchangeSource}.oneDayPrice`, null)

  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice(exchangeSource)
        updateEthPrice(exchangeSource, newPrice, oneDayPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice])

  return [ethPrice, ethPriceOld]
}

const getEthPrice = async (exchangeSource: ExchangeSource) => {
  const client = exchangeClient[exchangeSource]
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
    const result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first',
    })
    const resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

export function useGlobalData(exchangeSource: ExchangeSource) {
  const [state, { update, updateAllPairsInUniswap, updateAllTokensInUniswap }] = useGlobalDataContext()
  const [ethPrice, oldEthPrice] = useEthPrice(exchangeSource)

  const data = _get(state, `globalData.${exchangeSource}`, null)
  useEffect(() => {
    async function fetchData() {
      const globalData = await getGlobalData(exchangeSource, ethPrice, oldEthPrice)
      globalData && update(exchangeSource, globalData)
    }
    if (!data && ethPrice && oldEthPrice) {
      fetchData()
    }
  }, [ethPrice, oldEthPrice, update, data, updateAllPairsInUniswap, updateAllTokensInUniswap])

  return data || {}
}

export function useGlobalChartData(source: ExchangeSource) {
  const [state, { updateChart }] = useGlobalDataContext()
  const [oldestDateFetch, setOldestDateFetched] = useState<any>()
  const [activeWindow] = useTimeframe()

  const chartDataDaily = _get(state, `chartData.${source}.daily`, null)
  const chartDataWeekly = _get(state, `chartData.${source}.weekly`, null)

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    // based on window, get starttime
    const startTime = getTimeframe(activeWindow)

    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  /**
   * Fetch data if none fetched or older data is needed
   */
  useEffect(() => {
    async function fetchData() {
      // historical stuff for chart
      const [newChartData, newWeeklyData] = await getChartData(source, oldestDateFetch)
      updateChart(source, newChartData, newWeeklyData)
    }

    if (oldestDateFetch && !(chartDataDaily && chartDataWeekly)) {
      fetchData()
    }
  }, [chartDataDaily, chartDataWeekly, oldestDateFetch, updateChart])

  return [chartDataDaily, chartDataWeekly]
}

async function getGlobalData(exchangeSource: ExchangeSource, ethPrice, oldEthPrice) {
  const client = exchangeClient[exchangeSource]
  const factory = factoryAddress[exchangeSource]
  // data for each day , historic data used for % changes
  let data: any = {}
  let oneDayData: any = {}
  let twoDayData: any = {}

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()

    // get the blocks needed for time travel queries
    const [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack,
    ])

    // fetch the global data
    const result = await client.query({
      query: GLOBAL_DATA(factory),
      fetchPolicy: 'cache-first',
    })
    data = result.data.uniswapFactories[0]

    // fetch the historical data
    const oneDayResult = await client.query({
      query: GLOBAL_DATA(factory, oneDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    oneDayData = oneDayResult.data.uniswapFactories[0]

    const twoDayResult = await client.query({
      query: GLOBAL_DATA(factory, twoDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    twoDayData = twoDayResult.data.uniswapFactories[0]

    const oneWeekResult = await client.query({
      query: GLOBAL_DATA(factory, oneWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const oneWeekData = oneWeekResult.data.uniswapFactories[0]

    const twoWeekResult = await client.query({
      query: GLOBAL_DATA(factory, twoWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const twoWeekData = twoWeekResult.data.uniswapFactories[0]

    // data && oneDayData && twoDayData && twoWeekData
    if (data) {
      if (oneDayData && twoDayData) {
        const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
          data.untrackedVolumeUSD,
          oneDayData.untrackedVolumeUSD ? oneDayData.untrackedVolumeUSD : 0,
          twoDayData.untrackedVolumeUSD ? twoDayData.untrackedVolumeUSD : 0,
        )
        data.oneDayVolumeUSD = oneDayVolumeUSD
        data.volumeChangeUSD = volumeChangeUSD
      }

      if (oneWeekData && twoWeekData) {
        const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
          data.untrackedVolumeUSD,
          oneWeekData.untrackedVolumeUSD,
          twoWeekData.untrackedVolumeUSD,
        )
        data.oneWeekVolume = oneWeekVolume
        data.weeklyVolumeChange = weeklyVolumeChange
      }

      if (oneDayData && twoDayData) {
        const [oneDayTxns, txnChange] = get2DayPercentChange(
          data.txCount,
          oneDayData.txCount ? oneDayData.txCount : 0,
          twoDayData.txCount ? twoDayData.txCount : 0,
        )
        data.oneDayTxns = oneDayTxns
        data.txnChange = txnChange
      }

      // format the total liquidity in USD
      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice,
      )

      // add relevant fields with the calculated amounts
      data.liquidityChangeUSD = liquidityChangeUSD
    }
  } catch (e) {
    console.log(e)
  }
  return data
}

const getChartData = async (exchangeSource: ExchangeSource, oldestDateToFetch: number) => {
  const client = exchangeClient[exchangeSource]
  let data = []
  const weeklyData = []
  const utcEndTime = dayjs.utc()
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      skip += 1000
      data = data.concat(result.data.uniswapDayDatas)
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true
      }
    }

    if (data) {
      const dayIndexSet = new Set()
      const dayIndexArray = []
      const oneDay = 24 * 60 * 60

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0))
        dayIndexArray.push(data[i])
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      })

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch
      let latestLiquidityUSD = data[0].totalLiquidityUSD
      let latestDayDats = data[0].mostLiquidTokens
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        const currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
          latestDayDats = dayIndexArray[index].mostLiquidTokens
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    let startIndexWeekly = -1
    let currentWeek = -1
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week()
      if (week !== currentWeek) {
        currentWeek = week
        startIndexWeekly++
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {}
      weeklyData[startIndexWeekly].date = data[i].date
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].dailyVolumeUSD
    })
  } catch (e) {
    console.log(e)
  }
  return [data, weeklyData]
}

const UPDATE = 'UPDATE'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const UPDATE_MASTERCHEF_CHART = 'UPDATE_MASTERCHEF_CHART'

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data, source } = payload
      return {
        ...state,
        globalData: {
          ...state.globalData,
          [source]: data,
        },
      }
    }
    case UPDATE_CHART: {
      const { daily, weekly, source } = payload
      return {
        ...state,
        chartData: {
          ...state.chartData,
          [source]: {
            daily,
            weekly,
          },
        },
      }
    }
    case UPDATE_MASTERCHEF_CHART: {
      const { daily, weekly } = payload
      return {
        ...state,
        sushiLiquidityChart: {
          daily,
          weekly,
        },
      }
    }
    case UPDATE_ETH_PRICE: {
      const { ethPrice, oneDayPrice, ethPriceChange, source } = payload
      return {
        ...state,
        [source]: {
          [ETH_PRICE_KEY]: ethPrice,
          oneDayPrice,
          ethPriceChange,
        },
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }: { children: any }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((source, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        source,
        data,
      },
    })
  }, [])

  const updateChart = useCallback((source: ExchangeSource, daily, weekly) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        source,
        daily,
        weekly,
      },
    })
  }, [])

  const updateEthPrice = useCallback((source: ExchangeSource, ethPrice, oneDayPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        source,
        ethPrice,
        oneDayPrice,
        ethPriceChange,
      },
    })
  }, [])

  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateChart,
            updateEthPrice,
          },
        ],
        [state, update, updateChart, updateEthPrice],
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}
