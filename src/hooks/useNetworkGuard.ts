import { useChainId, useSwitchChain } from 'wagmi'
import { CHAIN_ID, liteForge } from '../lib/chain'

export function useNetworkGuard() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const isCorrectNetwork = chainId === CHAIN_ID

  const switchToLiteForge = () => {
    switchChain({ chainId: liteForge.id })
  }

  return { isCorrectNetwork, switchToLiteForge, isSwitching: isPending }
}
