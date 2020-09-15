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
export const SUSHI_INIT_CODE_HASH = '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'
export const UNI_INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'

export const factoryAddress: Record<ExchangeSource, string> = {
  [ExchangeSource.UNISWAP]: UNI_FACTORY_ADDRESS,
  [ExchangeSource.SUSHISWAP]: SUSHI_FACTORY_ADDRESS,
}

export const initCodeHash: Record<ExchangeSource, string> = {
  [ExchangeSource.UNISWAP]: UNI_INIT_CODE_HASH,
  [ExchangeSource.SUSHISWAP]: SUSHI_INIT_CODE_HASH,
}

export const BUNDLE_ID = '1'

export const NetworkContextName = 'NETWORK'
