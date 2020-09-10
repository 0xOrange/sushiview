import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const uniClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/id/QmUNBwiwJbRRYUZRwxcD187uKou5AqKjKqdqnwcW8gP6u3',
  }),
  cache: new InMemoryCache(),
})

export const sushiClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/id/QmePtiMXjoFp5YiJeraZhp6YsBQNpLKCKQ4q8DFUjrSk5C',
  }),
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  }),
  cache: new InMemoryCache(),
})
