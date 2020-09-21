import { useEffect, useState } from 'react'
import { Contract } from 'ethers'
import tokensList from '../../tokens.json'
import erc20Interface from '../../constants/abis/erc20'
import { useSingleCallResult } from '../../state/multicall/hooks'
import _find from 'lodash/find'
import _get from 'lodash/get'
import JSBI from 'jsbi'
import { sushiClient, masterChefClient } from '../../state/client'
import { ExchangeSource, SUSHI_PER_BLOCK } from '../../constants'
import { TOKEN_DATA, MASTERCHEF_POOLS, PAIR_BY_ID, PAIR_RESERVE_BY_ID } from '../../state/queries'
import { useEthPrice } from '../../contexts/globalData'
import { useBlockNumber } from '../../state/application/hooks'
import { getBlocksFromTimestamps } from '../../utils'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
dayjs.extend(utc)

const SUSHI_ADDRESS = _find(tokensList.tokens, { symbol: 'SUSHI' }).address
const sushiContract = new Contract(SUSHI_ADDRESS, erc20Interface)

interface SushiData {
  totalSupply: JSBI
  valueUSD: number
  marketCap: number
}

export const useSushiData = (): SushiData | null => {
  const sushiContractResult = useSingleCallResult(sushiContract, 'totalSupply')
  const [ethPrice] = useEthPrice(ExchangeSource.SUSHISWAP)
  const [out, setOut] = useState<SushiData | null>(null)
  const blockNumber = useBlockNumber()
  const [lastBlock, setLastBlock] = useState<number>(0)

  useEffect(() => {
    const get = async () => {
      console.debug('Updating useSushiData: ' + blockNumber)

      const totalSupply = JSBI.BigInt(_get(sushiContractResult, 'result.0', '-1'))
      if (ethPrice > 0 && JSBI.GT(totalSupply, 0)) {
        const tokenData = await sushiClient.query({
          query: TOKEN_DATA(SUSHI_ADDRESS),
          fetchPolicy: 'network-only',
        })
        const derivedETH = _get(tokenData, 'data.tokens[0].derivedETH', null)
        const valueUSD = derivedETH * ethPrice
        const marketCap = parseInt(JSBI.divide(totalSupply, JSBI.BigInt(1e18)).toString()) * derivedETH * ethPrice
        setOut({ marketCap, totalSupply, valueUSD })
      }
    }
    // Fetch only for new blocks
    if (blockNumber && lastBlock < blockNumber) {
      get()
      setLastBlock(blockNumber)
    }
  }, [ethPrice, sushiContractResult, blockNumber, lastBlock])
  return out
}

interface TokenReserve {
  id: string
  symbol: string
  reserve: number
  valueUSD: number
}
interface SushiMenu {
  token0: TokenReserve
  token1: TokenReserve
  totalValueUSD: number
  totalValueUsd24HChange: number
  liquidityTokenBalance: number
  rewardPerHour: number
  hourlyROI: number
}

export const useSushiMenu = (ethereumBlockTime: number | null): SushiMenu[] | null => {
  const [menu, setMenu] = useState<SushiMenu[] | null>(null)
  const [lastBlock, setLastBlock] = useState<number>(0)
  const blockNumber = useBlockNumber()
  const [ethPrice] = useEthPrice(ExchangeSource.SUSHISWAP)
  useEffect(() => {
    const get = async () => {
      console.debug('Updating SushuMenu: ', blockNumber)

      const masterChef = await masterChefClient.query({
        query: MASTERCHEF_POOLS(20),
        fetchPolicy: 'cache-first',
      })
      const poolIds = masterChef.data.masterChefPools.map((p: any) => p.lpToken)

      const masterchefPairs = await sushiClient.query({
        query: PAIR_BY_ID(poolIds),
        fetchPolicy: 'network-only',
      })

      const utcCurrentTime = dayjs()
      const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
      // get the blocks needed for time travel queries
      const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack])
      const masterchefPairsOneDayAgo = await sushiClient.query({
        query: PAIR_RESERVE_BY_ID(poolIds, oneDayBlock.number),
        fetchPolicy: 'network-only',
      })

      const masterChefTotalAllocPoint = masterChef.data.masterChef.totalAllocPoint
      const pairs = masterchefPairs.data.pairs
      const liquidityPositions = masterchefPairs.data.liquidityPositions
      setMenu(
        pairs.map(
          (pair): SushiMenu => {
            const totalSupply = pair.totalSupply
            const totalSupply24HAgo = _find(masterchefPairsOneDayAgo.data.pairs, { id: pair.id }).totalSupply

            const totalValueUSD = parseFloat(pair.reserveUSD)
            const allocPoint = _find(masterChef.data.masterChefPools, { lpToken: pair.id }).allocPoint
            const rewardPerBlock = (allocPoint / masterChefTotalAllocPoint) * SUSHI_PER_BLOCK
            const rewardPerHour = (3600 / ethereumBlockTime) * rewardPerBlock

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
              liquidityTokenBalance: parseFloat(
                _find(liquidityPositions, { pair: { id: pair.id } }).liquidityTokenBalance,
              ),
              rewardPerHour,
              hourlyROI: 0,
            }
          },
        ),
      )
    }
    // Fetch only for new blocks
    if (ethereumBlockTime && blockNumber && lastBlock < blockNumber) {
      get()
      setLastBlock(blockNumber)
    }
  }, [ethereumBlockTime, blockNumber, ethPrice, lastBlock])
  return menu
}
