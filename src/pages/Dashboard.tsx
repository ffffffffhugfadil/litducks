// src/pages/Dashboard.tsx - FIXED (tidak reload terus)

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FACTORY_ADDRESS, FACTORY_ABI } from '../config/contracts'  
import { CAMPAIGN_ABI } from '../config/contracts'  
import { Download, Trophy, Users, Calendar, ExternalLink, Loader2, PlusCircle, ChevronLeft, ChevronRight, CheckCircle, Filter, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import NetworkGuard from '../components/wallet/NetworkGuard'
import { EXPLORER_URL } from '../lib/chain'
import { usePublicClient } from 'wagmi'

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// SVG Icon untuk Raffle
function RaffleIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  )
}

// SVG Icon untuk FCFS
function FCFSIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
    </svg>
  )
}

// Interface untuk campaign summary
interface CampaignSummary {
  address: string
  isActive: boolean
  isRaffleMode: boolean
  isCompleted: boolean
}

// Cache untuk campaign data (persistent)
let globalCache = new Map<string, {
  isActive: boolean
  isRaffleMode: boolean
  isCompleted: boolean
  timestamp: number
}>()

let isFetchingInProgress = false
let fetchPromise: Promise<void> | null = null

const CACHE_EXPIRY = 5 * 60 * 1000 // 5 menit

