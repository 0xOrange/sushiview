import React, { useState, useMemo } from 'react'
import { ExchangeSource } from '../../constants'
import { useGlobalData } from '../../contexts/globalData'
import { formattedNum, toK } from '../../utils'
import { useSushiData, useSushiMenu, ISushiMenu } from '../sushiMenu/hooks'
import tokensList from '../../tokens.json'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountDown as faSortDown, faSortAmountUp as faSortUp } from '@fortawesome/free-solid-svg-icons'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _orderBy from 'lodash/orderBy'

const OverviewItem = ({ title, value, className }: { title: string; value: string; className?: string }) => (
  <div className={cn('', className)}>
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-lg font-semibold  text-gray-700">{value}</div>
  </div>
)
const OverviewContainer = ({
  className,
  children,
  header,
  emoji,
}: {
  className?: string
  children: JSX.Element | JSX.Element[]
  header: string
  emoji?: string
}) => {
  return (
    <div className={cn(className, 'bg-white rounded-md border border-gray-300')}>
      <div className="text-gray-800 text-lg border-b border-gray-200 p-3 text-center">
        {emoji && <span className="mr-3 text-lg">{emoji}</span>}
        {header}
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

enum TableHead {
  PAIR = 'Pair',
  STAKED = 'Staked',
  UNDERLYING_TOKENS = 'Underlying tokens',
  TVL = 'TVL (24h)',
  YIELD = 'Yield per $1000',
  ROI = 'ROI',
}

const SushiMenu = (): JSX.Element => {
  const [sortedCol, setSortedCol] = useState<{ col: TableHead; isDirectionAsc: boolean }>({
    col: TableHead.PAIR,
    isDirectionAsc: true,
  })
  const sushiData = useSushiData()
  const globalData = useGlobalData(ExchangeSource.SUSHISWAP)
  const sushiMenu = useSushiMenu(_get(globalData, 'ethereumBlockTime', null))
  const oneDayVolume = _get(globalData, 'oneDayVolumeUSD', null)
  const fees24H = oneDayVolume != null ? oneDayVolume * 0.0005 : null
  const sushiValueUSD = _get(_find(sushiMenu, { token0: { symbol: 'SUSHI' } }), 'token0.valueUSD', null)
  const totalValueUSDAggregate = (sushiMenu || []).reduce((acc, current) => acc + current.totalValueUSD, 0)

  const sortedSushiMenu = useMemo(() => {
    if (!sushiMenu) return null

    const sortDir = sortedCol.isDirectionAsc ? 'asc' : 'desc'
    if (sortedCol.col === TableHead.PAIR) {
      return _orderBy(
        sushiMenu,
        [
          (v: ISushiMenu) =>
            v.token0.symbol === 'WETH' ? v.token1.symbol.toLowerCase() : v.token0.symbol.toLowerCase(),
        ],
        [sortDir],
      )
    } else if (sortedCol.col === TableHead.STAKED) {
      return _orderBy(sushiMenu, ['liquidityTokenBalance'], [sortDir])
    } else if (sortedCol.col === TableHead.UNDERLYING_TOKENS) {
      return _orderBy(
        sushiMenu,
        [(v: ISushiMenu) => (v.token0.symbol === 'WETH' ? v.token1.reserve : v.token0.reserve)],
        [sortDir],
      )
    } else if (sortedCol.col === TableHead.TVL) {
      return _orderBy(sushiMenu, ['totalValueUSD'], [sortDir])
    } else if (sortedCol.col === TableHead.YIELD || sortedCol.col === TableHead.ROI) {
      return _orderBy(sushiMenu, [(v: ISushiMenu) => v.rewardPerHour / v.totalValueUSD], [sortDir])
    }

    return sushiMenu
  }, [sushiMenu, sortedCol.col, sortedCol.isDirectionAsc])
  return (
    <div className="">
      <div className="flex flex-col md:flex-row  justify-evenly">
        <OverviewContainer header="Sushi" emoji="🍣" className="flex-1 max-w-lg">
          <div className="flex justify-evenly">
            <OverviewItem
              className="flex-1"
              title="Value"
              value={sushiValueUSD ? formattedNum(sushiValueUSD, true) : '-'}
            />
            <OverviewItem
              title="Total Supply"
              value={sushiData ? formattedNum(parseFloat(sushiData.totalSupply.toString()), false) : '-'}
              className="border-l border-gray-300 pl-3 flex-1"
            />
            <OverviewItem
              title="Market cap"
              value={sushiData ? toK(sushiData.marketCap) : '-'}
              className="border-l border-gray-300 pl-3 flex-1"
            />
          </div>
        </OverviewContainer>

        <OverviewContainer header="Sushibar" emoji="🍺" className="flex-1  max-w-lg">
          <div className="flex justify-evenly">
            <OverviewItem
              title="Sushi staked"
              value={
                sushiData && sushiData.sushiBarTotalSupply
                  ? formattedNum(parseFloat(sushiData.sushiBarTotalSupply.toString()), false)
                  : '-'
              }
              className="flex-1"
            />
            <OverviewItem
              className="flex-1 border-l border-gray-300 pl-3 "
              title="Total staked value"
              value={
                sushiData && sushiData.sushiBarTotalSupply
                  ? toK(parseFloat(sushiData.sushiBarTotalSupply.toString()) * sushiValueUSD)
                  : '-'
              }
            />
            <OverviewItem
              title="Fees collected(24h)"
              value={fees24H ? formattedNum(fees24H, true) : '-'}
              className="border-l border-gray-300 pl-3 flex-1"
            />
          </div>
        </OverviewContainer>
      </div>

      <div className="mt-8 mb-4 text-gray-800 text-2xl font-semibold">SushiSwap Pools</div>
      <table className="table-auto w-full bg-white">
        <thead className="text-gray-700 border rounded-md text-left bg-gray-100">
          <tr>
            {Object.keys(TableHead).map((key: TableHead) => (
              <th
                className="px-4 py-2 cursor-pointer hover:text-gray-900 text-sm font-medium"
                key={key}
                onClick={() =>
                  setSortedCol({
                    col: TableHead[key],
                    isDirectionAsc: sortedCol.col === TableHead[key] ? !sortedCol.isDirectionAsc : false,
                  })
                }
              >
                {TableHead[key].toUpperCase()}
                <FontAwesomeIcon
                  icon={sortedCol.isDirectionAsc ? faSortUp : faSortDown}
                  className={cn('ml-2', {
                    invisible: sortedCol.col !== TableHead[key],
                  })}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSushiMenu &&
            sortedSushiMenu.map((menu: ISushiMenu, index) => {
              const [token0, token1] =
                menu.token0.symbol === 'WETH' ? [menu.token1, menu.token0] : [menu.token0, menu.token1]
              const token0Info = _find(tokensList.tokens, {
                address: token0.id,
              })
              const token1Info = _find(tokensList.tokens, {
                address: token1.id,
              })
              return (
                <tr className="border-b" key={index}>
                  <td className="align-middle">
                    <div className="flex">
                      <img
                        className="w-8 h-8 z-10 bg-white rounded-full border-gray-100 border"
                        src={token0Info.logoURI}
                      />
                      <img className="w-8 h-8 -ml-5" src={token1Info.logoURI} />
                      <span className="ml-3 mt-1 text-gray-700 text-sm font-semibold">
                        <a
                          href={`https://sushiswap.vision/pair/${menu.pairID}`}
                          className="hover:underline cursor-pointer"
                        >
                          {token0.symbol}-{token1.symbol.replace('WETH', 'ETH')}
                        </a>
                      </span>
                    </div>
                  </td>
                  <td>{formattedNum(menu.liquidityTokenBalance)} LP</td>
                  <td>
                    <div className="flex items-center text-sm">
                      <div
                        className="w-2 h-2 rounded-full bg-red-100 mr-2"
                        style={{ backgroundColor: token0Info.brandColor }}
                      />
                      {formattedNum(token0.reserve)}{' '}
                      <span className="text-gray-600 ml-1 mt-1 text-xs">{token0.symbol}</span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full bg-red-100 mr-2"
                        style={{ backgroundColor: token1Info.brandColor }}
                      />
                      {formattedNum(token1.reserve)}{' '}
                      <span className="text-gray-600 ml-1 text-xs mt-1">{token1.symbol}</span>
                    </div>
                  </td>
                  <td>
                    {formattedNum(menu.totalValueUSD, true)}
                    <span
                      className={cn(
                        'text-xs ml-1',
                        { 'text-red-700': menu.totalValueUsd24HChange < 0 },
                        { 'text-green-700': menu.totalValueUsd24HChange >= 0 },
                      )}
                    >
                      ({menu.totalValueUsd24HChange.toFixed(2)}%)
                    </span>
                    <div className="text-xs text-gray-600">
                      {((menu.totalValueUSD / totalValueUSDAggregate) * 100).toFixed(2)}% of total
                    </div>
                  </td>
                  <td className="flex">
                    <span className="text-2xl">🍣</span>
                    <div className="ml-3">
                      {((1e3 / menu.totalValueUSD) * menu.rewardPerHour * 24).toFixed(2)}
                      <div className="text-gray-600 text-xs">SUSHI/day</div>
                    </div>
                  </td>
                  <td>
                    {(((menu.rewardPerHour * sushiValueUSD * 24) / menu.totalValueUSD) * 100).toFixed(2)}%
                    <span className="ml-2">daily</span>
                  </td>
                  <style jsx>{`
                    td {
                      padding: 16px;
                      font-size: 15px;
                      color: #4a5568;
                    }
                    tr:hover {
                      background-color: #f7fafc;
                    }
                  `}</style>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

export default SushiMenu
