import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useState, useCallback } from 'react'
import { NetworkContextName } from '../constants'
import { injected } from '../utils/connectors'
import { isMobile } from 'react-device-detect'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

// modified from https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// chunks array into chunks of maximum size
// evenly distributes items among the chunks
export function chunkArray<T>(items: T[], maxChunkSize: number): T[][] {
  if (maxChunkSize < 1) throw new Error('maxChunkSize must be gte 1')
  if (items.length <= maxChunkSize) return [items]

  const numChunks: number = Math.ceil(items.length / maxChunkSize)
  const chunkSize = Math.ceil(items.length / numChunks)

  return [...Array(numChunks).keys()].map((ix) => items.slice(ix * chunkSize, ix * chunkSize + chunkSize))
}

const VISIBILITY_STATE_SUPPORTED = 'visibilityState'

function isWindowVisible() {
  if (process.browser) {
    return !VISIBILITY_STATE_SUPPORTED || document.visibilityState !== 'hidden'
  }
  return false
}

/**
 * Returns whether the window is currently visible to the user.
 */
export function useIsWindowVisible(): boolean {
  const [focused, setFocused] = useState<boolean>(isWindowVisible())
  const listener = useCallback(() => {
    setFocused(isWindowVisible())
  }, [setFocused])

  useEffect(() => {
    if (!VISIBILITY_STATE_SUPPORTED) return undefined

    if (process.browser) {
      document.addEventListener('visibilitychange', listener)

      return () => {
        document.removeEventListener('visibilitychange', listener)
      }
    }
  }, [listener])

  return focused
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window['ethereum']) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const ethereum = window['ethereum']

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
