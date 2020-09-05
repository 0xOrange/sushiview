import React from 'react'
import Container from '../components/container'
import Header from '../components/header'

const Home = () => (
  <>
    <Header />
    <Container dottedBG>
      <p className="bg-red-200">Welcome to SushiView.</p>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 md:order-1">Sushi plate</div>
        <div className="flex-1">Chart</div>
      </div>
    </Container>
  </>
)

export default Home
