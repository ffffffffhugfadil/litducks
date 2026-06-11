// src/pages/Analytics.tsx - WITH SKELETON LOADING
import { useAccount } from 'wagmi'
import { useReadContract, usePublicClient } from 'wagmi'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '../config/contracts'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, Users, Trophy, Calendar, 
  ArrowUp, ArrowDown, Loader2,
  BarChart3, LineChart as LineChartIcon, PieChart,
  ChevronLeft, ChevronRight, CheckCircle, RefreshCw
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

interface CampaignStat {
  address: string
  name: string
  registrantCount: number
  winnerCount: number
  totalSlots: number
  createdAt: number
  deadline: number
  isActive: boolean
  isRaffle: boolean
}

interface CampaignWithActualWinners extends CampaignStat {
  actualWinnerCount: number
  isCompleted: boolean
  conversionRate: number
}

interface RegistrationEvent {
  campaignAddress: string
  registrantAddress: string
  registeredAt: number
  isWinner: boolean
}

// SVG Icons
const FCFSIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
  </svg>
)

const RaffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="12" r="2" />
    <line x1="12" y1="6" x2="12" y2="18" />
  </svg>
)

const LiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const CompletedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// Skeleton Components
const StatsCardSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-4 w-24 bg-gray-700 rounded"></div>
      <div className="h-4 w-4 bg-gray-700 rounded"></div>
    </div>
    <div className="h-8 w-16 bg-gray-700 rounded mt-2"></div>
    <div className="h-3 w-28 bg-gray-700 rounded mt-2"></div>
  </div>
)

const ChartSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-4 w-4 bg-gray-700 rounded"></div>
      <div className="h-5 w-40 bg-gray-700 rounded"></div>
    </div>
    <div className="h-[250px] bg-gray-700/50 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
    </div>
  </div>
)

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-700">
    <td className="py-3 px-4">
      <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
      <div className="h-3 w-24 bg-gray-700 rounded mt-1 animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-16 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-12 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-10 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-10 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-16 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-12 bg-gray-700 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 w-12 bg-gray-700 rounded animate-pulse"></div>
    </td>
  </tr>
)

// Cache keys
const CACHE_KEY_CAMPAIGNS = 'analytics_campaigns_data'
const CACHE_KEY_REGISTRATIONS = 'analytics_registrations_data'
const CACHE_KEY_TIMESTAMP = 'analytics_cache_timestamp'

type SortField = 'registrants' | 'winners' | 'conversion'
type SortOrder = 'desc' | 'asc'
type ModeFilter = 'all' | 'fcfs' | 'raffle'