function CampaignRow({ address, userAddress }: { address: string; userAddress: string }) {
  const [expanded, setExpanded] = useState(false)
  const [winnersList, setWinnersList] = useState<string[]>([])

  // ============ READ CONTRACTS ============
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

  const { data: selectionMode } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'selectionMode',
  })

  const { data: raffleRun } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'raffleRun',
  })

  const { data: registrants } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'getRegistrants',
    query: { enabled: expanded },
  })

  const { data: winnersData } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'getWinners',
    query: { enabled: expanded },
  })

  // ============ WRITE CONTRACT ============
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  // ============ DATA PROCESSING ============
  useEffect(() => {
    if (winnersData && Array.isArray(winnersData)) {
      setWinnersList(winnersData as string[])
    }
  }, [winnersData])

  const isOwner = creator && userAddress && creator.toLowerCase() === userAddress.toLowerCase()
  const isRaffleMode = selectionMode === 1
  const isRaffleCompleted = raffleRun === true
  const deadlineNum = Number(deadline ?? 0)
  const deadlineDate = deadlineNum > 0 ? new Date(deadlineNum * 1000) : null
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false
  
  const totalSlotsNum = Number(totalSlots ?? 0)
  const registered = Number(registrantCount ?? 0)
  const winners = Number(winnerCount ?? 0)
  const active = isActive ?? false
  const registrantAddresses = registrants as `0x${string}`[] | undefined

  // Untuk FCFS: cek apakah campaign sudah selesai (full atau lewat deadline)
  const isFCFSCompleted = !isRaffleMode && (!active || registered >= totalSlotsNum || isPastDeadline)
  const hasRegistrants = registrantAddresses && registrantAddresses.length > 0
  
  // Untuk FCFS: winners adalah semua registrants (karena FCFS auto-win)
  const fcfsWinnersList = isFCFSCompleted && registrantAddresses ? registrantAddresses : []
  
  // Tampilkan winners list (Raffle winners atau FCFS registrants)
  const displayWinners = isRaffleMode ? winnersList : fcfsWinnersList

  const handleRunRaffle = () => {
    const emptyMerkle = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`
    writeContract({ 
      address: address as `0x${string}`, 
      abi: CAMPAIGN_ABI, 
      functionName: 'runRaffle',
      args: [emptyMerkle]
    })
  }

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

  const exportWinnersCSV = () => {
    if (!displayWinners || displayWinners.length === 0) return
    const csv = ['address,winner_number', ...displayWinners.map((addr, i) => `${addr},${i + 1}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(name as string)?.replace(/\s+/g, '_') || 'campaign'}_winners.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOwner) return null

  return (
    <div 
      className="bg-surface border border-border rounded-xl overflow-hidden"
      data-status={active && !isPastDeadline ? 'live' : 'ended'}
      data-type={isRaffleMode ? 'raffle' : 'fcfs'}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isRaffleMode ? (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <RaffleIcon className="w-3 h-3" /> Raffle
              </span>
            ) : (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <FCFSIcon className="w-3 h-3" /> FCFS
              </span>
            )}
            <h3 className="font-medium text-text text-sm truncate">
              {(name as string) || 'Untitled Campaign'}
            </h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
              !active ? 'bg-surface-2 text-text-secondary' : 'bg-success/10 text-success'
            }`}>
              {!active ? 'Ended' : 'Live'}
            </span>
            {!isRaffleMode && isFCFSCompleted && (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            )}
            {isRaffleMode && isRaffleCompleted && (
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Raffle Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {registered}/{totalSlotsNum}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {isRaffleMode ? winners : (isFCFSCompleted ? registered : 0)} winners
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
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-text mb-2">
              Description: {(description as string) || 'No description'}
            </p>
          </div>
          
          {/* Run Raffle Button */}
          {isRaffleMode && !isRaffleCompleted && isActive && isOwner && (
            <div className="mb-3">
              {!isPastDeadline ? (
                <div className="p-2 bg-warning/10 border border-warning/20 rounded-lg text-center">
                  <p className="text-xs text-warning">Raffle available after deadline ({deadlineDate?.toLocaleDateString()})</p>
                </div>
              ) : !hasRegistrants ? (
                <div className="p-2 bg-warning/10 border border-warning/20 rounded-lg text-center">
                  <p className="text-xs text-warning">No registrants to run raffle</p>
                </div>
              ) : (
                <button
                  onClick={handleRunRaffle}
                  disabled={isPending || isConfirming || !hasRegistrants}
                  className="w-full py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending || isConfirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Running Raffle...</>
                  ) : (
                    <>🎲 Run Raffle</>
                  )}
                </button>
              )}
              {writeError && (
                <p className="text-xs text-error mt-1">{writeError.message.slice(0, 100)}</p>
              )}
              {isConfirmed && (
                <p className="text-xs text-success mt-1">✅ Raffle completed! Winners selected.</p>
              )}
            </div>
          )}

          {/* FCFS Completion Info */}
          {!isRaffleMode && isFCFSCompleted && (
            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-xs text-green-400">
                ✅ Campaign completed! {registered} registrants are winners.
                {registered >= totalSlotsNum 
                  ? ` All ${totalSlotsNum} slots filled.` 
                  : ` Deadline has passed.`}
              </p>
            </div>
          )}

          {/* Status Info untuk FCFS yang masih aktif */}
          {!isRaffleMode && !isFCFSCompleted && (
            <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <p className="text-xs text-blue-400">
                🎯 FCFS Mode - First come first served
                {registered < totalSlotsNum 
                  ? ` ${totalSlotsNum - registered} slots remaining` 
                  : ` All slots filled - campaign complete`}
              </p>
            </div>
          )}
          
          {/* Tombol Export */}
          <div className="flex gap-2 flex-wrap">
            {registrantAddresses && registrantAddresses.length > 0 && (
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Export Registrants ({registrantAddresses.length})
              </button>
            )}
            
            {displayWinners.length > 0 && (
              <button
                onClick={exportWinnersCSV}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  isRaffleMode 
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                    : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                }`}
              >
                <Download className="w-3 h-3" /> Export Winners ({displayWinners.length})
              </button>
            )}
          </div>

          {/* Daftar Registrants */}
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
                    {!isRaffleMode && isFCFSCompleted && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Winner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary text-center py-2">No registrants yet</p>
          )}

          {/* Daftar Winners */}
          {displayWinners.length > 0 && !(isRaffleMode && !isRaffleCompleted) && (
            <div>
              <p className="text-xs font-medium text-text mb-2 flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-400" />
                Winners ({displayWinners.length})
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {displayWinners.map((addr, i) => (
                  <div key={addr} className="flex items-center justify-between px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{i + 1}.</span>
                      <span className="font-mono text-xs text-text">{shortAddr(addr)}</span>
                    </div>
                    <Trophy className="w-3 h-3 text-green-400" />
                  </div>
                ))}
              </div>
            </div>
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
  const publicClient = usePublicClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'live' | 'ended' | 'raffle' | 'fcfs'>('all')
  const [campaignsStatus, setCampaignsStatus] = useState<Map<string, CampaignSummary>>(new Map())
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const itemsPerPage = 6

  const { data: creatorCampaigns, isLoading, error, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getCreatorCampaigns',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const campaigns = (creatorCampaigns as string[]) ?? []

  // Fetch status untuk semua campaign (hanya sekali, pakai cache global)
  const fetchAllCampaignsStatus = useCallback(async () => {
    if (!publicClient || campaigns.length === 0) return
    if (isFetchingInProgress) return
    
    setIsLoadingStatus(true)
    
    try {
      isFetchingInProgress = true
      
      // Filter campaign yang perlu di-fetch (belum ada cache atau expired)
      const now = Date.now()
      const campaignsToFetch = campaigns.filter(addr => {
        const cached = globalCache.get(addr)
        return !cached || (now - cached.timestamp) >= CACHE_EXPIRY
      })
      
      // Jika semua sudah di cache, langsung pakai cache
      if (campaignsToFetch.length === 0) {
        const statusMap = new Map<string, CampaignSummary>()
        for (const addr of campaigns) {
          const cached = globalCache.get(addr)
          if (cached) {
            statusMap.set(addr, {
              address: addr,
              isActive: cached.isActive,
              isRaffleMode: cached.isRaffleMode,
              isCompleted: cached.isCompleted,
            })
          }
        }
        setCampaignsStatus(statusMap)
        setIsLoadingStatus(false)
        setHasLoadedOnce(true)
        return
      }
      
      // Fetch hanya campaign yang perlu
      for (const campaignAddr of campaignsToFetch) {
        try {
          const contract = { address: campaignAddr as `0x${string}`, abi: CAMPAIGN_ABI }
          
          const [isActive, selectionMode, deadline, totalSlots, registrantCount] = await Promise.all([
            publicClient.readContract({ ...contract, functionName: 'isActive' }),
            publicClient.readContract({ ...contract, functionName: 'selectionMode' }),
            publicClient.readContract({ ...contract, functionName: 'deadline' }),
            publicClient.readContract({ ...contract, functionName: 'totalSlots' }),
            publicClient.readContract({ ...contract, functionName: 'registrantCount' }),
          ])
          
          const isRaffleMode = selectionMode === 1
          const deadlineNum = Number(deadline ?? 0)
          const isPastDeadline = deadlineNum > 0 && deadlineNum * 1000 < Date.now()
          const totalSlotsNum = Number(totalSlots ?? 0)
          const registrantCountNum = Number(registrantCount ?? 0)
          const isFull = registrantCountNum >= totalSlotsNum
          
          let isCompleted = false
          if (isRaffleMode) {
            const raffleRun = await publicClient.readContract({ ...contract, functionName: 'raffleRun' })
            isCompleted = raffleRun === true
          } else {
            isCompleted = !isActive || isPastDeadline || isFull
          }
          
          // Simpan ke global cache
          globalCache.set(campaignAddr, {
            isActive: isActive as boolean,
            isRaffleMode,
            isCompleted,
            timestamp: now,
          })
          
        } catch (err) {
          console.error(`Error fetching status for ${campaignAddr}:`, err)
        }
      }
      
      // Build status map dari semua cache
      const statusMap = new Map<string, CampaignSummary>()
      for (const addr of campaigns) {
        const cached = globalCache.get(addr)
        if (cached) {
          statusMap.set(addr, {
            address: addr,
            isActive: cached.isActive,
            isRaffleMode: cached.isRaffleMode,
            isCompleted: cached.isCompleted,
          })
        }
      }
      
      setCampaignsStatus(statusMap)
      setHasLoadedOnce(true)
      
    } catch (err) {
      console.error('Error fetching campaigns status:', err)
    } finally {
      setIsLoadingStatus(false)
      isFetchingInProgress = false
      fetchPromise = null
    }
  }, [publicClient, campaigns])

  // Load status hanya sekali saat campaigns berubah
  useEffect(() => {
    if (campaigns.length > 0 && !hasLoadedOnce) {
      fetchAllCampaignsStatus()
    }
  }, [campaigns, fetchAllCampaignsStatus, hasLoadedOnce])

  // Filter campaigns berdasarkan status (tanpa loading ulang)
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns]
    
    // Jika belum loading status, tampilkan semua dulu
    if (campaignsStatus.size === 0 && campaigns.length > 0 && isLoadingStatus) {
      return []
    }
    
    switch (filter) {
      case 'live':
        filtered = campaigns.filter(addr => {
          const status = campaignsStatus.get(addr)
          return status && status.isActive && !status.isCompleted
        })
        break
      case 'ended':
        filtered = campaigns.filter(addr => {
          const status = campaignsStatus.get(addr)
          return status && (!status.isActive || status.isCompleted)
        })
        break
      case 'raffle':
        filtered = campaigns.filter(addr => {
          const status = campaignsStatus.get(addr)
          return status && status.isRaffleMode
        })
        break
      case 'fcfs':
        filtered = campaigns.filter(addr => {
          const status = campaignsStatus.get(addr)
          return status && !status.isRaffleMode
        })
        break
      default:
        filtered = campaigns
    }
    
    return [...filtered].reverse()
  }, [campaigns, campaignsStatus, filter, isLoadingStatus])

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredCampaigns.slice(start, end)
  }, [filteredCampaigns, currentPage])

  // Reset page saat filter berubah
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  // Hitung count untuk setiap filter (pakai data yang sudah ada)
  const filterCounts = useMemo(() => {
    const counts = {
      all: campaigns.length,
      live: 0,
      ended: 0,
      raffle: 0,
      fcfs: 0,
    }
    
    campaigns.forEach(addr => {
      const status = campaignsStatus.get(addr)
      if (status) {
        if (status.isActive && !status.isCompleted) counts.live++
        else counts.ended++
        
        if (status.isRaffleMode) counts.raffle++
        else counts.fcfs++
      }
    })
    
    return counts
  }, [campaigns, campaignsStatus])

  const filterButtons = [
    { key: 'all', label: 'All', icon: null, count: filterCounts.all },
    { key: 'live', label: 'Live', icon: <CheckCircle className="w-3 h-3" />, count: filterCounts.live },
    { key: 'ended', label: 'Ended', icon: <Clock className="w-3 h-3" />, count: filterCounts.ended },
    { key: 'raffle', label: 'Raffle', icon: <RaffleIcon className="w-3 h-3" />, count: filterCounts.raffle },
    { key: 'fcfs', label: 'FCFS', icon: <FCFSIcon className="w-3 h-3" />, count: filterCounts.fcfs },
  ]

  if (!address) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <img src="/duck-icon.svg" alt="Duck" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your campaigns</p>
        </div>
      </div>
    )
  }

  // Loading state hanya pertama kali
  if (isLoading || (campaigns.length > 0 && campaignsStatus.size === 0 && isLoadingStatus && !hasLoadedOnce)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text">Filter Campaigns</h2>
            <span className="text-xs text-text-secondary bg-surface-2 px-2 py-0.5 rounded-full">
              {filterCounts.all} total
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleFilterChange(btn.key as typeof filter)}
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

        <NetworkGuard>
          {error ? (
            <div className="text-center py-12 bg-error/10 rounded-xl">
              <p className="text-error text-sm">Error loading campaigns: {error.message}</p>
              <button 
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-primary rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : paginatedCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl">
              <img src="/duck-icon.svg" alt="Duck" className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-text mb-1">
                {filter === 'all' 
                  ? 'No campaigns yet' 
                  : filter === 'live'
                    ? 'No live campaigns'
                    : filter === 'ended'
                      ? 'No ended campaigns'
                      : filter === 'raffle'
                        ? 'No raffle campaigns'
                        : 'No FCFS campaigns'}
              </p>
              <p className="text-sm text-text-secondary mb-5">
                {filter === 'all' 
                  ? 'Create your first whitelist campaign' 
                  : 'Try another filter or create a new campaign'}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Create Campaign
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedCampaigns.map((addr) => (
                  <CampaignRow key={addr} address={addr} userAddress={address} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'border-border text-text-secondary cursor-not-allowed opacity-50'
                        : 'border-border hover:border-primary text-text hover:text-primary'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-text hover:bg-surface-2'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'border-border text-text-secondary cursor-not-allowed opacity-50'
                        : 'border-border hover:border-primary text-text hover:text-primary'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </NetworkGuard>
      </div>
    </div>
  )
}
