import Link from 'next/link'
import { getLayout as getSiteLayout } from './siteLayout'
import { useRouter } from 'next/router'
import React from 'react'

const ActiveLink = ({
  children,
  href,
  className,
}: {
  children: JSX.Element | string
  href: string
  className?: string
}) => {
  const router = useRouter()
  return (
    <Link href={href} scroll={false}>
      <a
        className={`${
          router.pathname === href
            ? 'text-gray-900 border-orange-500'
            : 'text-gray-600 hover:text-gray-700 border-transparent'
        } ${className} block pb-4 font-semibold text-sm sm:text-base border-b-2 focus:outline-none focus:text-gray-900 whitespace-no-wrap`}
      >
        {children}
      </a>
    </Link>
  )
}

const TabLayout = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-6 flex overflow-x-auto scrollbar-none" style={{ boxShadow: 'inset 0 -2px 0 #edf2f7' }}>
        <ActiveLink href="/">
          <div>
            <span className="mr-2">🚜</span>
            Farms
          </div>
        </ActiveLink>

        <ActiveLink href="/sushibar" className="ml-10">
          <div>
            <span className="mr-2">🍺</span>
            SushiBar
          </div>
        </ActiveLink>

        <ActiveLink href="/timelock" className="ml-10">
          <div>
            <span className="mr-2">⏱️</span>
            Timelocks
          </div>
        </ActiveLink>

        <ActiveLink href="/compare" className="ml-10">
          <div>
            <span className="mr-2">🦄</span>
            Compare
          </div>
        </ActiveLink>
      </div>

      <div>{children}</div>
    </div>
  )
}

export const getLayout = (page: JSX.Element): JSX.Element => getSiteLayout(<TabLayout>{page}</TabLayout>)

export default TabLayout
