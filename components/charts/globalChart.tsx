import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { TimeFrame } from '../../constants'
import TradingViewChart, { ChartType } from './tradingView'
import { getTimeframe } from '../../utils'
import { global_chart, global_data } from './mock'

enum ChartView {
  VOLUME,
  LIQUIDITY,
}

enum VolumeWindow {
  WEEKLY,
  DAYS,
}

interface GlobalChart {
  display: 'volume' | 'liquidity'
}
const GlobalChart = ({ display }: GlobalChart) => {
  // chart options
  const [chartView] = useState(display === 'volume' ? ChartView.VOLUME : ChartView.LIQUIDITY)

  // time window and window size for chart
  const timeWindow = TimeFrame.ALL_TIME
  const [volumeWindow] = useState(VolumeWindow.DAYS)

  // global historical data
  const [dailyData, weeklyData] = global_chart
  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneWeekVolume,
    weeklyVolumeChange,
  } = global_data

  // based on window, get starttim
  const utcStartTime = getTimeframe(timeWindow)

  const chartDataFiltered = useMemo(() => {
    const currentData = volumeWindow === VolumeWindow.DAYS ? dailyData : weeklyData
    return (
      currentData &&
      Object.keys(currentData)
        ?.map((key) => {
          const item = currentData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return
          }
        })
        .filter((item) => {
          return !!item
        })
    )
  }, [dailyData, utcStartTime, volumeWindow, weeklyData])

  // update the width on a window resize
  const ref = useRef()
  const current: any = ref.current
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(current?.container?.clientWidth)
  useEffect(() => {
    if (!isClient) {
      return
    }
    function handleResize() {
      setWidth(current?.container?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  return (
    <>
      {chartDataFiltered && chartView === ChartView.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChart
            data={dailyData}
            base={totalLiquidityUSD}
            baseChange={liquidityChangeUSD}
            title="Liquidity"
            field="totalLiquidityUSD"
            width={width}
            type={ChartType.AREA}
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === ChartView.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChart
            data={chartDataFiltered}
            base={volumeWindow === VolumeWindow.WEEKLY ? oneWeekVolume : oneDayVolumeUSD}
            baseChange={volumeWindow === VolumeWindow.WEEKLY ? weeklyVolumeChange : volumeChangeUSD}
            title={volumeWindow === VolumeWindow.WEEKLY ? 'Volume (7d)' : 'Volume'}
            field={volumeWindow === VolumeWindow.WEEKLY ? 'weeklyVolumeUSD' : 'dailyVolumeUSD'}
            width={width}
            type={ChartType.BAR}
            useWeekly={volumeWindow === VolumeWindow.WEEKLY}
          />
        </ResponsiveContainer>
      )}
      {!chartDataFiltered && <></>}
    </>
  )
}

export default GlobalChart
