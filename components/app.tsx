import cn from 'classnames'
import React, { useState } from 'react'

interface IPanel {
  className?: string
  children: JSX.Element | JSX.Element[]
}
export const Panel = ({ className, children }: IPanel): JSX.Element => (
  <>
    <div className={cn(className, 'panel rounded-md py-4 pl-4 border-gray-400 border bg-white')}>{children}</div>
    <style jsx>{`
      .panel {
        height: 332px;
        min-height: 332px;
      }
    `}</style>
  </>
)

interface ISpinner {
  className?: string
}
export const Spinner = ({ className }: ISpinner): JSX.Element => (
  <svg viewBox="0 0 38 38" className={cn('stroke-current text-gray-500 w-8 h-8', className)}>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)" strokeWidth="3">
        <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </g>
  </svg>
)

interface IButton {
  type?: 'primary' | 'secondary'
  children: JSX.Element | JSX.Element[] | string
}
export const Button = ({ type = 'primary', children }: IButton): JSX.Element => (
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

interface IDominance {
  sushiPercent: number
  className?: string
}
export const Dominance = ({ sushiPercent, className }: IDominance): JSX.Element => (
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

interface ICurrencyInput {
  className?: string
  tokenList: {
    symbol: string
    address: string
  }[]
  amount: string
  address: string
  onChange: (value: string, address: string) => any
}
export const CurrencyInput = ({ className, tokenList, onChange, address, amount }: ICurrencyInput): JSX.Element => {
  const [inputTokenAmount, setInputTokenAmount] = useState<string>(amount)
  const [inputTokenAddress, setInputTokenAddress] = useState<string>(address)

  return (
    <div className={cn('mb-4 flex', className)}>
      <div>
        <label htmlFor="price" className="block text-base leading-5 font-medium text-gray-700">
          Swap from
        </label>
        <div className="mt-1 relative border border-gray-400">
          <input
            id="price"
            className="form-input block w-full h-12 pl-4 pr-12 sm:text-sm sm:leading-5"
            type="number"
            value={inputTokenAmount}
            onChange={(e) => setInputTokenAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 mr-4 flex items-center">
            <select
              aria-label="Currency"
              value={inputTokenAddress}
              className="form-select h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-700 sm:text-sm sm:leading-5"
              onChange={(e) => setInputTokenAddress(e.target.value)}
            >
              {tokenList.map((t) => (
                <option key={t.address} value={t.address}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button
        className="ml-4 mt-6 bg-gray-300 h-12 px-4 rounded-md hover:bg-gray-400"
        onClick={() => onChange(inputTokenAmount, inputTokenAddress)}
      >
        Check
      </button>
    </div>
  )
}
