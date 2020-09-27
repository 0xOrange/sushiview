import { ExchangeSource } from '../../constants'
import { getTopTokens } from '../../contexts/tokenData'
import { Result } from '../../utils'
import { PriceTable, FetchError } from './compareSlice'
import tokensList from '../../tokens.json'

export async function getPriceData(
  source: ExchangeSource,
  ethPrice: number,
  ethPriceOld: number,
): Promise<Result<PriceTable[], FetchError>> {
  try {
    const topTokens = await getTopTokens(source, ethPrice, ethPriceOld)
    const tokenIds = tokensList.tokens.map((t) => t.symbol.toLowerCase())
    return Result.Ok(
      (topTokens || [])
        .filter(
          (p: any) => p.totalLiquidityUSD > 1 && (tokenIds.includes(p.symbol.toLowerCase()) || p.symbol === 'ETH'),
        )
        .map(
          (p: any) =>
            ({
              id: p.id,
              symbol: p.symbol,
              volumeUSD: p.tradeVolumeUSD,
              priceUSD: p.priceUSD,
              liquidityUSD: p.totalLiquidityUSD,
            } as any),
        ),
    )
  } catch (e) {
    console.error('Error fetching compare data: ' + JSON.stringify(e))
    return Result.Err({ message: e.message || 'Error fetching compare data', code: e.code || 500 })
  }
}
