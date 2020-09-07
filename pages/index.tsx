import React from 'react'
import Container from '../components/container'
import Header from '../components/header'
import dynamic from 'next/dynamic'
import { Button, Panel, Dominance } from '../components/app'

import { global_chart, global_data } from '../components/charts/mock'
const GlobalChart = dynamic(() => import('../components/charts/globalChart'), {
  ssr: false,
})

const Home = () => {
  return (
    <>
      <Header />
      <Container dottedBG className="py-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col flex-1 justify-center md:order-1 max-w-xl first:ml-12 w-full">
            <img src="/sushi-plate.svg" alt="Sushi plate" />
            <div className="absolute self-center flex flex-col -mt-24">
              <p className="text-5xl text-gray-800 text-center w-full">
                <span className="text-3xl pb-12 text-gray-600">$</span>3.02
              </p>
              <div className="flex justify-between mt-4 ml-6">
                {['🍣  20,000,000', '🍴 100 sushi/hr'].map((t, key) => (
                  <div
                    className="h-8 rounded-lg bg-gray-200 flex justify-center items-center text-gray-600 px-2 text-sm first:mr-4"
                    key={key}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button type="primary">
                <>
                  <span className="text-lg mr-3">👩‍🍳</span>Earn
                </>
              </Button>
              <Button type="secondary">
                <>
                  <span className="text-lg mr-3">🍣</span>Trade
                </>
              </Button>
            </div>
          </div>
          <div className="flex-1 max-w-xl">
            <Dominance sushiPercent={0.7} />
            <Panel className="mt-4  border-2 border-orange-100">
              <GlobalChart display="volume" globalChart={global_chart} globalData={global_data} />
            </Panel>
          </div>
        </div>
      </Container>
    </>
  )
}

export default Home
