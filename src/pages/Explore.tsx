// src/pages/Explore.tsx
import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFactory } from '../hooks/useFactory'
import CampaignCard from '../components/campaigns/CampaignCard'
import SkeletonCard from '../components/campaigns/SkeletonCard'
import FactoryAddressInput from '../components/ui/FactoryAddressInput'
import { useWalletStore } from '../store/useWalletStore'
import { useReadContract } from 'wagmi'
import { CAMPAIGN_ABI } from '../config/contracts'

type Filter = 'all' | 'live' | 'ended' | 'fcfs' | 'raffle'

// Komponen wrapper untuk mendapatkan info campaign
function CampaignItemWithData({ address, filter, onNameLoaded }: { 
  address: string; 
  filter: Filter;
  onNameLoaded?: (address: string, name: string) => void 
}) {
  const { data: selectionMode, isLoading: loadingMode } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'selectionMode',
  })
  
  const { data: isActive, isLoading: loadingActive } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'isActive',
  })
  
  const { data: name, isLoading: loadingName } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'name',
  })
  
  const isLoading = loadingMode || loadingActive || loadingName
  
  // Kirim nama campaign ke parent untuk search
  useEffect(() => {
    if (name && !loadingName && onNameLoaded) {
      onNameLoaded(address, name as string)
    }
  }, [name, loadingName, address, onNameLoaded])
  
  // Logika filter
  let shouldShow = true
  switch (filter) {
    case 'live':
      shouldShow = isActive === true
      break
    case 'ended':
      shouldShow = isActive === false
      break
    case 'fcfs':
      shouldShow = selectionMode === 0
      break
    case 'raffle':
      shouldShow = selectionMode === 1
      break
    default:
      shouldShow = true
  }
  
  if (isLoading) {
    return <SkeletonCard />
  }
  
  if (!shouldShow) {
    return null
  }
  
  return <CampaignCard address={address} />
}

export default function Explore() {
  const { factoryAddress } = useWalletStore()
  const { allCampaigns, loadingCampaigns } = useFactory()
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<'address' | 'name'>('name') // ✅ Default ke name
  const [filter, setFilter] = useState<Filter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [campaignNames, setCampaignNames] = useState<Map<string, string>>(new Map())
  const itemsPerPage = 12

  const campaigns = allCampaigns ?? []

  // Kumpulkan nama campaign
  const handleNameLoaded = (address: string, name: string) => {
    setCampaignNames(prev => {
      if (prev.get(address) === name) return prev
      const newMap = new Map(prev)
      newMap.set(address, name)
      return newMap
    })
  }

  // Urutkan campaign (terbaru di atas)
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].reverse()
  }, [campaigns])

  // ✅ Filter berdasarkan search (address ATAU name)
  const filteredBySearch = useMemo(() => {
    if (!search) return sortedCampaigns
    
    return sortedCampaigns.filter(addr => {
      if (searchType === 'address') {
        return addr.toLowerCase().includes(search.toLowerCase())
      } else {
        // Search by name
        const name = campaignNames.get(addr)?.toLowerCase() || ''
        return name.includes(search.toLowerCase())
      }
    })
  }, [sortedCampaigns, search, searchType, campaignNames])

  // Pagination
  const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage)
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredBySearch.slice(start, end)
  }, [filteredBySearch, currentPage])

  // Reset page ketika filter atau search berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [search, searchType, filter])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'live', label: 'Live' },
    { key: 'ended', label: 'Ended' },
    { key: 'fcfs', label: 'FCFS' },
    { key: 'raffle', label: 'Raffle' },
  ]

  if (!factoryAddress) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-md mx-auto text-center mt-20">
            <p className="text-text-secondary text-sm mb-4">Configure factory address to explore campaigns</p>
            <FactoryAddressInput />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-1">Explore Campaigns</h1>
          <p className="text-text-secondary text-sm">
            {filteredBySearch.length} campaign{filteredBySearch.length !== 1 ? 's' : ''} on LitVM LiteForge
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchType === 'name' ? "Search by campaign name..." : "Search by address..."}
              className="w-full pl-9 pr-24 py-2.5 bg-surface border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                onClick={() => setSearchType('name')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  searchType === 'name'
                    ? 'bg-primary text-white'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSearchType('address')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  searchType === 'address'
                    ? 'bg-primary text-white'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                Address
              </button>
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg p-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loadingCampaigns ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredBySearch.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-text mb-1">No campaigns found</p>
            <p className="text-sm">
              {search ? `No campaign matches "${search}"` : 'Be the first to create a whitelist campaign on LiteForge.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedCampaigns.map(addr => (
                <CampaignItemWithData 
                  key={addr} 
                  address={addr} 
                  filter={filter}
                  onNameLoaded={handleNameLoaded}
                />
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
      </div>
    </div>
  )
}
