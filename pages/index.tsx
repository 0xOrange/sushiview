import React from 'react'
import Container from '../components/container'
import dynamic from 'next/dynamic'
import { Panel } from '../components/app'
import { ExchangeSource } from '../constants'
import { getLayout } from '../components/layout/tabLayout'
import SushiMenu from '../components/sushiMenu'

const GlobalChart = dynamic(() => import('../components/charts/globalChart'), {
  ssr: false,
})

const Index = (): JSX.Element => {
  return (
    <>
      <Container>
        <div className="flex flex-col lg:flex-row items-center pb-6">
          <div className="flex-1 max-w-xl min-w-full lg:min-w-0 mr-3">
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
        <SushiMenu />
      </Container>
    </>
  )
}

Index.getLayout = getLayout
export default Index
