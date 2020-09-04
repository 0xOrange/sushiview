interface Container {
    dottedBG?: boolean
    children: JSX.Element | JSX.Element[]
}
const Container = ({ dottedBG: dotted, children }: Container) => (
    <div className="app-container min-h-screen">
        <style jsx>{`
          .app-container {
              ${dotted && `
              `}
              width: 100%;
                margin: 0 auto;
              background-image: radial-gradient(#FEEBC8 2.5px, transparent 2.5px), radial-gradient(#FEEBC8 1px, transparent 1px);
              background-color: #F7FAFC;
              background-position: 0 0, 25px 25px;
              background-size: 50px 50px;
          }
        `}</style>
        <div className="container mx-auto max-w-5xl pt-4">
            {children}
        </div>
    </div>
)

export default Container;
