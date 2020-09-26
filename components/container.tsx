import React from 'react'
import cn from 'classnames'

interface Container {
  children: JSX.Element | JSX.Element[] | string
  className?: string
}
const Container = ({ children, className }: Container): JSX.Element => (
  <div className={cn('app-container', className)}>
    <style jsx>{`
      .app-container {
        width: 100%;
        margin: 0 auto;
      }
    `}</style>
    <div className="container mx-auto max-w-6xl">{children}</div>
  </div>
)

export default Container
