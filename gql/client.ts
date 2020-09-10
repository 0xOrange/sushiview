import { ApolloClient } from 'apollo-client'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ExchangeSource } from '../constants'

export const uniClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2',
  }),
  cache: new InMemoryCache(),
})

export const sushiClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/id/QmePtiMXjoFp5YiJeraZhp6YsBQNpLKCKQ4q8DFUjrSk5C',
  }),
  cache: new InMemoryCache(),
})

export const exchangeClient: Record<ExchangeSource, ApolloClient<NormalizedCacheObject>> = {
  [ExchangeSource.UNISWAP]: uniClient,
  [ExchangeSource.SUSHISWAP]: sushiClient,
}

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  }),
  cache: new InMemoryCache(),
})
