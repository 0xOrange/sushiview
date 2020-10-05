import React from 'react'

const SiteLayout = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <div className="bg-white antialiased">
      <div className="mx-auto px-2 md:px-6 max-w-5xl">
        <nav>
          <div className="py-4 flex-shrink-0 flex items-center">
            <img src="/sushiview-logo.svg" className="w-32 hover:opacity-75" />
          </div>
        </nav>
      </div>
      <div className="mt-8 sm:mt-0 sm:py-12">{children}</div>
    </div>
  )
}

export const getLayout = (page: JSX.Element): JSX.Element => <SiteLayout>{page}</SiteLayout>

export default SiteLayout
