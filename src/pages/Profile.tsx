// src/pages/Profile.tsx - WITH OPTIMIZED CACHING (NO REFRESH BUTTON)

import { useParams } from 'react-router-dom'
import { useAccount, usePublicClient } from 'wagmi'
import { useReadContract } from 'wagmi'
import { isAddress } from 'viem'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '../config/contracts'
import { 
  Trophy, CheckCircle, ExternalLink, Loader2, User, Calendar, Clock, Filter,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Link } from 'react-router-dom'
import { EXPLORER_URL } from '../lib/chain'

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// SVG Icons
const FCFSIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
  </svg>
)

const RaffleIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="12" r="2" />
    <line x1="12" y1="6" x2="12" y2="18" />
  </svg>
)

<<<<<<< HEAD
  const campaignName = (name as string) || 'Untitled Campaign'
  const createdAtNum = Number(createdAt ?? 0)
  const createdAtDate = createdAtNum > 0 ? new Date(createdAtNum * 1000) : new Date()
=======
interface CampaignHistoryData {
  address: string
  name: string
  isRegistered: boolean
  isWinner: boolean
  registeredAt: number
  isRaffle: boolean
  isFCFS: boolean
  isCampaignEnded: boolean
  registrationTimeText: string
  fullDateText: string
  statusText: string
  statusColor: string
}

// Simple cache object
const dataCache = new Map<string, {
  data: CampaignHistoryData[]
  timestamp: number
  expiryTime: number
}>()

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000

function ProcessedCampaignItem({ data }: { data: CampaignHistoryData }) {
  const statusIcon = data.isWinner 
    ? <Trophy className="w-3 h-3" />
    : data.isCampaignEnded && !data.isWinner 
      ? <Clock className="w-3 h-3" />
      : <CheckCircle className="w-3 h-3" />
>>>>>>> 8ff0023d (optimize: add caching, filters, and analytics page)

  return (
    <Link
      to={`/campaign/${data.address}`}
      className="block p-4 bg-surface border border-border hover:border-primary/50 rounded-xl transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="font-semibold text-text group-hover:text-primary transition-colors truncate">
              {data.name || "Untitled Campaign"}
            </p>
            {data.isWinner && (
              <span className="shrink-0 text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                <Trophy className="w-3 h-3" /> Winner
              </span>
            )}
            {data.isRaffle && !data.isCampaignEnded && (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <RaffleIcon className="w-3 h-3" /> Raffle
              </span>
            )}
            {data.isFCFS && (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <FCFSIcon className="w-3 h-3" /> FCFS
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Registered {data.registrationTimeText}
              {data.fullDateText && (
                <span className="text-text-secondary ml-1 opacity-60">
                  ({data.fullDateText})
                </span>
              )}
            </span>
            <span className={`flex items-center gap-1 ${data.statusColor}`}>
              {statusIcon}
              {data.statusText}
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
<<<<<<< HEAD
  const { address: connectedAddress, isConnected } = useAccount()
=======
  const { address: connectedAddress } = useAccount()
  const publicClient = usePublicClient()
  
  const [filter, setFilter] = useState<'all' | 'fcfs' | 'raffle' | 'winner' | 'registered'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [campaignsData, setCampaignsData] = useState<CampaignHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const itemsPerPage = 5
  const hasFetchedRef = useRef(false)
>>>>>>> 8ff0023d (optimize: add caching, filters, and analytics page)

  const profileAddress = paramAddress ?? connectedAddress
  const isOwnProfile = profileAddress?.toLowerCase() === connectedAddress?.toLowerCase()

  // Ambil semua campaign dari factory
  const { data: allCampaigns, isLoading: loadingCampaigns } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getAllCampaigns',
    query: { enabled: !!FACTORY_ADDRESS },
  })

<<<<<<< HEAD
  // ✅ Tampilkan pesan jika wallet belum terhubung
  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/duck-icon.svg" alt="Duck" className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your whitelist history</p>
        </div>
      </div>
    )
  }

