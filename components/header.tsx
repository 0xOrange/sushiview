import React from 'react'
import { memo } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import { useRouter } from 'next/router'

const Logo = () => (
  <>
    <img src="/sushiview-logo.svg" className="mr-12 hidden md:block md:ml-6 min-w-32 w-32 mt-px" />
    <p className="text-3xl md:hidden px-6 h-full text-center">🍣</p>
  </>
)

const NavItem = ({
  children,
  title,
  href,
  selected,
}: {
  children: JSX.Element | string
  title: string
  href: string
  selected?: boolean
}) => (
  <Link href={href}>
    <a
      className={cn('text-gray-500 hover:text-gray-700 px-4 py-2 first:px-0 no-underline text-lg', {
        'text-orange-500 hover:text-orange-500': selected,
      })}
      title={title}
    >
      {children}
    </a>
  </Link>
)

const Nav = () => {
  const { route } = useRouter()

  return (
    <nav className="max-w-5xl w-screen flex space-between items-center">
      <div className="flex flex-1 items-center">
        <NavItem title="SushiView Home" href="/">
          <Logo />
        </NavItem>
        <NavItem title="Tokens" href="#" selected={route.startsWith('/tokens')}>
          Tokens
        </NavItem>
        <NavItem title="Pools" href="#" selected={route.startsWith('/pools')}>
          Pools
        </NavItem>
        <NavItem title="Accounts info" href="#" selected={route.startsWith('/accounts')}>
          Accounts
        </NavItem>
      </div>

      <button className="hidden md:block md:mr-6 outline-none border-solid border-2 border-gray-600 rounded-lg h-10 px-2 hover:bg-orange-500 hover:border-orange-500 hover:text-white focus:outline-none">
        My Account
      </button>
    </nav>
  )
}

const Header = () => (
  <header className="bg-white sticky top-0 flex flex-col h-16 z-50 space-around items-center justify-center border-b border-solid border-gray-200">
    <Nav />
  </header>
)

export default memo(Header)
