import React, { useState, useEffect, useMemo } from 'react'
import { getTopTokens } from '../contexts/tokenData'
import { ExchangeSource } from '../constants'
import { useEthPrice } from '../contexts/globalData'
import { toK, formattedNum } from '../utils/number'
import tokensList from '../tokens.json'
interface PriceTable {
  id: string
  symbol: string
  priceUSD: string
  liquidityUSD: string
  volumeUsd: string
}
import _orderBy from 'lodash/orderBy'
import _find from 'lodash/find'
import _get from 'lodash/get'
import { useDerivedSwapInfo, computeSlippageAdjustedAmounts } from '../state/swap/hooks'
import { computeTradePriceBreakdown } from '../utils/trade'
import { CurrencyInput } from './app'

async function getData(source: ExchangeSource, ethPrice: number, ethPriceOld: number) {
  const topTokens = await getTopTokens(source, ethPrice, ethPriceOld)
  return _orderBy(
    topTokens
      .filter((p: any) => p.totalLiquidityUSD > 1)
      .map((p: any) => ({
        id: p.id,
        symbol: p.symbol,
        volumeUSD: p.tradeVolumeUSD,
        priceUSD: p.priceUSD,
        liquidityUSD: p.totalLiquidityUSD,
      })),
    ['liquidityUSD'],
    ['desc'],
  )
}

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const TokensList = (): JSX.Element => {
  const [priceTableUni, setPriceTableUni] = useState<PriceTable[]>([])
  const [priceTableSushi, setPriceTableSushi] = useState<PriceTable[]>([])
  const [inputTokenAmount, setInputTokenAmount] = useState<string>('1000')
  const [inputTokenAddress, setInputTokenAddress] = useState<string>(WETH_ADDRESS)

  const [ethPriceSushi, ethPriceOldSushi] = useEthPrice(ExchangeSource.SUSHISWAP)
  const [ethPriceUni, ethPriceOldUni] = useEthPrice(ExchangeSource.UNISWAP)
  useEffect(() => {
    if (ethPriceSushi && ethPriceOldSushi && priceTableSushi.length === 0) {
      getData(ExchangeSource.SUSHISWAP, ethPriceSushi, ethPriceOldSushi).then((res) => setPriceTableSushi(res))
    }
  }, [ethPriceSushi, ethPriceOldSushi, priceTableSushi])

  useEffect(() => {
    if (ethPriceUni && ethPriceOldUni && priceTableUni.length === 0) {
      getData(ExchangeSource.UNISWAP, ethPriceUni, ethPriceOldUni).then((res) => setPriceTableUni(res))
    }
  }, [ethPriceUni, ethPriceOldUni, priceTableUni])
  const availableTokensList = useMemo(() => priceTableSushi.filter((m) => _find(priceTableUni, { id: m.id }) != null), [
    priceTableSushi,
    priceTableUni,
  ])

  const TableTitleSplit = ({ title }: { title: string }) => (
    <div>
      {title}
      <div className="flex mt-2 border-t border-gray-200 pt-3">
        <span className="flex-1">🍣</span>
        <span className="mt-1 w-px h-4 bg-gray-300 mx-5" />
        <span className="flex-1">🦄</span>
      </div>
    </div>
  )

  if (priceTableSushi.length === 0) {
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
      <table className="table-auto w-full bg-white">
        <thead className="text-gray-800">
          <tr>
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">Token</th>
            <th className="border px-4 py-2">
              <TableTitleSplit title="Price" />
            </th>
            <th className="border px-4 py-2">
              <TableTitleSplit title="Liquidity" />
            </th>
            <th className="border px-4 py-2">
              <TableTitleSplit title="Price impact" />
            </th>
            <th className="border px-4 py-2">
              <TableTitleSplit
                title={`Estimated (for ${inputTokenAmount} ${
                  _find(tokensList.tokens, {
                    address: inputTokenAddress,
                  }).symbol
                  // eslint-disable-next-line prettier/prettier
                  })`}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {availableTokensList.map((sushi, index) => {
            const uni = _find(priceTableUni, { id: sushi.id })
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
    <span className="mr-6 text-gray-700">{i1}</span>
    <span className="text-gray-500">{i2}</span>
  </div>
)
const TokenRow = ({ index, outputCurrencyId, inputCurrencyId, inputValue, tokenInfo, symbol }: TokenRow) => {
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
    <tr style={{ backgroundColor: index % 2 == 0 ? '#f9f9f9' : 'white' }}>
      <td className="border px-4 py-2">{index + 1}</td>
      <td className="border px-4 py-2">
        {logoURI && <img src={logoURI} className="w-4 h-4 inline mr-3" />}
        {symbol}
      </td>
      <td className="border px-4 py-2">
        <MultiItemsCol
          i1={formattedNum(tokenInfo[ExchangeSource.SUSHISWAP].priceUsd, true)}
          i2={formattedNum(tokenInfo[ExchangeSource.UNISWAP].priceUsd, true)}
        />
      </td>
      <td className="border px-4 py-2">
        <MultiItemsCol
          i1={`$${toK(tokenInfo[ExchangeSource.SUSHISWAP].liquidityUsd)}`}
          i2={`$${toK(tokenInfo[ExchangeSource.UNISWAP].liquidityUsd)}`}
        />
      </td>
      <td className="border px-4 py-2">
        <MultiItemsCol
          i1={
            priceImpactSushi == null || inputCurrencyId === outputCurrencyId ? '-' : `${priceImpactSushi.toFixed(2)}%`
          }
          i2={priceImpactUni == null || inputCurrencyId === outputCurrencyId ? '-' : `${priceImpactUni.toFixed(2)}%`}
        />
      </td>
      <td className="border px-4 py-2">
        <MultiItemsCol
          i1={
            slippageAdjustedAmountsSushi.OUTPUT == null || inputCurrencyId === outputCurrencyId
              ? '-'
              : `${slippageAdjustedAmountsSushi.OUTPUT.toFixed(2)} ${symbol}`
          }
          i2={
            slippageAdjustedAmountsUni.OUTPUT == null || inputCurrencyId === outputCurrencyId
              ? '-'
              : `${slippageAdjustedAmountsUni.OUTPUT.toFixed(2)} ${symbol}`
          }
        />
      </td>
    </tr>
  )
}

export default TokensList
