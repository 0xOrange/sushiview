import { masterChefClient } from '../client'
import { TIMELOCKS } from '../queries'
import { Result, FetchError } from '../../utils'
import { Timelock } from './timelockSlice'
export const fetchTimelocks = async (limit: number): Promise<Result<Timelock[], FetchError>> => {
  try {
    const tokenData = await masterChefClient.query({
      query: TIMELOCKS(limit),
      fetchPolicy: 'network-only',
    })

    return Result.Ok(
      tokenData.data.timelocks.map((data) => ({
        id: data.id,
        eta: data.eta,
        functionName: data.functionName,
        data: data.data,
        targetAddress: data.targetAddress,
        isCancelled: data.isCancelled,
        isExecuted: data.isExecuted,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        cancelledAt: data.cancelledAt,
        executedAt: data.executedAt,
        createdTx: data.createdTx,
        executedTx: data.executedTx,
        cancelledTx: data.cancelledTx,
      })),
    )
  } catch (e) {
    console.error('Error fetching sushi data: ' + JSON.stringify(e))
    return Result.Err({ code: e.code || 500, message: e.message || 'Error fetching timelocks' })
  }
}
