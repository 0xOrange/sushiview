// import * as Uniswap from '@uniswap/sdk'
import * as Uniswap from '@uniswap/sdk'
import _find from 'lodash/find'
import { parseUnits } from '@ethersproject/units'
import { useTradeExactIn } from '../../hooks/trades'
import { useCurrency } from '../../hooks/tokens'
import { ExchangeSource } from '../../constants'

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
  currencies: { [field in Field]?: Uniswap.Currency }
  parsedAmount: Uniswap.CurrencyAmount | undefined
  v2Trade: Uniswap.Trade | undefined
} {
  // const { account } = useActiveWeb3React()

  const independentField = Field.INPUT

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  // const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(source, isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  // const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)
  const bestTradeExactOut = undefined

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencies: { [field in Field]?: Uniswap.Currency } = {
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
export function tryParseAmount(value?: string, currency?: Uniswap.Currency): Uniswap.CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Uniswap.Token
        ? new Uniswap.TokenAmount(currency, Uniswap.JSBI.BigInt(typedValueParsed))
        : Uniswap.CurrencyAmount.ether(Uniswap.JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}
