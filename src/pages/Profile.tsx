// src/pages/Profile.tsx
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { isAddress } from 'viem'
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '../config/contracts'
import { Trophy, CheckCircle, ExternalLink, Loader2, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { EXPLORER_URL } from '../lib/chain'

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function CampaignHistoryItem({ campaignAddr, wallet }: { campaignAddr: string; wallet: string }) {
  // Ambil nama campaign
  const { data: name } = useReadContract({
    address: campaignAddr as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'name',
  })
  
  // Ambil createdAt
  const { data: createdAt } = useReadContract({
    address: campaignAddr as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'createdAt',
  })
  
  // Cek apakah wallet terdaftar
  const { data: isRegistered } = useReadContract({
    address: campaignAddr as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'isRegistered',
    args: [wallet as `0x${string}`],
  })
  
  // Cek apakah wallet jadi winner
  const { data: isWinner } = useReadContract({
    address: campaignAddr as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'isWinner',
    args: [wallet as `0x${string}`],
  })

  // Hanya tampilkan jika wallet terdaftar
  if (!isRegistered) return null

  const campaignName = (name as string) || "Untitled Campaign"
  const createdAtNum = Number(createdAt ?? 0)
  const createdAtDate = createdAtNum > 0 ? new Date(createdAtNum * 1000) : new Date()
  const deadlineDate = createdAtNum > 0 ? new Date(createdAtNum * 1000 + 7 * 24 * 60 * 60 * 1000) : new Date()

  return (
    <Link
      to={`/campaign/${campaignAddr}`}
      className="block p-4 bg-surface border border-border hover:border-primary/50 rounded-xl transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-text group-hover:text-primary transition-colors truncate">
              {campaignName}
            </p>
            {isWinner && (
              <span className="shrink-0 text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                <Trophy className="w-3 h-3" /> Winner
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Registered {formatDistanceToNow(createdAtDate, { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {isWinner ? 'Winner' : 'Registered'}
            </span>
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
      </div>
    </Link>
  )
}

export default function Profile() {
  const { address: paramAddress } = useParams<{ address: string }>()
  const { address: connectedAddress } = useAccount()

  const profileAddress = paramAddress ?? connectedAddress
  const isOwnProfile = profileAddress?.toLowerCase() === connectedAddress?.toLowerCase()

  // Ambil semua campaign dari factory
  const { data: allCampaigns, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getAllCampaigns',
    query: { enabled: !!FACTORY_ADDRESS },
  })

  if (!profileAddress || !isAddress(profileAddress)) {
    return (
      <div className="min-h-screen pt-24 text-center text-text-secondary">
        Invalid address
      </div>
    )
  }

  const campaigns = (allCampaigns as `0x${string}`[] | undefined) ?? []

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <User className="w-7 h-7 text-text-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-text text-lg font-mono">
                {shortAddr(profileAddress)}
              </h1>
              {isOwnProfile && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  You
                </span>
              )}
            </div>
            <a
              href={`${EXPLORER_URL}/address/${profileAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-secondary hover:text-primary flex items-center gap-1 mt-0.5 transition-colors"
            >
              View on explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-text mb-4">Whitelist History</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-secondary text-sm">No whitelist registrations yet.</p>
            <Link to="/explore" className="text-xs text-primary hover:underline mt-2 inline-block">
              Explore campaigns →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(addr => (
              <CampaignHistoryItem key={addr} campaignAddr={addr} wallet={profileAddress} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}