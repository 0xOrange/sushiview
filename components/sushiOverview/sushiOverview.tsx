import React from 'react'
import { OverviewContainer, OverviewItem } from './sushiInfo'
import { SushiData } from '../../features/farm/farmSlice'
import { formattedNum, toK } from '../../utils'
import cn from 'classnames'

interface ISushiOverview {
  sushiData: SushiData
  sushiValueUSD: number
  fees24H: number
  className?: string
}

const SushiOverview = ({ sushiData, sushiValueUSD, fees24H, className }: ISushiOverview): JSX.Element => {
  return (
    <div className={cn('flex justify-center', className)}>
      <div className={cn('grid gap-8 grid-cols-1 grid-rows-2 lg:grid-rows-1 lg:grid-cols-2')}>
        <OverviewContainer
          header="Sushi Token"
          emoji="🍣"
          link="https://sushiswap.vision/token/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
        >
          <div className="flex pt-4">
            <OverviewItem
              className="flex-1 border-r"
              title="Value"
              value={sushiValueUSD ? formattedNum(sushiValueUSD, true) : '-'}
            />
            <OverviewItem
              title="Total Supply"
              value={sushiData ? formattedNum(parseFloat(sushiData.totalSupply.toString()), false) : '-'}
              className="border-r border-gray-300 flex-1 pl-2"
            />
            <OverviewItem
              title="Market cap"
              value={sushiData ? toK(sushiData.marketCap) : '-'}
              className="border-gray-300 flex-1 pl-2"
            />
          </div>
        </OverviewContainer>

        <OverviewContainer header="Sushi Bar" emoji="🍺" link="https://app.boring.finance/#/sushibar">
          <div className="flex pt-3">
            <OverviewItem
              title="Sushi staked"
              value={
                sushiData && sushiData.sushiBarTotalSupply
                  ? formattedNum(parseFloat(sushiData.sushiBarTotalSupply.toString()), false)
                  : '-'
              }
              className="flex-1 border-r"
            />
            <OverviewItem
              className="flex-1 border-r border-gray-300 pl-2 "
              title="Staked value"
              value={
                sushiData && sushiData.sushiBarTotalSupply
                  ? toK(parseFloat(sushiData.sushiBarTotalSupply.toString()) * sushiValueUSD)
                  : '-'
              }
            />
            <OverviewItem
              title="Fees collected(24h)"
              value={fees24H ? formattedNum(fees24H, true) : '-'}
              className="border-gray-300 pl-2 flex-1"
            />
          </div>
        </OverviewContainer>
      </div>
    </div>
  )
}

export default SushiOverview
