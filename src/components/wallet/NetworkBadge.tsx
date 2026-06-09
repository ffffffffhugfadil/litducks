import { useChainId } from 'wagmi'
import { useNetworkGuard } from '../../hooks/useNetworkGuard'
import { CHAIN_ID } from '../../lib/chain'

export default function NetworkBadge() {
  const chainId = useChainId()
  const { switchToLiteForge, isSwitching } = useNetworkGuard()

  if (chainId === CHAIN_ID) return null

  return (
    <button
      onClick={switchToLiteForge}
      disabled={isSwitching}
      className="mr-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
      {isSwitching ? 'Switching…' : 'Wrong Network'}
    </button>
  )
}
