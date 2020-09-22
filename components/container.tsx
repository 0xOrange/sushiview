import React from 'react'
import cn from 'classnames'

interface Container {
  dottedBG?: boolean
  children: JSX.Element | JSX.Element[] | string
  className?: string
}
const Container = ({ dottedBG: dotted, children, className }: Container): JSX.Element => (
  <div className={cn('app-container', className)}>
    <style jsx>{`
      .app-container {
        ${dotted
          ? `
          background-color: #ffffff;
        `
          : 'background-color: #ffffff;'}
        width: 100%;
        margin: 0 auto;
      }
    `}</style>
    <div className="container mx-auto max-w-6xl px-6 md:p-4">{children}</div>
  </div>
)

export default Container
