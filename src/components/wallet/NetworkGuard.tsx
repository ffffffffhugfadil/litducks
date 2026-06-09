import { useAccount } from 'wagmi'
import { useNetworkGuard } from '../../hooks/useNetworkGuard'
import { AlertTriangle, Wifi } from 'lucide-react'
import { FAUCET_URL } from '../../lib/chain'

interface Props {
  children: React.ReactNode
}

export default function NetworkGuard({ children }: Props) {
  const { isConnected } = useAccount()
  const { isCorrectNetwork, switchToLiteForge, isSwitching } = useNetworkGuard()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
          <Wifi className="w-6 h-6 text-text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold text-text mb-1">Wallet not connected</h3>
          <p className="text-sm text-text-secondary">Connect your wallet to continue</p>
        </div>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-text mb-1">Wrong Network</h3>
          <p className="text-sm text-text-secondary mb-4">
            Switch to LitVM LiteForge Testnet (Chain ID: 4441)
          </p>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={switchToLiteForge}
              disabled={isSwitching}
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isSwitching ? 'Switching…' : 'Switch to LiteForge'}
            </button>
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-secondary hover:text-primary transition-colors"
            >
              Get zkLTC from faucet →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
