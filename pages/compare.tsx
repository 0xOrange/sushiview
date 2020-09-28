import React from 'react'
import Container from '../components/container'
import { CompareTable } from '../components/compareTable/compareTable'
import dynamic from 'next/dynamic'
import { Panel } from '../components/app'
import { ExchangeSource } from '../constants'
import { getLayout } from '../components/layout/tabLayout'

const GlobalChart = dynamic(() => import('../components/charts/globalChart'), {
  ssr: false,
})

const Compare = (): JSX.Element => {
  return (
    <>
      <Container>
        <div className="flex flex-col lg:flex-row items-center pb-6">
          <div className="flex-1 max-w-xl min-w-full lg:min-w-0 first:mr-4">
            <Panel className="mt-4">
              <GlobalChart display="liquidity" source={ExchangeSource.SUSHISWAP} />
            </Panel>
          </div>

          <div className="flex-1 max-w-xl min-w-full lg:min-w-0">
            <Panel className="mt-4">
              <GlobalChart display="liquidity" source={ExchangeSource.UNISWAP} />
            </Panel>
          </div>
        </div>
      </Container>
      <Container>
        <div className="min-h-screen pb-16">
          <CompareTable />
        </div>
      </Container>
    </>
  )
}

Compare.getLayout = getLayout

export default Compare
