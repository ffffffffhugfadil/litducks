import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useState } from 'react'
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink } from 'lucide-react'
import { formatEther } from 'viem'
import { liteForge, EXPLORER_URL } from '../../lib/chain'
import NetworkBadge from './NetworkBadge'

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address, chainId: liteForge.id })
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (!isConnected) {
    const injectedConnector = connectors.find(c => c.id === 'injected' || c.name === 'MetaMask') ?? connectors[0]
    return (
      <button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-60"
      >
        <Wallet className="w-4 h-4" />
        {isPending ? 'Connecting…' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="relative">
      <NetworkBadge />
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 bg-surface border border-border hover:border-border-2 rounded-lg text-sm font-medium transition-all duration-150"
      >
        <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
        <span className="text-text font-mono text-xs">{shortAddr(address!)}</span>
        {balance && (
          <span className="text-text-secondary text-xs hidden sm:inline">
            {parseFloat(formatEther(balance.value)).toFixed(3)} zkLTC
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-xl shadow-card z-20 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-border">
              <p className="text-xs text-text-secondary mb-1">Connected wallet</p>
              <p className="font-mono text-sm text-text">{shortAddr(address!)}</p>
              {balance && (
                <p className="text-xs text-text-secondary mt-1">
                  {parseFloat(formatEther(balance.value)).toFixed(6)} zkLTC
                </p>
              )}
            </div>
            <div className="p-1">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy address'}
              </button>
              <a
                href={`${EXPLORER_URL}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on explorer
              </a>
              <button
                onClick={() => { disconnect(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