=======
  const campaignsList = (allCampaigns as string[]) ?? []

  // Fetch data untuk semua campaign dengan caching
  const fetchAllCampaignsData = useCallback(async (forceRefresh = false) => {
    if (!publicClient || !profileAddress || campaignsList.length === 0) return
    
    // Check cache
    const cacheKey = `profile_${profileAddress}_campaigns_${campaignsList.length}`
    const cachedData = dataCache.get(cacheKey)
    const now = Date.now()
    
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('Using cached data')
      setCampaignsData(cachedData.data)
      setIsLoading(false)
      setIsInitialLoad(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const results: CampaignHistoryData[] = []
      
      // Process campaigns in batches to avoid overwhelming the RPC
      const BATCH_SIZE = 10
      for (let i = 0; i < campaignsList.length; i += BATCH_SIZE) {
        const batch = campaignsList.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (campaignAddr) => {
          try {
            const contract = { address: campaignAddr as `0x${string}`, abi: CAMPAIGN_ABI }
            
            // Cek apakah user terdaftar
            const isRegistered = await publicClient.readContract({
              ...contract,
              functionName: 'isRegistered',
              args: [profileAddress as `0x${string}`],
            }) as boolean
            
            if (!isRegistered) return null
            
            // Ambil data campaign
            const [name, totalSlots, registrantCount, isActive, deadline, selectionMode, raffleRun, registeredAtData, isWinnerFromContract] = await Promise.all([
              publicClient.readContract({ ...contract, functionName: 'name' }),
              publicClient.readContract({ ...contract, functionName: 'totalSlots' }),
              publicClient.readContract({ ...contract, functionName: 'registrantCount' }),
              publicClient.readContract({ ...contract, functionName: 'isActive' }),
              publicClient.readContract({ ...contract, functionName: 'deadline' }),
              publicClient.readContract({ ...contract, functionName: 'selectionMode' }),
              publicClient.readContract({ ...contract, functionName: 'raffleRun' }),
              publicClient.readContract({ ...contract, functionName: 'registeredAt', args: [profileAddress as `0x${string}`] }),
              publicClient.readContract({ ...contract, functionName: 'isWinner', args: [profileAddress as `0x${string}`] }),
            ])
            
            const isRaffle = selectionMode === 1
            const isFCFS = selectionMode === 0
            const totalSlotsNum = Number(totalSlots ?? 0)
            const registrantCountNum = Number(registrantCount ?? 0)
            const deadlineNum = Number(deadline ?? 0)
            const isPastDeadline = deadlineNum > 0 && deadlineNum * 1000 < Date.now()
            const isFull = registrantCountNum >= totalSlotsNum
            const isCampaignEnded = !isActive || isPastDeadline || isFull
            
            // Hitung winner
            let isWinner = false
            if (isRaffle) {
              isWinner = isWinnerFromContract === true
            } else if (isFCFS && isCampaignEnded) {
              isWinner = true
            }
            
            // Format waktu registrasi
            const registeredAtNum = Number(registeredAtData ?? 0)
            const registeredDate = registeredAtNum > 0 ? new Date(registeredAtNum * 1000) : null
            
            let registrationTimeText = "Unknown"
            let fullDateText = ""
            
            if (registeredDate) {
              registrationTimeText = formatDistanceToNow(registeredDate, { addSuffix: true })
              fullDateText = format(registeredDate, "dd MMM yyyy, HH:mm:ss")
            }
            
            // Status text
            let statusText = "Registered"
            let statusColor = "text-blue-400"
            
            if (isWinner) {
              statusText = "Winner"
              statusColor = "text-yellow-400"
            } else if (isCampaignEnded && !isWinner) {
              statusText = "Not Winner"
              statusColor = "text-red-400"
            }
            
            return {
              address: campaignAddr,
              name: (name as string) || 'Untitled',
              isRegistered,
              isWinner,
              registeredAt: registeredAtNum,
              isRaffle,
              isFCFS,
              isCampaignEnded,
              registrationTimeText,
              fullDateText,
              statusText,
              statusColor,
            }
          } catch (err) {
            console.error(`Error fetching ${campaignAddr}:`, err)
            return null
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        const validResults = batchResults.filter((r): r is CampaignHistoryData => r !== null)
        results.push(...validResults)
        
        // Optional: Update UI progressively
        if (i + BATCH_SIZE < campaignsList.length) {
          setCampaignsData([...results].sort((a, b) => b.registeredAt - a.registeredAt))
        }
      }
      
      // Urutkan dari yang terbaru (registeredAt descending)
      results.sort((a, b) => b.registeredAt - a.registeredAt)
      
      // Store in cache
      dataCache.set(cacheKey, {
        data: results,
        timestamp: now,
        expiryTime: CACHE_EXPIRY
      })
      
      setCampaignsData(results)
      
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [publicClient, profileAddress, campaignsList])

  useEffect(() => {
    if (campaignsList.length > 0 && profileAddress && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchAllCampaignsData()
    }
  }, [campaignsList, profileAddress, fetchAllCampaignsData])

  // Filter data
  const filteredData = useMemo(() => {
    switch (filter) {
      case 'fcfs':
        return campaignsData.filter(c => c.isFCFS)
      case 'raffle':
        return campaignsData.filter(c => c.isRaffle)
      case 'winner':
        return campaignsData.filter(c => c.isWinner)
      case 'registered':
        return campaignsData.filter(c => c.statusText === 'Registered')
      default:
        return campaignsData
    }
  }, [campaignsData, filter])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

>>>>>>> 8ff0023d (optimize: add caching, filters, and analytics page)
  if (!profileAddress || !isAddress(profileAddress)) {
    return (
      <div className="min-h-screen pt-24 text-center text-text-secondary">
        Invalid address
      </div>
    )
  }

  // Filter buttons
  const filterButtons = [
    { key: 'all', label: 'All', icon: null, count: campaignsData.length },
    { key: 'fcfs', label: 'FCFS', icon: <FCFSIcon className="w-3 h-3" />, count: campaignsData.filter(c => c.isFCFS).length },
    { key: 'raffle', label: 'Raffle', icon: <RaffleIcon className="w-3 h-3" />, count: campaignsData.filter(c => c.isRaffle).length },
    { key: 'winner', label: 'Winner', icon: <Trophy className="w-3 h-3" />, count: campaignsData.filter(c => c.isWinner).length },
    { key: 'registered', label: 'Registered', icon: <CheckCircle className="w-3 h-3" />, count: campaignsData.filter(c => c.statusText === 'Registered').length },
  ]

  const isLoadingState = (loadingCampaigns || isLoading) && isInitialLoad

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

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text">Whitelist History</h2>
            <span className="text-xs text-text-secondary bg-surface-2 px-2 py-0.5 rounded-full">
              {campaignsData.length} total
            </span>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => {
                  setFilter(btn.key as typeof filter)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                  filter === btn.key
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface border border-border'
                }`}
              >
                {btn.icon}
                {btn.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === btn.key
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-text-secondary'
                }`}>
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Campaign List */}
        {isLoadingState ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-error/10 rounded-xl">
            <p className="text-error text-sm">{error}</p>
            <button 
              onClick={() => fetchAllCampaignsData(true)}
              className="mt-3 px-4 py-2 bg-primary rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-secondary text-sm">
              {filter === 'all' 
                ? 'No whitelist registrations yet.' 
                : filter === 'winner'
                  ? 'No winning campaigns yet.'
                  : filter === 'registered'
                    ? 'No active registered campaigns.'
                    : `No ${filter} campaigns found.`}
            </p>
            <Link to="/explore" className="text-xs text-primary hover:underline mt-2 inline-block">
              Explore campaigns →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedData.map((data) => (
              <ProcessedCampaignItem key={data.address} data={data} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoadingState && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
