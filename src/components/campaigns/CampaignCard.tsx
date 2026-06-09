// src/components/campaigns/CampaignCard.tsx
import { Link } from 'react-router-dom'
import { useReadContract } from 'wagmi'
import { CAMPAIGN_ABI } from '../../config/contracts'  // ✅ Ganti import ke config
import { Calendar, Users, Star, Zap, Trophy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ipfsToUrl } from '../../utils/ipfs'  // ✅ Import IPFS helper

interface Props {
  address: string
}

interface CampaignInfo {
  name: string
  description: string
  bannerImage: string
  twitter: string
  discord: string
  website: string
  totalSlots: bigint
  deadline: bigint
  selectionMode: number
  minTransactions: bigint
  minWalletAgeDays: bigint
  requiredToken: string
  tokenType: number
  minTokenBalance: bigint
  tokenId: bigint
  isPro: boolean
  isFeatured: boolean
}

function StatusPill({ info, registrantsCount }: { info: CampaignInfo; registrantsCount: number }) {
  const now = Math.floor(Date.now() / 1000)
  const deadline = info.deadline ? Number(info.deadline) : 0
  const isActive = now <= deadline && deadline > 0
  const totalSlots = Number(info.totalSlots)
  const isFull = info.selectionMode === 0 && registrantsCount >= totalSlots

  if (isFull) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30 text-warning">
        Full
      </span>
    )
  }
  if (isActive) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 border border-success/30 text-success flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Live
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary">
      Ended
    </span>
  )
}

export default function CampaignCard({ address }: Props) {
  // Get campaign info via getParams
  const { data: rawInfo, isLoading: infoLoading } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'getParams',
  })

  // Get registrants count
  const { data: registrantsCount, isLoading: countLoading } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'registrantCount',
  })

  if (infoLoading || countLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse shadow-sm">
        <div className="h-28 bg-surface-2" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-surface-2 rounded w-2/3" />
          <div className="h-3 bg-surface-2 rounded w-full" />
          <div className="h-3 bg-surface-2 rounded w-4/5" />
        </div>
      </div>
    )
  }

  if (!rawInfo) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs text-text-secondary">Campaign data not available</p>
      </div>
    )
  }

  // Parse getParams result (tuple ke object)
  const paramsArray = rawInfo as unknown as [
    string, string, string, string, string, string,
    bigint, bigint, number, bigint, bigint,
    string, number, bigint, bigint,
    boolean, boolean
  ]

  const info: CampaignInfo = {
    name: paramsArray[0] || 'Untitled',
    description: paramsArray[1] || '',
    bannerImage: paramsArray[2] || '',
    twitter: paramsArray[3] || '',
    discord: paramsArray[4] || '',
    website: paramsArray[5] || '',
    totalSlots: paramsArray[6] || 0n,
    deadline: paramsArray[7] || 0n,
    selectionMode: paramsArray[8] || 0,
    minTransactions: paramsArray[9] || 0n,
    minWalletAgeDays: paramsArray[10] || 0n,
    requiredToken: paramsArray[11] || '',
    tokenType: paramsArray[12] || 0,
    minTokenBalance: paramsArray[13] || 0n,
    tokenId: paramsArray[14] || 0n,
    isPro: paramsArray[15] || false,
    isFeatured: paramsArray[16] || false,
  }

  const totalSlots = Number(info.totalSlots)
  const registered = Number(registrantsCount ?? 0)
  const fillPct = totalSlots > 0 ? Math.min(100, (registered / totalSlots) * 100) : 0
  
  // Validasi deadline
  const deadlineTimestamp = Number(info.deadline)
  const deadlineDate = deadlineTimestamp > 0 ? new Date(deadlineTimestamp * 1000) : null
  const isValidDeadline = deadlineDate && !isNaN(deadlineDate.getTime())
  
  const isRaffle = info.selectionMode === 1

  // Konversi IPFS ke URL
  const bannerImageUrl = ipfsToUrl(info.bannerImage)

  return (
    <Link
      to={`/campaign/${address}`}
      className="group block bg-surface border border-border hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Banner */}
      <div className="h-28 relative overflow-hidden bg-gradient-to-br from-primary/20 to-yellow-200/20">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt={info.name}
            className="w-full h-full object-cover"
            onError={(e) => { 
              (e.target as HTMLImageElement).style.display = 'none'
              // Tampilkan fallback gradient jika gambar gagal
              const parent = (e.target as HTMLImageElement).parentElement
              if (parent) {
                parent.style.background = 'linear-gradient(to bottom right, #6366f1, #fef08a)'
                parent.style.opacity = '0.3'
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-yellow-200/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          {info.isFeatured && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center gap-1">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          <StatusPill info={info} registrantsCount={registered} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {info.name}
          </h3>
          <span className="shrink-0 flex items-center gap-1 text-xs text-text-secondary">
            {isRaffle ? <Trophy className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {isRaffle ? 'Raffle' : 'FCFS'}
          </span>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 mb-3">{info.description || 'No description'}</p>

        {/* Slots bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {registered} / {totalSlots} registered
            </span>
            <span>{fillPct.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Deadline - dengan validasi */}
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Calendar className="w-3 h-3" />
          {isValidDeadline && deadlineDate ? (
            deadlineDate < new Date()
              ? 'Ended'
              : `Ends ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`
          ) : (
            'No deadline'
          )}
        </div>
      </div>
    </Link>
  )
}