import React from 'react'
import _find from 'lodash/find'
import _get from 'lodash/get'
import { ExchangeSource } from '../../constants'
import { useGlobalData } from '../../contexts/globalData'
import { formattedNum, toK } from '../../utils'
import { useSushiData, useSushiMenu } from '../sushiMenu/hooks'

const SushiMenu = (): JSX.Element => {
  const sushiData = useSushiData()
  const globalData = useGlobalData(ExchangeSource.SUSHISWAP)
  const sushiMenu = useSushiMenu(_get(globalData, 'ethereumBlockTime', null))
  const oneDayVolume = _get(globalData, 'oneDayVolumeUSD', null)
  const fees24H = oneDayVolume != null ? oneDayVolume * 0.0005 : null
  return (
    <div>
      <div>Market cap: {sushiData ? toK(sushiData.marketCap) : '-'}</div>
      <div>Volume 24h: {oneDayVolume ? formattedNum(oneDayVolume, true) : '-'}</div>
      <div>Fees collected 24h: {fees24H ? formattedNum(fees24H, true) : '-'}</div>

      <table className="table-auto w-full bg-white">
        <thead className="text-gray-800">
          <tr>
            <th className="border px-4 py-2">Pair</th>
            <th className="border px-4 py-2">Staked</th>
            <th className="border px-4 py-2">Underlying tokens</th>
            <th className="border px-4 py-2">TVL (24h) </th>
            <th className="border px-4 py-2">Yield per $1000</th>
            <th className="border px-4 py-2">ROI</th>
          </tr>
        </thead>
        <tbody>
          {sushiMenu &&
            sushiMenu.map((menu, index) => (
              <tr style={{ backgroundColor: index % 2 == 0 ? '#f9f9f9' : 'white' }} key={index}>
                <td className="border px-4 py-2">
                  {menu.token0.symbol}-{menu.token1.symbol}
                </td>
                <td className="border px-4 py-2">{menu.liquidityTokenBalance.toFixed(2)}</td>
                <td className="border px-4 py-2">
                  <div>
                    {menu.token0.symbol}: {menu.token0.reserve.toFixed(2)}
                  </div>
                  <div>
                    {menu.token1.symbol}: {menu.token1.reserve.toFixed(2)}
                  </div>
                </td>
                <td className="border px-4 py-2">
                  {menu.totalValueUSD.toFixed(2)} {menu.totalValueUsd24HChange.toFixed(2)}%
                </td>
                <td className="border px-4 py-2">
                  {((1e3 / menu.totalValueUSD) * menu.rewardPerHour * 24).toFixed(2)}
                </td>
                <td className="border px-4 py-2">
                  {(
                    ((menu.rewardPerHour * _find(sushiMenu, { token0: { symbol: 'SUSHI' } }).token0.valueUSD * 24) /
                      menu.totalValueUSD) *
                    100
                  ).toFixed(2)}
                  % daily
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default SushiMenu
