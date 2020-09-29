import React, { useState } from 'react'
import _find from 'lodash/find'
import tokensList from '../../tokens.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'

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
  const tokenLogo = _find(tokensList.tokens, { address: inputTokenAddress }).logoURI

  return (
    <div className={cn('rounded-lg', className)}>
      <div className="relative flex">
        <input
          id="price"
          className="form-input border border-gray-400 block w-full pl-4 pr-12 sm:text-sm font-semibold sm:leading-5 h-8 bg-gray-200 rounded-lg focus:outline-none"
          type="number"
          value={inputTokenAmount}
          onChange={(e) => setInputTokenAmount(e.target.value)}
          placeholder="0.00"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <img src={tokenLogo} className="w-4 h-4 hidden md:block" />
          <select
            aria-label="Currency"
            className="form-select focus:outline-none w-12 mr-3 ml-1 h-full py-0 pr-7 border-transparent bg-transparent text-gray-800 sm:text-sm sm:leading-5"
            value={inputTokenAddress}
            onChange={(e) => setInputTokenAddress(e.target.value)}
          >
            {tokenList.map((t) => (
              <option key={t.address} value={t.address}>
                {t.symbol}
              </option>
            ))}
          </select>
          <button
            className="cursor-pointer mr-3 focus:outline-none"
            onClick={() => onChange(inputTokenAmount, inputTokenAddress)}
          >
            <FontAwesomeIcon
              icon={faChevronCircleRight}
              className={cn('p-1 text-gray-400', { 'text-gray-600': inputTokenAmount != '' })}
              size="2x"
            />
          </button>
        </div>
      </div>
      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
