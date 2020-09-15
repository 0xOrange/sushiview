import React from 'react'
import '../styles/index.css'
import { AppProps } from 'next/app'
import GlobalDataContextProvider from '../contexts/globalData'
import ApplicationContextProvider from '../contexts/application'
import MulticallUpdater from '../state/multicall/updater'
import store from '../state'
import { Provider } from 'react-redux'
import ApplicationUpdater from '../state/application/updater'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { NetworkContextName } from '../constants'
import { Web3Provider } from '@ethersproject/providers'
import Web3ReactManager from '../components/web3ReactManager'

let Web3ProviderNetwork: any = () => <></>
if (process.browser) {
  Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

  if ('ethereum' in window) {
    ;(window['ethereum'] as any).autoRefreshOnNetworkChange = false
  }
}

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}

const ContextProviders = ({ children }: any) => (
  <ApplicationContextProvider>
    <GlobalDataContextProvider>{children}</GlobalDataContextProvider>
  </ApplicationContextProvider>
)
function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ContextProviders>
          <Provider store={store}>
            <MulticallUpdater />
            <ApplicationUpdater />
            <Web3ReactManager>
              <Component {...pageProps} />
            </Web3ReactManager>
          </Provider>
        </ContextProviders>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  )
}

export default App
