import { ethers } from 'ethers'

export const isAddress = (value: string) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}
