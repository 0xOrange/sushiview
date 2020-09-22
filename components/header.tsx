import React from 'react'
import { memo } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import { useRouter } from 'next/router'

const Logo = () => (
  <>
    <img src="/sushiview-logo.svg" className="mr-12 hidden md:block min-w-32 w-32 mt-px" />
    <p className="text-3xl md:hidden h-full text-center">🍣</p>
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
      className={cn('text-gray-600 hover:text-gray-800 px-4 py-2 first:px-0 no-underline text-base', {
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
    <nav className="max-w-6xl px-6 w-screen flex space-between items-center">
      <div className="flex flex-1 items-center">
        <NavItem title="SushiView Home" href="/">
          <Logo />
        </NavItem>
        <NavItem title="Tokens" href="/" selected={route == '/'}>
          Dashboard
        </NavItem>
        <NavItem title="Tokens" href="/compare" selected={route.startsWith('/compare')}>
          Compare
        </NavItem>
      </div>
    </nav>
  )
}

const Header = () => (
  <header className="bg-white sticky top-0 flex flex-col h-16 z-50 space-around items-center justify-center">
    <Nav />
  </header>
)

export default memo(Header)
