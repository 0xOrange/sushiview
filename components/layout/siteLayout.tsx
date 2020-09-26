import React from 'react'
import _get from 'lodash/get'
import { useGlobalData } from '../../contexts/globalData'
import { useSushiData } from '../../features/farm/hooks'
import { ExchangeSource } from '../../constants'
import Error from 'next/error'
import SushiOverview from '../sushiOverview/sushiOverview'

const SiteLayout = ({ children }: { children: JSX.Element }): JSX.Element => {
  const globalData = useGlobalData(ExchangeSource.SUSHISWAP)
  const sushiResult = useSushiData()

  if (sushiResult.isError) {
    return <Error statusCode={500} />
  }
  const sushiData = sushiResult.unwrap()
  const oneDayVolume = _get(globalData, 'oneDayVolumeUSD', null)
  const fees24H = oneDayVolume != null ? oneDayVolume * 0.0005 : null
  const sushiValueUSD = _get(sushiData, 'valueUSD')

  return (
    <div className="bg-white antialiased">
      <div className="mx-auto px-2 md:px-6 max-w-5xl">
        <nav>
          <div className="py-4 flex-shrink-0 flex items-center">
            <img src="/sushiview-logo.svg" className="w-32 hover:opacity-75" />
          </div>
        </nav>
        <SushiOverview sushiData={sushiData} fees24H={fees24H} sushiValueUSD={sushiValueUSD} className="my-6" />
      </div>
      <div className="mt-8 sm:mt-0 sm:py-12">{children}</div>
    </div>
  )
}

export const getLayout = (page: JSX.Element): JSX.Element => <SiteLayout>{page}</SiteLayout>

export default SiteLayout
