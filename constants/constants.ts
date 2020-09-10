export enum TimeFrame {
  WEEK,
  MONTH,
  ALL_TIME,
}

export enum ExchangeSource {
  UNISWAP,
  SUSHISWAP,
}

export const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
export const UNI_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export const factoryAddress: Record<ExchangeSource, string> = {
  [ExchangeSource.UNISWAP]: UNI_FACTORY_ADDRESS,
  [ExchangeSource.SUSHISWAP]: SUSHI_FACTORY_ADDRESS,
}

export const BUNDLE_ID = '1'
