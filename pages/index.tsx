import React from 'react'
import Container from '../components/container'
import Header from '../components/header'
import dynamic from 'next/dynamic'
import cn from 'classnames'
const GlobalChart = dynamic(() => import('../components/charts/globalChart'), {
  ssr: false,
})

interface Panel {
  className?: string
  children: JSX.Element | JSX.Element[]
}
const Panel = ({ className, children }: Panel) => (
  <>
    <div className={cn(className, 'panel border-gray-200 border-2 rounded-lg py-4 pl-4 bg-white shadow-md')}>
      {children}
    </div>
    <style jsx>{`
      .panel {
        min-height: 300px;
      }
    `}</style>
  </>
)
const Home = () => (
  <>
    <Header />
    <Container dottedBG>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 md:order-1">Sushi plate</div>
        <Panel className="flex-1 max-w-xl">
          <GlobalChart display="liquidity" />
        </Panel>
      </div>
    </Container>
  </>
)

export default Home
