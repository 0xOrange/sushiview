import React, { useState, useMemo } from 'react'
import { ExchangeSource } from '../../constants'
import { useEthPrice } from '../../contexts/globalData'
import { toK, formattedNum } from '../../utils/number'
import tokensList from '../../tokens.json'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _orderBy from 'lodash/orderBy'
import { useDerivedSwapInfo, computeSlippageAdjustedAmounts } from '../../features/swap/hooks'
import { computeTradePriceBreakdown } from '../../utils/trade'
import { usePriceTable } from '../../features/compare/hooks'
import Error from 'next/error'
import cn from 'classnames'
import { CurrencyInput } from './currencyInput'

enum TableHead {
  TOKEN = 'Token',
  PRICE = 'Price',
  LIQUIDITY = 'Liquidity',
  PRICE_IMPACT = 'Price Impact',
  ESITMATED_OUTPUT = 'Estimated return',
}

const WETH_ADDRESS = _find(tokensList.tokens, { symbol: 'WETH' }).address
export const CompareTable = (): JSX.Element => {
  const [inputTokenAmount, setInputTokenAmount] = useState<string>('1000')
  const [inputTokenAddress, setInputTokenAddress] = useState<string>(WETH_ADDRESS)
  const [ethPrice, ethPriceOld] = useEthPrice(ExchangeSource.SUSHISWAP)
  const priceTableResult = usePriceTable(ethPrice, ethPriceOld)

  let uniPriceTable, sushiPriceTable
  if (!priceTableResult.isError) {
    const res = priceTableResult.unwrap()
    uniPriceTable = res.uniPriceTable
    sushiPriceTable = res.sushiPriceTable
  }
  const availableTokensList = useMemo(() => {
    if (!uniPriceTable || !sushiPriceTable) {
      return []
    }

    return _orderBy(
      sushiPriceTable.filter((m) => _find(uniPriceTable, { id: m.id }) != null && m.liquidityUSD > 10000),
      'symbol',
    )
  }, [uniPriceTable, sushiPriceTable])

  if (priceTableResult.isError) {
    return <Error statusCode={500} />
  }

  if (!sushiPriceTable) {
    return (
      <div className="animate-pulse flex space-x-4 w-full  bg-white">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-400 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-400 rounded"></div>
            <div className="h-4 bg-gray-400 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-full overflow-y-auto">
        <table className="table-auto w-full bg-white">
          <thead className="text-gray-700 border rounded-md text-left bg-gray-100">
            <tr>
              {Object.keys(TableHead).map((key: TableHead) => (
                <th className="px-4 text-sm font-medium" key={key}>
                  <div className="text-center">
                    {TableHead[key] == TableHead.ESITMATED_OUTPUT ? (
                      <div className="flex items-center flex-col">
                        <div className="text-sm font-medium mr-4">SWAP FROM</div>
                        <CurrencyInput
                          tokenList={availableTokensList.map((m) => ({ symbol: m.symbol, address: m.id }))}
                          onChange={(value, address) => {
                            setInputTokenAddress(address)
                            setInputTokenAmount(value)
                          }}
                          address={inputTokenAddress}
                          amount={inputTokenAmount}
                        />
                      </div>
                    ) : (
                      <div className={cn({ 'mt-8': TableHead[key] != TableHead.TOKEN })}>
                        {TableHead[key].toUpperCase()}
                      </div>
                    )}
                    {TableHead[key] != TableHead.TOKEN && (
                      <div className="flex mt-2 border-t border-gray-300 pt-3">
                        <span className="flex-1">🍣</span>
                        <span className="mt-1 w-px h-4 bg-gray-300 mx-12" />
                        <span className="flex-1">🦄</span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableTokensList.map((sushi, index) => {
              const uni = _find(uniPriceTable, { id: sushi.id })
              if (!uni || !sushi) return <tr key={sushi.id}></tr>

              return (
                <TokenRow
                  key={sushi.id}
                  index={index}
                  symbol={sushi.symbol}
                  outputCurrencyId={sushi.id}
                  inputCurrencyId={inputTokenAddress}
                  inputValue={inputTokenAmount}
                  tokenInfo={{
                    [ExchangeSource.UNISWAP]: {
                      liquidityUsd: parseFloat(uni.liquidityUSD),
                      priceUsd: parseFloat(uni.priceUSD),
                    },
                    [ExchangeSource.SUSHISWAP]: {
                      liquidityUsd: parseFloat(sushi.liquidityUSD),
                      priceUsd: parseFloat(sushi.priceUSD),
                    },
                  }}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TokenRow {
  index: number
  symbol: string
  tokenInfo: {
    [source: number]: {
      priceUsd: number
      liquidityUsd: number
    }
  }
  outputCurrencyId: string
  inputCurrencyId: string
  inputValue: string
}

const MultiItemsCol = ({ i1, i2 }: { i1: string | JSX.Element; i2: string | JSX.Element }) => (
  <div className="flex justify-between ">
    <span className="mr-6 text-gray-800">{i1}</span>
    <span className="text-gray-600">{i2}</span>
  </div>
)
const TokenRow = ({ outputCurrencyId, inputCurrencyId, inputValue, tokenInfo, symbol }: TokenRow) => {
  const { v2Trade: uniTrade } = useDerivedSwapInfo(
    ExchangeSource.UNISWAP,
    inputCurrencyId,
    outputCurrencyId,
    inputValue,
  )
  const { v2Trade: sushiTrade } = useDerivedSwapInfo(
    ExchangeSource.SUSHISWAP,
    inputCurrencyId,
    outputCurrencyId,
    inputValue,
  )
  const priceImpactUni = computeTradePriceBreakdown(uniTrade).priceImpactWithoutFee
  const priceImpactSushi = computeTradePriceBreakdown(sushiTrade).priceImpactWithoutFee
  const slippageAdjustedAmountsUni = computeSlippageAdjustedAmounts(uniTrade, 1)
  const slippageAdjustedAmountsSushi = computeSlippageAdjustedAmounts(sushiTrade, 1)
  const logoURI = useMemo(() => _get(_find(tokensList.tokens, { address: outputCurrencyId }), 'logoURI'), [
    outputCurrencyId,
  ])
  return (
    <tr className="border-t hover:bg-gray-100 text-sm">
      <td>
        {logoURI && <img src={logoURI} className="w-8 h-8 inline mr-2" />}
        <span className="mt-1 text-gray-700 text-sm font-semibold">
          <a href={`https://sushiswap.vision/token/${outputCurrencyId}`} className="hover:underline cursor-pointer">
            {symbol}
          </a>
        </span>
      </td>
      <td>
        <MultiItemsCol
          i1={formattedNum(tokenInfo[ExchangeSource.SUSHISWAP].priceUsd, true)}
          i2={formattedNum(tokenInfo[ExchangeSource.UNISWAP].priceUsd, true)}
        />
      </td>
      <td>
        <MultiItemsCol
          i1={`$${toK(tokenInfo[ExchangeSource.SUSHISWAP].liquidityUsd)}`}
          i2={`$${toK(tokenInfo[ExchangeSource.UNISWAP].liquidityUsd)}`}
        />
      </td>
      <td>
        <MultiItemsCol
          i1={
            priceImpactSushi == null || inputCurrencyId === outputCurrencyId ? (
              <span className="text-gray-500">N/A</span>
            ) : (
              `${priceImpactSushi.toFixed(2)}%`
            )
          }
          i2={
            priceImpactUni == null || inputCurrencyId === outputCurrencyId ? (
              <span className="text-gray-500">N/A</span>
            ) : (
              `${priceImpactUni.toFixed(2)}%`
            )
          }
        />
      </td>
      <td>
        <MultiItemsCol
          i1={
            slippageAdjustedAmountsSushi.OUTPUT == null || inputCurrencyId === outputCurrencyId ? (
              <span className="text-gray-500">N/A</span>
            ) : (
              `${formattedNum(parseFloat(slippageAdjustedAmountsSushi.OUTPUT.toFixed(5)))} ${symbol}`
            )
          }
          i2={
            slippageAdjustedAmountsUni.OUTPUT == null || inputCurrencyId === outputCurrencyId ? (
              <span className="text-gray-500">N/A</span>
            ) : (
              `${formattedNum(parseFloat(slippageAdjustedAmountsUni.OUTPUT.toFixed(5)))} ${symbol}`
            )
          }
        />
      </td>
      <style jsx>{`
        td {
          padding: 16px 12px;
          font-size: 15px;
          color: #4a5568;
        }
        tr:hover {
          background-color: #f7fafc;
        }
      `}</style>
    </tr>
  )
}

export default CompareTable
