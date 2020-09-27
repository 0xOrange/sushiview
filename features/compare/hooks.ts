import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from '..'
import { ExchangeSource } from '../../constants'
import { getPriceData } from './api'
import { updateSushiPriceData, setFetchError, updateUniPriceData, PriceTable } from './compareSlice'
import { Result } from '../../utils'

export const usePriceTable = (
  ethPrice: number,
  ethPriceOld: number,
): Result<
  { uniPriceTable: PriceTable[] | null; sushiPriceTable: PriceTable[] | null },
  AppState['compare']['fetchError']
> => {
  const dispatch = useDispatch()
  const sushiPriceTable = useSelector<AppState, AppState['compare']['sushiPriceTable']>(
    (state) => state.compare.sushiPriceTable,
  )
  const uniPriceTable = useSelector<AppState, AppState['compare']['uniPriceTable']>(
    (state) => state.compare.sushiPriceTable,
  )
  const fetchError = useSelector<AppState, AppState['compare']['fetchError']>((state) => state.compare.fetchError)
  useEffect(() => {
    const sushi = async () => {
      ;(await getPriceData(ExchangeSource.SUSHISWAP, ethPrice, ethPriceOld)).when({
        success: (res) => dispatch(updateSushiPriceData(res)),
        failure: (e) => dispatch(setFetchError(e)),
      })
    }

    const uni = async () => {
      ;(await getPriceData(ExchangeSource.UNISWAP, ethPrice, ethPriceOld)).when({
        success: (res) => dispatch(updateUniPriceData(res)),
        failure: (e) => dispatch(setFetchError(e)),
      })
    }
    if (ethPrice && ethPriceOld) {
      if (sushiPriceTable == null) {
        sushi()
      }
      if (uniPriceTable == null) {
        uni()
      }
    }
  }, [ethPrice, ethPriceOld, uniPriceTable, sushiPriceTable, dispatch])

  return fetchError ? Result.Err(fetchError) : Result.Ok({ uniPriceTable, sushiPriceTable })
}
