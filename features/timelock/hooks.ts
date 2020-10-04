import { Timelock, setTimelocks, setFetchError } from './timelockSlice'
import { AppState } from '..'
import { useDispatch, useSelector } from 'react-redux'
import { Result, FetchError } from '../../utils'
import { useEffect } from 'react'
import { fetchTimelocks } from './api'

export const useTimelocks = (limit: number): Result<Timelock[] | null, FetchError> => {
  const dispatch = useDispatch()

  useEffect(() => {
    const get = async () => {
      console.debug('Fetching timelocks')
      ;(await fetchTimelocks(limit)).when({
        success: (result) => dispatch(setTimelocks(result)),
        failure: (e) => dispatch(setFetchError({ code: e.code, message: e.message })),
      })
    }
    get()
  }, [dispatch, limit])

  return useSelector<AppState, Result<Timelock[] | null, FetchError>>((state) =>
    state.timelock.fetchError ? Result.Err(state.timelock.fetchError) : Result.Ok(state.timelock.timelocks),
  )
}
