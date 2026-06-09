// src/pages/Dashboard.tsx
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, FACTORY_ABI } from '../config/contracts'  
import { CAMPAIGN_ABI } from '../config/contracts'  
import { Download, Trophy, Users, Calendar, ExternalLink, Loader2, PlusCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import NetworkGuard from '../components/wallet/NetworkGuard'
import { EXPLORER_URL } from '../lib/chain'

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function CampaignRow({ address, userAddress }: { address: string; userAddress: string }) {
  const [expanded, setExpanded] = useState(false)

  const { data: name } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'name',
  })

  const { data: description } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'description',
  })

  const { data: registrantCount } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'registrantCount',
  })

  const { data: winnerCount } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'winnerCount',
  })

  const { data: isActive } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'isActive',
  })

  const { data: totalSlots } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'totalSlots',
  })

  const { data: deadline } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'deadline',
  })

  const { data: creator } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'creator',
  })

  const { data: registrants } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'getRegistrants',
    query: { enabled: expanded },
  })

  const isOwner = creator && userAddress && creator.toLowerCase() === userAddress.toLowerCase()
  
  if (!isOwner) return null

  const totalSlotsNum = Number(totalSlots ?? 0)
  const registered = Number(registrantCount ?? 0)
  const winners = Number(winnerCount ?? 0)
  const active = isActive ?? false
  const deadlineNum = Number(deadline ?? 0)
  const deadlineDate = deadlineNum > 0 ? new Date(deadlineNum * 1000) : null
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false

  const registrantAddresses = registrants as `0x${string}`[] | undefined

  const exportCSV = () => {
    if (!registrantAddresses || registrantAddresses.length === 0) return
    const csv = ['address,slot_number', ...registrantAddresses.map((addr, i) => `${addr},${i + 1}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(name as string)?.replace(/\s+/g, '_') || 'campaign'}_registrants.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-text text-sm truncate">
              {(name as string) || 'Untitled Campaign'}
            </h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
              !active ? 'bg-surface-2 text-text-secondary' : 'bg-success/10 text-success'
            }`}>
              {!active ? 'Ended' : 'Live'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {registered}/{totalSlotsNum}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {winners} winners
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {!deadlineDate ? 'No deadline' : isPastDeadline ? 'Ended' : formatDistanceToNow(deadlineDate, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link
            to={`/campaign/${address}`}
            onClick={e => e.stopPropagation()}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          {registrantAddresses && registrantAddresses.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); exportCSV() }}
              className="p-1.5 text-text-secondary hover:text-primary transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-text mb-2">
              Description: {(description as string) || 'No description'}
            </p>
          </div>
          
          {registrantAddresses && registrantAddresses.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-text mb-2">Registrants ({registrantAddresses.length})</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {registrantAddresses.map((addr, i) => (
                  <div key={addr} className="flex items-center justify-between px-3 py-1.5 bg-surface-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{i + 1}.</span>
                      <span className="font-mono text-xs text-text">{shortAddr(addr)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary text-center py-2">No registrants yet</p>
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-secondary mb-2">Contract Address</p>
            <code className="text-xs bg-surface-2 rounded-lg p-2 block overflow-x-auto text-text-secondary font-mono">
              {address}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { address } = useAccount()

  const { data: creatorCampaigns, isLoading, error, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getCreatorCampaigns',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const campaigns = (creatorCampaigns as `0x${string}`[] | undefined) ?? []

  if (!address) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          {/* ✅ Pakai gambar dari folder public */}
          <img src="/duck-icon.svg" alt="Duck" className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your campaigns</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-1">Dashboard</h1>
            <p className="text-text-secondary text-sm">Manage your whitelist campaigns</p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> New Campaign
          </Link>
        </div>

        <NetworkGuard>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-error/10 rounded-xl">
              <p className="text-error text-sm">Error loading campaigns: {error.message}</p>
              <button 
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-primary rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl">
              {/* ✅ Pakai gambar dari folder public */}
              <img src="/duck-icon.svg" alt="Duck" className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-text mb-1">No campaigns yet</p>
              <p className="text-sm text-text-secondary mb-5">Create your first whitelist campaign</p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Create Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(addr => (
                <CampaignRow key={addr} address={addr} userAddress={address!} />
              ))}
            </div>
          )}
        </NetworkGuard>
      </div>
    </div>
  )
}