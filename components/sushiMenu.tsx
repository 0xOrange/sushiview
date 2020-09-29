import React, { useState, useMemo } from 'react'
import { ExchangeSource } from '../constants'
import { useGlobalData } from '../contexts/globalData'
import { formattedNum } from '../utils'
import { useSushiMenu, ISushiMenu } from '../features/farm'
import tokensList from '../tokens.json'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountDown as faSortDown, faSortAmountUp as faSortUp } from '@fortawesome/free-solid-svg-icons'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _orderBy from 'lodash/orderBy'
import { useSushiData } from '../features/farm/hooks'
import Error from 'next/error'

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

  const globalData = useGlobalData(ExchangeSource.SUSHISWAP)
  const sushiMenuResult = useSushiMenu(_get(globalData, 'ethereumBlockTime', null))

  const sushiMenu = sushiMenuResult.isError ? null : sushiMenuResult.unwrap()
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
  }, [sortedCol.col, sortedCol.isDirectionAsc, sushiMenu])
  const sushiResult = useSushiData()

  if (sushiResult.isError || sushiMenuResult.isError) {
    return <Error statusCode={500} />
  }
  const sushiData = sushiResult.unwrap()
  const sushiValueUSD = _get(sushiData, 'valueUSD')
  const totalValueUSDAggregate = (sushiMenu || []).reduce((acc, current) => acc + current.totalValueUSD, 0)

  return (
    <div>
      {!sortedSushiMenu ? (
        <div className="animate-pulse flex space-x-4 w-full  bg-white">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-400 rounded"></div>
              <div className="h-4 bg-gray-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-y-auto">
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
                  const dayROI = ((menu.rewardPerHour * sushiValueUSD * 24) / menu.totalValueUSD) * 100
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
                            src={_get(token0Info, 'logoURI', `https://1inch.exchange/assets/tokens/${token0.id}.png`)}
                          />
                          <img
                            className="w-8 h-8 -ml-5"
                            src={_get(token1Info, 'logoURI', `https://1inch.exchange/assets/tokens/${token1.id}.png`)}
                          />
                          <span className="ml-3 mt-1 text-gray-700 text-sm font-semibold w-32 truncate">
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
                            style={{ backgroundColor: _get(token0Info, 'brandColor', '#000000') }}
                          />
                          {formattedNum(token0.reserve)}{' '}
                          <span className="text-gray-600 ml-1 mt-1 text-xs w-12 truncate">{token0.symbol}</span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full bg-red-100 mr-2"
                            style={{ backgroundColor: _get(token1Info, 'brandColor', '#000000') }}
                          />
                          {formattedNum(token1.reserve)}{' '}
                          <span className="text-gray-600 ml-1 text-xs mt-1 w-12 truncate">{token1.symbol}</span>
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
                      <td className="flex mt-3">
                        <span className="text-2xl">🍣</span>
                        <div className="ml-3">
                          {((1e3 / menu.totalValueUSD) * menu.rewardPerHour * 24).toFixed(2)}
                          <div className="text-gray-600 text-xs">SUSHI/day</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {dayROI.toFixed(2)}%<span className="ml-2">daily</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {(dayROI * 30).toFixed(2)}%<span className="ml-2">monthly</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {(dayROI * 365).toFixed(2)}%<span className="ml-2">yearly</span>
                        </div>
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
      )}
    </div>
  )
}

export default SushiMenu
