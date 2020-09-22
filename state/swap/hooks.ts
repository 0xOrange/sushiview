import {
  Trade,
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  ChainId,
  ETHER,
} from '../../forks/@uniswap/sdk/dist'
import { parseUnits } from '@ethersproject/units'
import { useTradeExactIn } from '../../hooks/trades'
import { ExchangeSource } from '../../constants'
import { basisPointsToPercent, isAddress } from '../../utils'
import tokenList from '../../tokens.json'
import _find from 'lodash/find'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  source: ExchangeSource,
  inputCurrencyId: string | 'ETH',
  outputCurrencyId: string | 'ETH',
  typedValue: string,
): {
  currencies: { [field in Field]?: Currency }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
} {
  const independentField = Field.INPUT

  const inputCurrency = getCurrency(inputCurrencyId)
  const outputCurrency = getCurrency(outputCurrencyId)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(source, isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestTradeExactOut = undefined

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  return {
    currencies,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  }
}

export function getCurrency(currencyId: string | undefined): Currency | null | undefined {
  const address: any = isAddress(currencyId)

  const t = _find(tokenList.tokens, { address: currencyId.toLowerCase() })
  if (!t) {
    console.error(`TOKEN - ${currencyId} not registered`)
    return null
  }
  const token = new Token(ChainId.MAINNET, address, t.decimals, t.symbol)

  const isETH = currencyId?.toUpperCase() === 'ETH'
  return isETH ? ETHER : token
}
