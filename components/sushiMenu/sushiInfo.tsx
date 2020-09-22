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
  <div className={cn('', className)}>
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
    <div className={cn(className, 'bg-white rounded-md border border-gray-300')}>
      <div className="text-gray-800 text-lg border-b border-gray-200 p-3 text-center">
        {emoji && <span className="mr-3 text-lg">{emoji}</span>}
        <a href={link} className="hover:underline">
          {header}
        </a>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}
