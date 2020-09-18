import { ethers } from 'ethers'
import { Currency, ChainId, Token, ETHER, WETH } from '../forks/@uniswap/sdk/dist'

export const isAddress = (value: string) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined
}
