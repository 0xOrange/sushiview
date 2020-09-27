import React, { useState, useMemo } from 'react'
import { ExchangeSource } from '../constants'
import { useEthPrice } from '../contexts/globalData'
import { toK, formattedNum } from '../utils/number'
import tokensList from '../tokens.json'
import _find from 'lodash/find'
import _get from 'lodash/get'
import { useDerivedSwapInfo, computeSlippageAdjustedAmounts } from '../features/swap/hooks'
import { computeTradePriceBreakdown } from '../utils/trade'
import { CurrencyInput } from './app'
import { usePriceTable } from '../features/compare/hooks'
import Error from 'next/error'

const WETH_ADDRESS = _find(tokensList.tokens, { symbol: 'WETH' }).address
export const TokensList = (): JSX.Element => {
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

    return sushiPriceTable.filter((m) => _find(uniPriceTable, { id: m.id }) != null)
  }, [uniPriceTable, sushiPriceTable])

  if (priceTableResult.isError) {
    return <Error statusCode={500} />
  }

  const TableTitleSplit = ({ title }: { title: string }) => (
    <div>
      {title}
      <div className="flex mt-2 border-t border-gray-300 pt-3">
        <span className="flex-1">🍣</span>
        <span className="mt-1 w-px h-4 bg-gray-300 mx-5" />
        <span className="flex-1">🦄</span>
      </div>
    </div>
  )

  if (!sushiPriceTable) {
    return (
      <div className="animate-pulse flex space-x-4 w-full p-12 bg-white">
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
      <CurrencyInput
        tokenList={availableTokensList.map((m) => ({ symbol: m.symbol, address: m.id }))}
        onChange={(value, address) => {
          setInputTokenAddress(address)
          setInputTokenAmount(value)
        }}
        address={inputTokenAddress}
        amount={inputTokenAmount}
      />
      <div className="w-full overflow-y-auto">
        <table className="table-auto w-full bg-white">
          <thead className="text-gray-800 bg-gray-100">
            <tr className="">
              <th>Token</th>
              <th>
                <TableTitleSplit title="Price" />
              </th>
              <th>
                <TableTitleSplit title="Liquidity" />
              </th>
              <th>
                <TableTitleSplit title="Price impact" />
              </th>
              <th>
                <TableTitleSplit
                  title={`Estimated (for ${inputTokenAmount} ${
                    _find(tokensList.tokens, {
                      address: inputTokenAddress,
                    }).symbol
                  })`}
                />
              </th>
              <style jsx>{`
                th {
                  padding: 12px;
                  font-weight: 500;
                  font-size: 0.875rem;
                  text-transform: uppercase;
                  color: #1a202c;
                }
              `}</style>
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

const MultiItemsCol = ({ i1, i2 }: { i1: string; i2: string }) => (
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
        {logoURI && <img src={logoURI} className="w-4 h-4 inline mr-3" />}
        {symbol}
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
            priceImpactSushi == null || inputCurrencyId === outputCurrencyId ? '-' : `${priceImpactSushi.toFixed(2)}%`
          }
          i2={priceImpactUni == null || inputCurrencyId === outputCurrencyId ? '-' : `${priceImpactUni.toFixed(2)}%`}
        />
      </td>
      <td>
        <MultiItemsCol
          i1={
            slippageAdjustedAmountsSushi.OUTPUT == null || inputCurrencyId === outputCurrencyId
              ? '-'
              : `${formattedNum(parseFloat(slippageAdjustedAmountsSushi.OUTPUT.toFixed(5)))} ${symbol}`
          }
          i2={
            slippageAdjustedAmountsUni.OUTPUT == null || inputCurrencyId === outputCurrencyId
              ? '-'
              : `${formattedNum(parseFloat(slippageAdjustedAmountsUni.OUTPUT.toFixed(5)))} ${symbol}`
          }
        />
      </td>
      <style jsx>{`
        td {
          padding: 16px;
        }
      `}</style>
    </tr>
  )
}

export default TokensList
