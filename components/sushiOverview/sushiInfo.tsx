import React from 'react'
import cn from 'classnames'

export const OverviewItem = ({
  title,
  value,
  className,
}: {
  title: string
  value: string
  className?: string
}): JSX.Element => (
  <div className={cn('w-48', className)}>
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-lg font-semibold  text-gray-700">{value}</div>
  </div>
)

export const OverviewContainer = ({
  className,
  children,
  header,
  emoji,
  link,
}: {
  className?: string
  children: JSX.Element | JSX.Element[]
  header: string
  emoji?: string
  link: string
}): JSX.Element => {
  return (
    <div className={cn('bg-white rounded-md border border-gray-400 max-w-md', className)}>
      <div className="text-gray-800 font-semibold py-2 text-center bg-gray-200 rounded-t">
        {emoji && <span className="mr-3">{emoji}</span>}
        <a href={link} className="hover:underline">
          {header}
        </a>
      </div>
      <div className="px-3 h-20">{children}</div>
    </div>
  )
}