export default function Analytics() {
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  
  // Load from localStorage on initial render
  const [campaigns, setCampaigns] = useState<CampaignStat[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY_CAMPAIGNS)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        return parsed
      } catch (e) {
        return []
      }
    }
    return []
  })
  
  const [registrations, setRegistrations] = useState<RegistrationEvent[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY_REGISTRATIONS)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        return parsed
      } catch (e) {
        return []
      }
    }
    return []
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [topCampaignsType, setTopCampaignsType] = useState<'registrants' | 'winners'>('registrants')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP)
    return timestamp ? new Date(parseInt(timestamp)) : null
  })
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('registrants')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all')
  
  const itemsPerPage = 10

  const { data: allCampaigns, refetch: refetchAllCampaigns, isLoading: loadingCampaigns } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getAllCampaigns',
    query: { enabled: !!FACTORY_ADDRESS },
  })

  const campaignsList = (allCampaigns as string[]) ?? []

  const isFCFSCompleted = useCallback((campaign: CampaignStat) => {
    if (campaign.isRaffle) return false
    const isFull = campaign.registrantCount >= campaign.totalSlots
    const isPastDeadline = campaign.deadline > 0 && Date.now() / 1000 > campaign.deadline
    return !campaign.isActive || isFull || isPastDeadline
  }, [])

  const getActualWinnerCount = useCallback((campaign: CampaignStat) => {
    if (campaign.isRaffle) {
      return campaign.winnerCount
    } else {
      if (isFCFSCompleted(campaign)) {
        return campaign.registrantCount
      }
      return 0
    }
  }, [isFCFSCompleted])

  const saveToCache = useCallback((campaignsData: CampaignStat[], registrationsData: RegistrationEvent[]) => {
    localStorage.setItem(CACHE_KEY_CAMPAIGNS, JSON.stringify(campaignsData))
    localStorage.setItem(CACHE_KEY_REGISTRATIONS, JSON.stringify(registrationsData))
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString())
    setLastUpdated(new Date())
  }, [])

  const fetchAllRegistrations = useCallback(async (campaignAddresses: string[]) => {
    if (!publicClient || campaignAddresses.length === 0) return []
    
    const allRegistrations: RegistrationEvent[] = []
    
    for (const campaignAddr of campaignAddresses) {
      try {
        const registrants = await publicClient.readContract({
          address: campaignAddr as `0x${string}`,
          abi: CAMPAIGN_ABI,
          functionName: 'getRegistrants',
        }) as string[]
        
        if (registrants && registrants.length > 0) {
          for (const registrant of registrants) {
            try {
              const registeredAt = await publicClient.readContract({
                address: campaignAddr as `0x${string}`,
                abi: CAMPAIGN_ABI,
                functionName: 'registeredAt',
                args: [registrant as `0x${string}`],
              }) as bigint
              
              const isWinner = await publicClient.readContract({
                address: campaignAddr as `0x${string}`,
                abi: CAMPAIGN_ABI,
                functionName: 'isWinner',
                args: [registrant as `0x${string}`],
              }) as boolean
              
              allRegistrations.push({
                campaignAddress: campaignAddr,
                registrantAddress: registrant,
                registeredAt: Number(registeredAt),
                isWinner,
              })
            } catch (err) {
              console.error(`Error fetching registration details:`, err)
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching registrants for ${campaignAddr}:`, err)
      }
    }
    
    return allRegistrations
  }, [publicClient])

  const fetchData = useCallback(async () => {
    if (!publicClient || campaignsList.length === 0) return
    
    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)
    
    try {
      const loadedCampaigns: CampaignStat[] = []
      const batchSize = 10
      const total = campaignsList.length
      
      for (let i = 0; i < total; i += batchSize) {
        const batch = campaignsList.slice(i, i + batchSize)
        
        const completed = Math.min(i + batchSize, total)
        setLoadingProgress(Math.floor((completed / total) * 50))
        
        const batchPromises = batch.map(async (address) => {
          try {
            const contract = { address: address as `0x${string}`, abi: CAMPAIGN_ABI }
            
            const [name, totalSlots, deadline, createdAt, registrantCount, winnerCount, isActive, selectionMode] = await Promise.all([
              publicClient.readContract({ ...contract, functionName: 'name' }),
              publicClient.readContract({ ...contract, functionName: 'totalSlots' }),
              publicClient.readContract({ ...contract, functionName: 'deadline' }),
              publicClient.readContract({ ...contract, functionName: 'createdAt' }),
              publicClient.readContract({ ...contract, functionName: 'registrantCount' }),
              publicClient.readContract({ ...contract, functionName: 'winnerCount' }),
              publicClient.readContract({ ...contract, functionName: 'isActive' }),
              publicClient.readContract({ ...contract, functionName: 'selectionMode' }),
            ])
            
            return {
              address,
              name: (name as string) || 'Untitled',
              totalSlots: Number(totalSlots ?? 0),
              deadline: Number(deadline ?? 0),
              createdAt: Number(createdAt ?? 0),
              registrantCount: Number(registrantCount ?? 0),
              winnerCount: Number(winnerCount ?? 0),
              isActive: isActive as boolean || false,
              isRaffle: (selectionMode as number) === 1,
            } as CampaignStat
          } catch (error) {
            console.error(`Error fetching ${address}:`, error)
            return null
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        loadedCampaigns.push(...batchResults.filter(c => c !== null))
      }
      
      setLoadingProgress(60)
      const registrationsData = await fetchAllRegistrations(campaignsList)
      setLoadingProgress(90)
      
      setCampaigns(loadedCampaigns)
      setRegistrations(registrationsData)
      saveToCache(loadedCampaigns, registrationsData)
      
      setLoadingProgress(100)
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, campaignsList, fetchAllRegistrations, saveToCache])

  useEffect(() => {
    if (campaignsList.length > 0 && campaigns.length === 0 && !isLoading) {
      fetchData()
    }
  }, [campaignsList, campaigns.length, isLoading, fetchData])

  const handleRefresh = async () => {
    await refetchAllCampaigns()
    await fetchData()
  }

  const processedCampaigns = useMemo((): CampaignWithActualWinners[] => {
    return campaigns.map(campaign => {
      const actualWinnerCount = getActualWinnerCount(campaign)
      const isCompleted = isFCFSCompleted(campaign)
      const conversionRate = campaign.registrantCount > 0 
        ? (actualWinnerCount / campaign.registrantCount) * 100 
        : 0
      
      return {
        ...campaign,
        actualWinnerCount,
        isCompleted,
        conversionRate,
      }
    })
  }, [campaigns, getActualWinnerCount, isFCFSCompleted])

  const filteredByMode = useMemo(() => {
    if (modeFilter === 'all') return processedCampaigns
    if (modeFilter === 'fcfs') return processedCampaigns.filter(c => !c.isRaffle)
    return processedCampaigns.filter(c => c.isRaffle)
  }, [processedCampaigns, modeFilter])

  const sortedAndFilteredCampaigns = useMemo(() => {
    const sorted = [...filteredByMode]
    
    sorted.sort((a, b) => {
      let aVal: number, bVal: number
      
      switch (sortField) {
        case 'registrants':
          aVal = a.registrantCount
          bVal = b.registrantCount
          break
        case 'winners':
          aVal = a.actualWinnerCount
          bVal = b.actualWinnerCount
          break
        case 'conversion':
          aVal = a.conversionRate
          bVal = b.conversionRate
          break
        default:
          aVal = a.registrantCount
          bVal = b.registrantCount
      }
      
      if (sortOrder === 'desc') {
        return bVal - aVal
      } else {
        return aVal - bVal
      }
    })
    
    return sorted
  }, [filteredByMode, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUp className="w-3 h-3 opacity-30" />
    }
    return sortOrder === 'desc' 
      ? <ArrowUp className="w-3 h-3 text-blue-500" />
      : <ArrowDown className="w-3 h-3 text-blue-500" />
  }

  const campaignsWithRegistrants = useMemo(() => {
    return processedCampaigns.filter(c => c.registrantCount > 0)
  }, [processedCampaigns])
  
  const campaignsWithWinners = useMemo(() => {
    return processedCampaigns.filter(c => c.actualWinnerCount > 0)
  }, [processedCampaigns])
  
  const topCampaignsData = useMemo(() => {
    if (topCampaignsType === 'registrants') {
      return campaignsWithRegistrants
        .sort((a, b) => b.registrantCount - a.registrantCount)
        .slice(0, 5)
    } else {
      return campaignsWithWinners
        .sort((a, b) => b.actualWinnerCount - a.actualWinnerCount)
        .slice(0, 5)
    }
  }, [topCampaignsType, campaignsWithRegistrants, campaignsWithWinners])
  
  const chartData = useMemo(() => {
    const registrationsByDay: Map<string, number> = new Map()
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      registrationsByDay.set(dateStr, 0)
    }
    
    registrations.forEach(reg => {
      const date = new Date(reg.registeredAt * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const currentCount = registrationsByDay.get(dateStr) || 0
      registrationsByDay.set(dateStr, currentCount + 1)
    })
    
    let chartDataArray = Array.from(registrationsByDay.entries())
      .map(([date, count]) => ({ 
        date, 
        registrants: count 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    chartDataArray = chartDataArray.map(item => {
      const date = new Date(item.date)
      const isToday = item.date === todayStr
      return {
        ...item,
        date: isToday ? 'Today' : date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
      }
    })
    
    return chartDataArray
  }, [registrations])

  const stats = useMemo(() => {
    const totalCampaigns = processedCampaigns.length
    const totalRegistrants = processedCampaigns.reduce((sum, c) => sum + (c.registrantCount || 0), 0)
    const totalWinners = processedCampaigns.reduce((sum, c) => sum + (c.actualWinnerCount || 0), 0)
    const activeCampaigns = processedCampaigns.filter(c => c.isActive).length
    const avgRegistrants = totalCampaigns > 0 ? (totalRegistrants / totalCampaigns).toFixed(1) : '0'
    const avgWinners = totalCampaigns > 0 ? (totalWinners / totalCampaigns).toFixed(1) : '0'
    const completionRate = totalRegistrants > 0 ? ((totalWinners / totalRegistrants) * 100).toFixed(1) : '0'
    
    const fcfsCount = processedCampaigns.filter(c => !c.isRaffle).length
    const raffleCount = processedCampaigns.filter(c => c.isRaffle).length
    const completedCount = processedCampaigns.filter(c => c.isCompleted).length
    
    const fcfsCampaigns = processedCampaigns.filter(c => !c.isRaffle)
    const raffleCampaigns = processedCampaigns.filter(c => c.isRaffle)
    
    const fcfsWinners = fcfsCampaigns.reduce((sum, c) => sum + c.actualWinnerCount, 0)
    const fcfsRegistrants = fcfsCampaigns.reduce((sum, c) => sum + c.registrantCount, 0)
    const raffleWinners = raffleCampaigns.reduce((sum, c) => sum + c.actualWinnerCount, 0)
    const raffleRegistrants = raffleCampaigns.reduce((sum, c) => sum + c.registrantCount, 0)
    
    const fcfsConversion = fcfsRegistrants > 0 ? (fcfsWinners / fcfsRegistrants * 100).toFixed(1) : '0'
    const raffleConversion = raffleRegistrants > 0 ? (raffleWinners / raffleRegistrants * 100).toFixed(1) : '0'
    
    const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60
    const lastMonthRegistrations = registrations.filter(r => r.registeredAt > thirtyDaysAgo).length
    const previousMonthRegistrations = registrations.filter(r => r.registeredAt <= thirtyDaysAgo).length
    let percentChange = 0
    if (previousMonthRegistrations === 0 && lastMonthRegistrations > 0) {
      percentChange = 100
    } else if (previousMonthRegistrations > 0) {
      percentChange = ((lastMonthRegistrations - previousMonthRegistrations) / previousMonthRegistrations) * 100
    }
    
    return {
      totalCampaigns,
      totalRegistrants,
      totalWinners,
      activeCampaigns,
      avgRegistrants,
      avgWinners,
      completionRate,
      chartData,
      fcfsCount,
      raffleCount,
      completedCount,
      growthCount: lastMonthRegistrations,
      growthPercent: percentChange,
      fcfsConversion,
      raffleConversion,
    }
  }, [processedCampaigns, registrations])

  const totalPages = Math.ceil(sortedAndFilteredCampaigns.length / itemsPerPage)
  const safeCurrentPage = Math.min(currentPage, totalPages || 1)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCampaigns = sortedAndFilteredCampaigns.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Show SKELETON loading - halaman tetap tampil tapi dengan animasi loading
  const isFirstLoad = loadingCampaigns && campaigns.length === 0

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header - always visible */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm">Overview of all whitelist campaigns on LitVM LiteForge</p>
            {lastUpdated && !isFirstLoad && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading || isFirstLoad}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-400">
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </span>
          </button>
        </div>

        {/* Loading progress bar */}
        {isLoading && loadingProgress > 0 && loadingProgress < 100 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Refreshing data...</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards - Show skeletons when loading first time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {isFirstLoad ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Campaigns</span>
                  <Trophy className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalCampaigns}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.growthPercent > 0 ? <ArrowUp className="w-3 h-3 text-green-500" /> : stats.growthPercent < 0 ? <ArrowDown className="w-3 h-3 text-red-500" /> : null}
                  <span className={`text-xs ${stats.growthPercent > 0 ? 'text-green-500' : stats.growthPercent < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {stats.growthPercent > 0 ? '+' : ''}{stats.growthPercent.toFixed(1)}% last 30 days
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Registrants</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalRegistrants}</p>
                <p className="text-xs text-gray-400 mt-1">Avg {stats.avgRegistrants} per campaign</p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Winners</span>
                  <TrendingUp className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalWinners}</p>
                <p className="text-xs text-gray-400 mt-1">Avg {stats.avgWinners} per campaign</p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Campaigns</span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.completedCount} completed</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Win Rate</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.completionRate}%</p>
                <p className="text-xs text-gray-400 mt-1">Registrants → Winners</p>
              </div>
            </>
          )}
        </div>

        {/* Charts - Show skeletons when loading first time */}
        {isFirstLoad ? (
          <>
            <ChartSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Chart - Based on actual registration time */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <LineChartIcon className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-white">Registrations Over Time</h3>
                <span className="text-xs text-gray-500 ml-2">(Based on actual registration time)</span>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value) => [`${value} registrations`, 'Count']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrants" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p>No registration data available</p>
                    <p className="text-xs mt-2">Registrations will appear here after users join campaigns</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">
                Total registrations tracked: {registrations.length}
              </p>
            </div>

            {/* Campaign Type & Conversion Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-white">Campaign Type Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={[
                      { name: 'FCFS', value: stats.fcfsCount },
                      { name: 'Raffle', value: stats.raffleCount },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-white">Winner Conversion Rate</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={[
                      { name: 'FCFS', rate: parseFloat(stats.fcfsConversion) },
                      { name: 'Raffle', rate: parseFloat(stats.raffleConversion) },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={60} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value) => [`${value}%`, 'Conversion Rate']}
                    />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                      <Cell key="fcfs" fill="#3b82f6" />
                      <Cell key="raffle" fill="#8b5cf6" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-300">FCFS <span className="font-semibold text-white ml-1">{stats.fcfsConversion}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-300">Raffle <span className="font-semibold text-white ml-1">{stats.raffleConversion}%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Status */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-white">Campaign Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  data={[
                    { name: 'Active', value: stats.activeCampaigns },
                    { name: 'Completed', value: stats.completedCount },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    <Cell key="active" fill="#10b981" />
                    <Cell key="completed" fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-300">Active <span className="font-semibold text-white ml-1">{stats.activeCampaigns}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-300">Completed <span className="font-semibold text-white ml-1">{stats.completedCount}</span></span>
                </div>
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {topCampaignsType === 'registrants' ? (
                    <Users className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                  <h3 className="font-semibold text-white">
                    Top Campaigns by {topCampaignsType === 'registrants' ? 'Registrants' : 'Winners'}
                  </h3>
                </div>
                
                <div className="flex gap-1 bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setTopCampaignsType('registrants')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      topCampaignsType === 'registrants'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3 h-3 inline mr-1" />
                    Registrants
                  </button>
                  <button
                    onClick={() => setTopCampaignsType('winners')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      topCampaignsType === 'winners'
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3 h-3 inline mr-1" />
                    Winners
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {topCampaignsData.length > 0 ? (
                  topCampaignsData.map((campaign, index) => (
                    <Link key={campaign.address} to={`/campaign/${campaign.address}`} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{campaign.name}</p>
                          <p className="text-xs text-gray-400">{shortAddr(campaign.address)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {topCampaignsType === 'registrants' ? (
                          <>
                            <p className="text-sm font-semibold text-white">{campaign.registrantCount}</p>
                            <p className="text-xs text-gray-400">registrants</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-yellow-400">{campaign.actualWinnerCount}</p>
                            <p className="text-xs text-gray-400">winners</p>
                          </>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">
                    {topCampaignsType === 'registrants' 
                      ? 'No campaigns with registrants yet' 
                      : 'No campaigns with winners yet'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* All Campaigns Table - Show skeleton rows when loading */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="font-semibold text-white">All Campaigns</h3>
              
              {!isFirstLoad && (
                <>
                  <div className="flex gap-1 bg-gray-700 rounded-lg p-0.5">
                    <button
                      onClick={() => {
                        setModeFilter('all')
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        modeFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setModeFilter('fcfs')
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        modeFilter === 'fcfs'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FCFSIcon className="w-3 h-3 inline mr-1" />
                      FCFS
                    </button>
                    <button
                      onClick={() => {
                        setModeFilter('raffle')
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        modeFilter === 'raffle'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <RaffleIcon className="w-3 h-3 inline mr-1" />
                      Raffle
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Total: {sortedAndFilteredCampaigns.length} campaigns
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Campaign</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Mode</th>
                  <th 
                    className="text-left py-3 px-4 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                    onClick={() => !isFirstLoad && handleSort('registrants')}
                  >
                    <div className="flex items-center gap-1">
                      Registrants
                      {!isFirstLoad && getSortIcon('registrants')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                    onClick={() => !isFirstLoad && handleSort('winners')}
                  >
                    <div className="flex items-center gap-1">
                      Winners
                      {!isFirstLoad && getSortIcon('winners')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                    onClick={() => !isFirstLoad && handleSort('conversion')}
                  >
                    <div className="flex items-center gap-1">
                      Conversion
                      {!isFirstLoad && getSortIcon('conversion')}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
                            <tbody>
                {isFirstLoad ? (
                  // Show 5 skeleton rows while loading
                  Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  <>
                    {currentCampaigns.map((campaign) => (
                      <tr key={campaign.address} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">{campaign.name}</p>
                          <p className="text-xs text-gray-400">{shortAddr(campaign.address)}</p>
                        </td>
                        <td className="py-3 px-4">
                          {campaign.isActive ? (
                            <div className="flex items-center gap-1 text-green-500">
                              <LiveIcon />
                              <span className="text-xs">Live</span>
                            </div>
                          ) : campaign.isCompleted ? (
                            <div className="flex items-center gap-1 text-orange-400">
                              <CompletedIcon />
                              <span className="text-xs">Completed</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Ended</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-400">
                            {campaign.isRaffle ? <RaffleIcon /> : <FCFSIcon />}
                            <span className="text-xs">{campaign.isRaffle ? 'Raffle' : 'FCFS'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white">{campaign.registrantCount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-yellow-400 font-medium">{campaign.actualWinnerCount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${campaign.conversionRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{campaign.conversionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date((campaign.createdAt || 0) * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/campaign/${campaign.address}`} className="text-blue-500 hover:underline text-xs">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {sortedAndFilteredCampaigns.length === 0 && !isFirstLoad && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">No campaigns found</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination - only show when not first loading */}
          {!isFirstLoad && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredCampaigns.length)} of {sortedAndFilteredCampaigns.length} campaigns
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    safeCurrentPage === 1 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (safeCurrentPage <= 3) {
                      pageNum = i + 1
                    } else if (safeCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = safeCurrentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                          safeCurrentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    safeCurrentPage === totalPages 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
