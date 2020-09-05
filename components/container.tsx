import React from 'react'

interface Container {
  dottedBG?: boolean
  children: JSX.Element | JSX.Element[]
}
const Container = ({ dottedBG: dotted, children }: Container) => (
  <div className="app-container min-h-screen">
    <style jsx>{`
      .app-container {
        ${dotted &&
        `
          background-image: radial-gradient(#feebc8 2.5px, transparent 2.5px),
          radial-gradient(#feebc8 1px, transparent 1px);
          background-position: 0 0, 25px 25px;
          background-size: 50px 50px;
        `}
        width: 100%;
        margin: 0 auto;
        background-color: #f7fafc;
      }
    `}</style>
    <div className="container mx-auto max-w-5xl p-6 md:p-4 ">{children}</div>
  </div>
)

export default Container
