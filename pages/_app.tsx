import React from 'react'
import '../styles/index.css'
import { AppProps } from 'next/app'
import GlobalDataContextProvider from '../contexts/globalData'
import ApplicationContextProvider from '../contexts/application'
import MulticallUpdater from '../features/multicall/updater'
import store from '../features'
import { Provider } from 'react-redux'
import ApplicationUpdater from '../features/application/updater'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { NetworkContextName } from '../constants'
import { Web3Provider } from '@ethersproject/providers'
import Web3ReactManager from '../components/web3ReactManager'
import SiteLayout from '../components/layout/siteLayout'

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

function App({ Component, pageProps }: AppProps): JSX.Element {
  // ts-ignore
  const getLayout = Component['getLayout'] || ((page) => <SiteLayout>{page}</SiteLayout>)
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ContextProviders>
          <Provider store={store}>
            <MulticallUpdater />
            <ApplicationUpdater />
            <Web3ReactManager>{getLayout(<Component {...pageProps} />)}</Web3ReactManager>
          </Provider>
        </ContextProviders>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  )
}

export default App
