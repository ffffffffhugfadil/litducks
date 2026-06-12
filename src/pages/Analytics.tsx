// src/pages/Analytics.tsx - FULLY CORRECTED

import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, Users, Trophy, Calendar, 
  ArrowUp, ArrowDown, Loader2,
  BarChart3, LineChart as LineChartIcon, PieChart,
  ChevronLeft, ChevronRight, CheckCircle, RefreshCw, Database
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Interface definitions
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

interface RegistrationEvent {
  campaignAddress: string
  registrantAddress: string
  registeredAt: number
  isWinner: boolean
}

interface CampaignWithActualWinners extends CampaignStat {
  actualWinnerCount: number
  isCompleted: boolean
  conversionRate: number
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
  <div className="bg-surface border border-border rounded-xl p-4 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-4 w-24 bg-gray-700 rounded"></div>
      <div className="h-4 w-4 bg-gray-700 rounded"></div>
    </div>
    <div className="h-8 w-16 bg-gray-700 rounded mt-2"></div>
    <div className="h-3 w-28 bg-gray-700 rounded mt-2"></div>
  </div>
)

const ChartSkeleton = () => (
  <div className="bg-surface border border-border rounded-xl p-4 animate-pulse">
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
  <tr className="border-b border-border">
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

type SortField = 'registrants' | 'winners' | 'conversion'
type SortOrder = 'desc' | 'asc'
type ModeFilter = 'all' | 'fcfs' | 'raffle'

// Storage keys
const STORAGE_KEYS = {
  CAMPAIGNS: 'analytics_campaigns_data',
  REGISTRATIONS: 'analytics_registrations_data',
  TIMESTAMP: 'analytics_cache_timestamp',
}

export default function Analytics() {
  const { isConnected } = useAccount()
  
  // Load from localStorage on mount
  const [campaigns, setCampaigns] = useState<CampaignStat[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  
  const [registrations, setRegistrations] = useState<RegistrationEvent[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP)
      return timestamp ? new Date(parseInt(timestamp)) : null
    } catch {
      return null
    }
  })
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [topCampaignsType, setTopCampaignsType] = useState<'registrants' | 'winners'>('registrants')
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('registrants')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all')
  
  const itemsPerPage = 10

  // Helper functions
  const isFCFSCompleted = (campaign: CampaignStat) => {
    if (campaign.isRaffle) return false
    const isFull = campaign.registrantCount >= campaign.totalSlots
    const isPastDeadline = campaign.deadline > 0 && Date.now() / 1000 > campaign.deadline
    return !campaign.isActive || isFull || isPastDeadline
  }

  const getActualWinnerCount = (campaign: CampaignStat) => {
    if (campaign.isRaffle) {
      return campaign.winnerCount
    } else {
      if (isFCFSCompleted(campaign)) {
        return campaign.registrantCount
      }
      return 0
    }
  }

  // Process campaigns with computed fields
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
  }, [campaigns])

  // Filter by mode
  const filteredByMode = useMemo(() => {
    if (modeFilter === 'all') return processedCampaigns
    if (modeFilter === 'fcfs') return processedCampaigns.filter(c => !c.isRaffle)
    return processedCampaigns.filter(c => c.isRaffle)
  }, [processedCampaigns, modeFilter])

  // Sort campaigns
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
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
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
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />
  }

  // Chart data from registrations
  const chartData = useMemo(() => {
    const registrationsByDay: Map<string, number> = new Map()
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      registrationsByDay.set(dateStr, 0)
    }
    
    // Count registrations per day
    registrations.forEach(reg => {
      const date = new Date(reg.registeredAt * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const currentCount = registrationsByDay.get(dateStr) || 0
      registrationsByDay.set(dateStr, currentCount + 1)
    })
    
    // Convert to array and format dates
    return Array.from(registrationsByDay.entries())
      .map(([date, count]) => ({ 
        date, 
        registrants: count 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => {
        const date = new Date(item.date)
        const isToday = item.date === todayStr
        return {
          ...item,
          date: isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      })
  }, [registrations])

  // Statistics
  const stats = useMemo(() => {
    const totalCampaigns = processedCampaigns.length
    const totalRegistrants = processedCampaigns.reduce((sum, c) => sum + (c.registrantCount || 0), 0)
    const totalWinners = processedCampaigns.reduce((sum, c) => sum + (c.actualWinnerCount || 0), 0)
    const activeCampaigns = processedCampaigns.filter(c => c.isActive === true && !c.isCompleted).length
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
    
    // Growth calculation
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
      fcfsCount,
      raffleCount,
      completedCount,
      growthCount: lastMonthRegistrations,
      growthPercent: percentChange,
      fcfsConversion,
      raffleConversion,
    }
  }, [processedCampaigns, registrations])

  // Top campaigns
  const campaignsWithRegistrants = useMemo(() => {
    return processedCampaigns.filter(c => c.registrantCount > 0)
  }, [processedCampaigns])
  
  const campaignsWithWinners = useMemo(() => {
    return processedCampaigns.filter(c => c.actualWinnerCount > 0)
  }, [processedCampaigns])
  
  const topCampaignsData = useMemo(() => {
    if (topCampaignsType === 'registrants') {
      return [...campaignsWithRegistrants]
        .sort((a, b) => b.registrantCount - a.registrantCount)
        .slice(0, 5)
    } else {
      return [...campaignsWithWinners]
        .sort((a, b) => b.actualWinnerCount - a.actualWinnerCount)
        .slice(0, 5)
    }
  }, [topCampaignsType, campaignsWithRegistrants, campaignsWithWinners])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedAndFilteredCampaigns.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCampaigns = sortedAndFilteredCampaigns.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Data age status
  const getDataAgeStatus = () => {
    if (!lastUpdated) return { label: 'No data', color: 'bg-gray-500' }
    const age = Date.now() - lastUpdated.getTime()
    const minutes = Math.floor(age / 60000)
    if (minutes < 5) return { label: 'Fresh', color: 'bg-green-500' }
    if (minutes < 15) return { label: 'Stale', color: 'bg-yellow-500' }
    return { label: 'Old', color: 'bg-red-500' }
  }

  const dataStatus = getDataAgeStatus()
  const isFirstLoad = campaigns.length === 0 && !isRefreshing && lastUpdated === null

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-text mb-1">Analytics Dashboard</h1>
            <p className="text-text-secondary text-sm">Overview of all whitelist campaigns</p>
            {lastUpdated && !isFirstLoad && (
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${dataStatus.color}`} />
                <p className="text-xs text-text-secondary">
                  Data {dataStatus.label} • Last updated: {lastUpdated.toLocaleString()}
                </p>
              </div>
            )}
            {isFirstLoad && (
              <p className="text-xs text-text-secondary mt-1">
                <Database className="w-3 h-3 inline mr-1" />
                Loading data...
              </p>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface border border-border rounded-lg transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-text-secondary" />
            )}
            <span className="text-sm text-text-secondary">
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
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
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Total Campaigns</span>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-text">{stats.totalCampaigns}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.growthPercent > 0 ? <ArrowUp className="w-3 h-3 text-success" /> : stats.growthPercent < 0 ? <ArrowDown className="w-3 h-3 text-error" /> : null}
                  <span className={`text-xs ${stats.growthPercent > 0 ? 'text-success' : stats.growthPercent < 0 ? 'text-error' : 'text-text-secondary'}`}>
                    {stats.growthPercent > 0 ? '+' : ''}{stats.growthPercent.toFixed(1)}% last 30 days
                  </span>
                </div>
              </div>
              
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Total Registrants</span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-text">{stats.totalRegistrants.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">Avg {stats.avgRegistrants} per campaign</p>
              </div>
              
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Total Winners</span>
                  <TrendingUp className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{stats.totalWinners.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">Avg {stats.avgWinners} per campaign</p>
              </div>
              
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Active Campaigns</span>
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-text">{stats.activeCampaigns}</p>
                <p className="text-xs text-text-secondary mt-1">{stats.completedCount} completed</p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Win Rate</span>
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{stats.completionRate}%</p>
                <p className="text-xs text-text-secondary mt-1">Registrants → Winners</p>
              </div>
            </>
          )}
        </div>

        {/* Charts */}
        {isFirstLoad ? (
          <>
            <ChartSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </>
        ) : (
          <>
            {/* Registrations Over Time */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <LineChartIcon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-text">Registrations Over Time (Last 14 Days)</h3>
              </div>
              {chartData.length > 0 && registrations.length > 0 ? (
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
                <div className="h-[300px] flex items-center justify-center text-text-secondary">
                  <div className="text-center">
                    <p>No registration data available</p>
                    <p className="text-xs mt-2">Registrations will appear here after users join campaigns</p>
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Type & Conversion Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-text">Campaign Type Distribution</h3>
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

              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-text">Winner Conversion Rate</h3>
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
                    <span className="text-sm text-text-secondary">FCFS <span className="font-semibold text-text ml-1">{stats.fcfsConversion}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-text-secondary">Raffle <span className="font-semibold text-text ml-1">{stats.raffleConversion}%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Status */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-text">Campaign Status</h3>
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
                  <span className="text-sm text-text-secondary">Active <span className="font-semibold text-text ml-1">{stats.activeCampaigns}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-text-secondary">Completed <span className="font-semibold text-text ml-1">{stats.completedCount}</span></span>
                </div>
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {topCampaignsType === 'registrants' ? (
                    <Users className="w-4 h-4 text-primary" />
                  ) : (
                    <Trophy className="w-4 h-4 text-warning" />
                  )}
                  <h3 className="font-semibold text-text">
                    Top Campaigns by {topCampaignsType === 'registrants' ? 'Registrants' : 'Winners'}
                  </h3>
                </div>
                
                <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
                  <button
                    onClick={() => setTopCampaignsType('registrants')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      topCampaignsType === 'registrants'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Users className="w-3 h-3 inline mr-1" />
                    Registrants
                  </button>
                  <button
                    onClick={() => setTopCampaignsType('winners')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      topCampaignsType === 'winners'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text'
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
                    <Link key={campaign.address} to={`/campaign/${campaign.address}`} className="flex items-center justify-between p-2 hover:bg-surface-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text">{campaign.name}</p>
                          <p className="text-xs text-text-secondary">{shortAddr(campaign.address)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {topCampaignsType === 'registrants' ? (
                          <>
                            <p className="text-sm font-semibold text-text">{campaign.registrantCount.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary">registrants</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-warning">{campaign.actualWinnerCount.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary">winners</p>
                          </>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-text-secondary py-4">
                    {topCampaignsType === 'registrants' 
                      ? 'No campaigns with registrants yet' 
                      : 'No campaigns with winners yet'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* All Campaigns Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="font-semibold text-text">All Campaigns</h3>
              
              {!isFirstLoad && (
                <>
                  <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
                    <button
                      onClick={() => {
                        setModeFilter('all')
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        modeFilter === 'all'
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:text-text'
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
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      <FCFSIcon />
                      <span className="ml-1">FCFS</span>
                    </button>
                    <button
                      onClick={() => {
                        setModeFilter('raffle')
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        modeFilter === 'raffle'
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      <RaffleIcon />
                      <span className="ml-1">Raffle</span>
                    </button>
                  </div>
                  
                  <p className="text-xs text-text-secondary">
                    Total: {sortedAndFilteredCampaigns.length} campaigns
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Campaign</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Mode</th>
                  <th 
                    className="text-left py-3 px-4 text-text-secondary font-medium cursor-pointer hover:text-text transition-colors"
                    onClick={() => !isFirstLoad && handleSort('registrants')}
                  >
                    <div className="flex items-center gap-1">
                      Registrants
                      {!isFirstLoad && getSortIcon('registrants')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-text-secondary font-medium cursor-pointer hover:text-text transition-colors"
                    onClick={() => !isFirstLoad && handleSort('winners')}
                  >
                    <div className="flex items-center gap-1">
                      Winners
                      {!isFirstLoad && getSortIcon('winners')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-text-secondary font-medium cursor-pointer hover:text-text transition-colors"
                    onClick={() => !isFirstLoad && handleSort('conversion')}
                  >
                    <div className="flex items-center gap-1">
                      Conversion
                      {!isFirstLoad && getSortIcon('conversion')}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFirstLoad ? (
                  Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  <>
                    {currentCampaigns.map((campaign) => (
                      <tr key={campaign.address} className="border-b border-border hover:bg-surface-2 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-text">{campaign.name}</p>
                          <p className="text-xs text-text-secondary">{shortAddr(campaign.address)}</p>
                        </td>
                        <td className="py-3 px-4">
                          {campaign.isActive && !campaign.isCompleted ? (
                            <div className="flex items-center gap-1 text-success">
                              <LiveIcon />
                              <span className="text-xs">Live</span>
                            </div>
                          ) : campaign.isCompleted ? (
                            <div className="flex items-center gap-1 text-warning">
                              <CompletedIcon />
                              <span className="text-xs">Completed</span>
                            </div>
                          ) : (
                            <span className="text-xs text-text-secondary">Ended</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-text-secondary">
                            {campaign.isRaffle ? <RaffleIcon /> : <FCFSIcon />}
                            <span className="text-xs">{campaign.isRaffle ? 'Raffle' : 'FCFS'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text">{campaign.registrantCount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-warning font-medium">{campaign.actualWinnerCount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-success rounded-full"
                                style={{ width: `${campaign.conversionRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary">{campaign.conversionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {new Date((campaign.createdAt || 0) * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/campaign/${campaign.address}`} className="text-primary hover:underline text-xs">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {sortedAndFilteredCampaigns.length === 0 && !isFirstLoad && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-text-secondary">No campaigns found</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isFirstLoad && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-text-secondary">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredCampaigns.length)} of {sortedAndFilteredCampaigns.length} campaigns
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    safeCurrentPage === 1 
                      ? 'text-text-secondary cursor-not-allowed opacity-50' 
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
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
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text hover:bg-surface-2'
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
                      ? 'text-text-secondary cursor-not-allowed opacity-50' 
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
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
