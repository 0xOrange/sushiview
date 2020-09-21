import React from 'react'
import Container from '../components/container'
import Header from '../components/header'
import dynamic from 'next/dynamic'
import { Panel } from '../components/app'
import { ExchangeSource } from '../constants'
import SushiMenu from '../components/sushiMenu/sushiMenu'

const GlobalChart = dynamic(() => import('../components/charts/globalChart'), {
  ssr: false,
})

const Home = (): JSX.Element => {
  return (
    <>
      <Header />
      <Container dottedBG className="py-6">
        <div className="flex flex-col lg:flex-row items-center pb-6">
          <div className="flex-1 max-w-xl min-w-full lg:min-w-0 first:mr-4">
            <Panel className="mt-4">
              <GlobalChart display="liquidity" source={ExchangeSource.SUSHISWAP} />
            </Panel>
          </div>

          <div className="flex-1 max-w-xl min-w-full lg:min-w-0">
            <Panel className="mt-4">
              <GlobalChart display="volume" source={ExchangeSource.SUSHISWAP} />
            </Panel>
          </div>
        </div>
      </Container>
      <Container>
        <div className="h-screen">
          <SushiMenu />
        </div>
      </Container>
    </>
  )
}

export default Home
