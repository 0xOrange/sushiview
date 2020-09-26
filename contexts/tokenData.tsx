import { ExchangeSource } from '../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
import { getBlockFromTimestamp, get2DayPercentChange, getPercentChange } from '../utils'
import { TOKEN_DATA, TOKENS_CURRENT, TOKENS_DYNAMIC } from '../features/queries'
import { exchangeClient } from '../features'

export const getTopTokens = async (source: ExchangeSource, ethPrice: number, ethPriceOld: number) => {
  const client = exchangeClient[source]

  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    const current = await client.query({
      query: TOKENS_CURRENT,
      fetchPolicy: 'cache-first',
    })

    const oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
      fetchPolicy: 'cache-first',
    })

    const twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
      fetchPolicy: 'cache-first',
    })

    const oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token) => {
          const data = token

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id]
          let twoDayHistory = twoDayData?.[token.id]

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            const oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: 'cache-first',
            })
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            const twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: 'cache-first',
            })
            twoDayHistory = twoDayResult.data.tokens[0]
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0,
          )
          const [oneDayTxns, txnChange] = get2DayPercentChange(
            data.txCount,
            oneDayHistory?.txCount ?? 0,
            twoDayHistory?.txCount ?? 0,
          )

          const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * ethPriceOld * oneDayHistory?.derivedETH

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0,
          )

          // set data
          data.priceUSD = data?.derivedETH * ethPrice
          data.totalLiquidityUSD = currentLiquidityUSD
          data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD + '')
          data.volumeChangeUSD = volumeChangeUSD
          data.priceChangeUSD = priceChangeUSD
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
          data.oneDayTxns = oneDayTxns
          data.txnChange = txnChange

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
            data.oneDayTxns = data.txCount
          }

          if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
            data.name = 'Ether (Wrapped)'
            data.symbol = 'ETH'
          }
          return data
        }),
    )

    return bulkResults

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

export const getTokenPairs = async (tokenAddress, source: ExchangeSource) => {
  const client = exchangeClient[source]

  try {
    // fetch all current and historical data
    const result = await client.query({
      query: TOKEN_DATA(tokenAddress),
      fetchPolicy: 'cache-first',
    })
    return result.data?.['pairs0'].concat(result.data?.['pairs1'])
  } catch (e) {
    console.log(e)
  }
}
