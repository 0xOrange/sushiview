import React from 'react'
import { useTimelocks } from '../features/timelock/hooks'
import Error from 'next/error'
import { MASTERCHEF_ADDRESS, TIMELOCK_ADDRESS } from '../constants'
import _get from 'lodash/get'
import { Timelock } from '../features/timelock/timelockSlice'
import { getLayout } from '../components/layout/tabLayout'
import cn from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const targetNames = {
  [MASTERCHEF_ADDRESS]: 'MasterChef',
  [TIMELOCK_ADDRESS]: 'Timelock',
}

enum TimelockStatus {
  PENDING,
  CANCELLED,
  EXECUTED,
  EXPIRED,
}
const timelockStatusName: Record<TimelockStatus, string> = {
  [TimelockStatus.PENDING]: 'Pending',
  [TimelockStatus.CANCELLED]: 'Cancelled',
  [TimelockStatus.EXECUTED]: 'Executed',
  [TimelockStatus.EXPIRED]: 'Expired',
}

export const DataItem = ({
  title,
  value,
  className,
}: {
  title: string
  value: string | JSX.Element
  className?: string
}): JSX.Element => (
  <div className={cn(className)}>
    <div className="text-sm text-gray-500">{title}</div>
    <div className="font-semibold  text-gray-700">{value}</div>
  </div>
)

const TimelockContainer = ({
  targetAddress,
  isCancelled,
  isExecuted,
  expiresAt,
  eta,
  executedAt,
  cancelledAt,
  executedTx,
  cancelledTx,
  createdAt,
  createdTx,
  functionName,
  data,
}: Timelock) => {
  const title = _get(targetNames, targetAddress, targetAddress)
  let timelockStatus: TimelockStatus, timelockDateText
  if (isExecuted) {
    timelockStatus = TimelockStatus.EXECUTED
    timelockDateText = `executed ${dayjs.unix(executedAt).fromNow()}`
  } else if (isCancelled) {
    timelockStatus = TimelockStatus.CANCELLED
    timelockDateText = `cancelled ${dayjs.unix(cancelledAt).fromNow()}`
  } else if (eta > Date.now() / 1000) {
    timelockStatus = TimelockStatus.PENDING
    timelockDateText = `unlocks in ${dayjs.unix(eta).fromNow()}`
  } else {
    timelockStatus = TimelockStatus.EXPIRED
    timelockDateText = `expired ${dayjs.unix(expiresAt).fromNow(true)} ago`
  }
  return (
    <div className="border border-gray-300 rounded-sm p-4 shadow-sm mt-2">
      <div className="flex justify-between">
        <div>
          <a
            className="text-xl font-semibold text-gray-800 hover:underline hover:text-gray-600"
            href={`https://etherscan.io/address/${targetAddress}`}
          >
            {title}
          </a>
          <div className="text-xs text-gray-600 -mt-1">{timelockDateText}</div>
        </div>
        <div
          className={cn(
            'rounded-full px-4 h-6 flex justify-center items-center',
            { 'bg-green-200': timelockStatus === TimelockStatus.EXECUTED },
            { 'bg-gray-300': timelockStatus === TimelockStatus.PENDING },
            { 'bg-gray-100': timelockStatus === TimelockStatus.EXPIRED },
            { 'bg-red-200': timelockStatus === TimelockStatus.CANCELLED },
          )}
        >
          <div className="text-gray-700 text-xs">
            {timelockStatus === TimelockStatus.EXECUTED || timelockStatus === TimelockStatus.CANCELLED ? (
              <a
                className="hover:text-gray-600 hover:underline cursor-pointer"
                href={`https://etherscan.io/tx/${
                  timelockStatus === TimelockStatus.EXECUTED ? executedTx : cancelledTx
                }`}
              >
                {timelockStatusName[timelockStatus].toUpperCase()}
              </a>
            ) : (
              timelockStatusName[timelockStatus].toUpperCase()
            )}
          </div>
        </div>
      </div>
      <div className="flex mt-2 justify-between">
        <DataItem
          title="Created"
          value={
            <a href={`https://etherscan.io/tx/${createdTx}`} className="hover:underline hover:text-gray-600 underline">
              {dayjs.unix(createdAt).format('MMMM D, YYYY h:mm A')}
            </a>
          }
        />
        <DataItem title="End" value={dayjs.unix(expiresAt).format('MMMM D, YYYY h:mm A')} />
        <DataItem title="Function" value={functionName} className="md:w-64" />
      </div>
      <DataItem title="Data" value={<span className="text-gray-600">{data}</span>} className="mt-3 truncate" />
    </div>
  )
}

const TL = () => {
  const timeLocksResult = useTimelocks(50)

  if (timeLocksResult.isError) return <Error statusCode={500} />

  const timeLocks = timeLocksResult.unwrap()
  if (!timeLocks)
    return (
      <div className="animate-pulse flex space-x-4 w-full bg-white mt-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-400 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-400 rounded"></div>
            <div className="h-4 bg-gray-400 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="">
      {timeLocks.map((t) => (
        <TimelockContainer {...t} key={t.id} />
      ))}
    </div>
  )
}

TL.getLayout = getLayout
export default TL
