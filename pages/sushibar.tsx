import React from 'react'
import { getLayout } from '../components/layout/tabLayout'
import SushiOverview from '../components/sushiOverview/sushiOverview'
import { useGlobalData } from '../contexts/globalData'
import { ExchangeSource } from '../constants'
import { useSushiData } from '../features/farm'
import Error from 'next/error'
import _get from 'lodash/get'

const Page = () => {
  const globalData = useGlobalData(ExchangeSource.SUSHISWAP)
  const sushiResult = useSushiData()

  if (sushiResult.isError) {
    return <Error statusCode={500} />
  }
  const sushiData = sushiResult.unwrap()
  const oneDayVolume = _get(globalData, 'oneDayVolumeUSD', null)
  const fees24H = oneDayVolume != null ? oneDayVolume * 0.0005 : null
  const sushiValueUSD = _get(sushiData, 'valueUSD')
  return <SushiOverview sushiData={sushiData} fees24H={fees24H} sushiValueUSD={sushiValueUSD} className="my-6" />
}

Page.getLayout = getLayout
export default Page
