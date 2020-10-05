import JSBI from 'jsbi'
import { TOKEN_DATA, MASTERCHEF_POOLS, PAIR_BY_ID, PAIR_RESERVE_BY_ID } from '../queries'
import _find from 'lodash/find'
import _get from 'lodash/get'
import { sushiClient, masterChefClient } from '../client'
import tokensList from '../../tokens.json'
import { Result, getBlocksFromTimestamps, FetchError } from '../../utils'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import { SUSHI_PER_BLOCK } from '../../constants'
import { SushiData, ISushiMenu } from './farmSlice'
dayjs.extend(utc)

const SUSHI_ADDRESS = _find(tokensList.tokens, { symbol: 'SUSHI' }).address
export const fetchSushiData = async (
  sushiTotalSupply: JSBI,
  sushiBarTotalSupply: JSBI,
  sushiStakedBar: JSBI,
  ethPrice: number,
): Promise<Result<SushiData, FetchError>> => {
  console.debug('Updating useSushiData: ')

  if (ethPrice > 0 && JSBI.GT(sushiTotalSupply, 0)) {
    try {
      const tokenData = await sushiClient.query({
        query: TOKEN_DATA(SUSHI_ADDRESS),
        fetchPolicy: 'network-only',
      })
      const derivedETH = _get(tokenData, 'data.tokens[0].derivedETH', null)
      const valueUSD = derivedETH * ethPrice
      const s = JSBI.divide(sushiTotalSupply, JSBI.BigInt(1e18))
      const marketCap = parseInt(s.toString()) * derivedETH * ethPrice
      return Result.Ok({
        marketCap,
        totalSupply: s,
        valueUSD,
        sushiBarTotalSupply: JSBI.divide(sushiBarTotalSupply, JSBI.BigInt(1e18)),
        sushiStakedBar: JSBI.divide(sushiStakedBar, JSBI.BigInt(1e18)),
      })
    } catch (e) {
      console.error('Error fetching sushi data: ' + JSON.stringify(e))
      return Result.Err({ code: e.code || 500, message: e.message || 'Error fetching farm menu' })
    }
  }
}

export const fetchSushiMenu = async (
  ethereumBlockTime: number | null,
  ethPrice: number,
): Promise<Result<ISushiMenu[], FetchError>> => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()

  let masterChef: any, masterchefPairs: any, masterchefPairsOneDayAgo: any
  try {
    masterChef = await masterChefClient.query({
      query: MASTERCHEF_POOLS(30),
      fetchPolicy: 'cache-first',
    })
    const poolIds = masterChef.data.masterChefPools.map((p: any) => p.lpToken)

    masterchefPairs = await sushiClient.query({
      query: PAIR_BY_ID(poolIds),
      fetchPolicy: 'network-only',
    })
    // get the blocks needed for time travel queries
    const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack])
    masterchefPairsOneDayAgo = await sushiClient.query({
      query: PAIR_RESERVE_BY_ID(poolIds, oneDayBlock.number),
      fetchPolicy: 'network-only',
    })
  } catch (e) {
    console.error('Error fetching sushi menu' + JSON.stringify(e))
    return Result.Err({ code: e.code || 500, message: e.message || 'Error fetching farm menu' })
  }

  const masterChefTotalAllocPoint = masterChef.data.masterChef.totalAllocPoint
  const pairs = masterchefPairs.data.pairs
  const liquidityPositions = masterchefPairs.data.liquidityPositions

  return Result.Ok(
    pairs.map(
      (pair): ISushiMenu => {
        const totalSupply = pair.totalSupply
        const totalSupply24HAgo = _find(masterchefPairsOneDayAgo.data.pairs, { id: pair.id }).totalSupply

        const totalValueUSD = parseFloat(pair.reserveUSD)
        const allocPoint = _find(masterChef.data.masterChefPools, { lpToken: pair.id }).allocPoint
        const rewardPerBlock = (allocPoint / masterChefTotalAllocPoint) * SUSHI_PER_BLOCK
        const rewardPerHour = (3600 / (ethereumBlockTime || 13.411)) * rewardPerBlock

        return {
          token0: {
            id: pair.token0.id,
            symbol: pair.token0.symbol,
            reserve: parseFloat(pair.reserve0),
            valueUSD: ethPrice * pair.token0.derivedETH,
          },
          token1: {
            id: pair.token1.id,
            symbol: pair.token1.symbol,
            reserve: parseFloat(pair.reserve1),
            valueUSD: ethPrice * pair.token1.derivedETH,
          },
          totalValueUSD: totalValueUSD,
          totalValueUsd24HChange: (totalSupply - totalSupply24HAgo) / totalSupply24HAgo,
          liquidityTokenBalance: parseFloat(_find(liquidityPositions, { pair: { id: pair.id } }).liquidityTokenBalance),
          pairID: pair.id,
          rewardPerHour,
          hourlyROI: 0,
        }
      },
    ),
  )
}
