import cn from 'classnames'
import React from 'react'

interface Panel {
  className?: string
  children: JSX.Element | JSX.Element[]
}
export const Panel = ({ className, children }: Panel) => (
  <>
    <div className={cn(className, 'panel border-gray-200 border-0 rounded-md py-4 pl-4 bg-white shadow-lg')}>
      {children}
    </div>
    <style jsx>{`
      .panel {
        height: 332px;
        min-height: 332px;
      }
    `}</style>
  </>
)

interface Button {
  type?: 'primary' | 'secondary'
  children: JSX.Element | JSX.Element[] | string
}
export const Button = ({ type = 'primary', children }: Button) => (
  <button
    className={cn(
      'h-10 w-48 rounded-lg flex justify-center items-center text-md font-bold first:mr-8 shadow-lg focus:outline-none transform hover:scale-105',
      { 'bg-orange-500  text-white': type === 'primary' },
      { 'bg-gray-200  text-gray-700': type === 'secondary' },
    )}
  >
    {children}
  </button>
)

interface Dominance {
  sushiPercent: number
  className?: string
}
export const Dominance = ({ sushiPercent, className }: Dominance) => (
  <div className={cn('flex w-full h-4', className)}>
    <div className="sushi text-center rounded-l-lg bg-orange-500 text-white text-xs leading-4">
      sushiswap ({(sushiPercent * 100).toFixed(0)}%)
    </div>
    <div className="uni text-center rounded-r-lg text-xs leading-4 bg-gray-200 text-gray-600">
      uniswap ({((1 - sushiPercent) * 100).toFixed(0)}%)
    </div>
    <style jsx>{`
      .sushi {
        flex: 1;
        flex: ${sushiPercent};
      }
      .uni {
        flex: ${1 - sushiPercent};
      }
    `}</style>
  </div>
)
