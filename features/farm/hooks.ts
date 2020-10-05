import { updateSushiData, SushiData, fetchSushiData } from './'
import { Result } from '../../utils'
import { useSingleCallResult } from '../multicall/hooks'
import { ExchangeSource, SUSHIBAR_ADDRESS } from '../../constants'
import { useEthPrice } from '../../contexts/globalData'
import { Contract } from 'ethers'
import erc20Interface from '../../constants/abis/erc20'
import _find from 'lodash/find'
import _get from 'lodash/get'
import tokensList from '../../tokens.json'
import { useEffect, useState } from 'react'
import JSBI from 'jsbi'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '..'
import { ISushiMenu, setFetchError, updateSushiMenu } from './farmSlice'
import { useBlockNumber } from '../application/hooks'
import { fetchSushiMenu } from './api'

const SUSHI_ADDRESS = _find(tokensList.tokens, { symbol: 'SUSHI' }).address
const sushiContract = new Contract(SUSHI_ADDRESS, erc20Interface)
const sushiBarContract = new Contract(SUSHIBAR_ADDRESS, erc20Interface)

export const useSushiData = (): Result<SushiData | null, AppState['farm']['fetchError']> => {
  const dispatch = useDispatch()
  const sushiContractResult = useSingleCallResult(sushiContract, 'totalSupply')
  const sushiBarContractResult = useSingleCallResult(sushiBarContract, 'totalSupply')
  const barSushiRes = useSingleCallResult(sushiContract, 'balanceOf', [SUSHIBAR_ADDRESS])
  const [ethPrice] = useEthPrice(ExchangeSource.SUSHISWAP)

  // TODO: Connect only if no subscribers already
  useEffect(() => {
    const get = async () => {
      console.debug('Updating useSushiData: ')

      const totalSupply = JSBI.BigInt(_get(sushiContractResult, 'result.0', '-1'))
      const sushiBarTotalSupply = JSBI.BigInt(_get(sushiBarContractResult, 'result.0', '-1'))
      const barSushi = JSBI.BigInt(_get(barSushiRes.result, '[0]', '-1'))
      if (ethPrice > 0 && JSBI.GT(totalSupply, 0) && JSBI.GT(barSushi, 0)) {
        ;(await fetchSushiData(totalSupply, sushiBarTotalSupply, barSushi, ethPrice)).when({
          success: (result) => dispatch(updateSushiData(result)),
          failure: (e) => dispatch(setFetchError({ code: e.code, message: e.message })),
        })
      }
    }
    get()
  }, [ethPrice, sushiContractResult, sushiBarContractResult, dispatch])

  return useSelector<AppState, Result<SushiData | null, AppState['farm']['fetchError']>>((state) =>
    state.farm.fetchError ? Result.Err(state.farm.fetchError) : Result.Ok(state.farm.sushiData),
  )
}

export const useSushiMenu = (
  ethereumBlockTime: number | null,
): Result<ISushiMenu[] | null, AppState['farm']['fetchError']> => {
  const [lastBlock, setLastBlock] = useState<number>(0)
  const blockNumber = useBlockNumber()
  const [ethPrice] = useEthPrice(ExchangeSource.SUSHISWAP)
  const dispatch = useDispatch()
  useEffect(() => {
    const get = async () => {
      ;(await fetchSushiMenu(ethereumBlockTime, ethPrice)).when({
        success: (result) => dispatch(updateSushiMenu(result)),
        failure: (e) => dispatch(setFetchError({ code: e.code, message: e.message })),
      })
    }
    // Fetch only for new blocks
    if (blockNumber && lastBlock < blockNumber) {
      get()
      setLastBlock(blockNumber)
    }
  }, [ethereumBlockTime, blockNumber, ethPrice, lastBlock, dispatch])

  return useSelector<AppState, Result<ISushiMenu[] | null, AppState['farm']['fetchError']>>((state) =>
    state.farm.fetchError ? Result.Err(state.farm.fetchError) : Result.Ok(state.farm.sushiMenu),
  )
}
