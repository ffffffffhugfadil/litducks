// src/pages/Campaign.tsx
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useEffect, useState, useRef } from 'react'
import {
  Calendar, Users, Globe, Twitter, MessageSquare, ExternalLink,
  Trophy, Zap, CheckCircle, XCircle, Loader2, AlertTriangle, Star
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { isAddress } from 'viem'
import { useCampaign, useCampaignRegistered, useCampaignIsWinner } from '../hooks/useCampaign'
import { useRequirements } from '../hooks/useRequirements'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { EXPLORER_URL, FAUCET_URL } from '../lib/chain'
import { ipfsToUrl } from '../utils/ipfs'

function shortAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const { address: userAddress, isConnected } = useAccount()
  const { isCorrectNetwork, switchToLiteForge } = useNetworkGuard()
  const [reqChecked, setReqChecked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [tokenCheckDone, setTokenCheckDone] = useState(false)
  const [tokenChecking, setTokenChecking] = useState(false)
  const [tokenCheckResult, setTokenCheckResult] = useState<boolean | null>(null)
  const [tokenBalanceUser, setTokenBalanceUser] = useState<string>('0')
  const [tokenBalanceRequired, setTokenBalanceRequired] = useState<string>('0')
  const [countdown, setCountdown] = useState('')
  const [copied, setCopied] = useState(false)
  const [showAllRegistrants, setShowAllRegistrants] = useState(false)
  const [showAllWinners, setShowAllWinners] = useState(false)
  
  const hasFetchedRef = useRef(false)

  const campaignAddr = isAddress(id ?? '') ? (id as `0x${string}`) : undefined

  const {
    info, registrants, winners,
    loadingInfo, register, runRaffle,
    isPending, isConfirming, isConfirmed,
    writeError, refetchAll,
    registrantCount, winnerCount, isActive, slotsRemaining
  } = useCampaign(campaignAddr)

  const { data: isRegistered, refetch: refetchReg } = useCampaignRegistered(campaignAddr, userAddress)
  const { data: isWinnerFromContract } = useCampaignIsWinner(campaignAddr, userAddress)

  const { checking, checkingStep, result: reqResult, checkRequirements } = useRequirements()

  // Countdown timer
  useEffect(() => {
    if (!info?.deadline || info.deadline === 0) return
    
    const deadlineDate = new Date(info.deadline * 1000)
    if (isNaN(deadlineDate.getTime())) return
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = deadlineDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown('Ended')
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setCountdown(`${minutes}m ${seconds}s`)
      }
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [info?.deadline])

  useEffect(() => {
    if (isConfirmed) {
      refetchAll()
      refetchReg()
    }
  }, [isConfirmed, refetchAll, refetchReg])

  useEffect(() => {
    if (hasFetchedRef.current) return
    if (!userAddress || !info || !isCorrectNetwork) return
    
    hasFetchedRef.current = true
    
    const requirementsInfo = {
      minTransactions: info.minTransactions,
      minWalletAgeDays: info.minWalletAgeDays,
      requiredToken: '0x0000000000000000000000000000000000000000',
      tokenType: 0,
      minTokenBalance: 0,
      tokenId: 0,
    }
    
    checkRequirements(userAddress, requirementsInfo).then(() => {
      setReqChecked(true)
    })
  }, [userAddress, info, isCorrectNetwork, checkRequirements])

  const handleManualTokenCheck = async () => {
    if (!userAddress || !info) return
    
    setTokenChecking(true)
    setTokenCheckResult(null)
    
    try {
      const requirementsInfo = {
        minTransactions: 0,
        minWalletAgeDays: 0,
        requiredToken: info.requiredToken,
        tokenType: info.tokenType,
        minTokenBalance: info.minTokenBalance,
        tokenId: info.tokenId,
      }
      
      const result = await checkRequirements(userAddress, requirementsInfo)
      setTokenCheckResult(result.tokenBalance ?? false)
      setTokenCheckDone(true)
      setTokenBalanceUser(result.details?.tokenBalance?.toString() ?? '0')
      setTokenBalanceRequired(info.minTokenBalance?.toString() ?? '1')
    } catch (error) {
      console.error('Token check failed:', error)
      setTokenCheckResult(false)
      setTokenCheckDone(true)
      setTokenBalanceUser('0')
      setTokenBalanceRequired(info.minTokenBalance?.toString() ?? '1')
    } finally {
      setTokenChecking(false)
    }
  }

  const handleRegister = async () => {
    if (!userAddress || !info) return
    
    setIsVerifying(true)
    
    const requirementsInfo = {
      minTransactions: info.minTransactions,
      minWalletAgeDays: info.minWalletAgeDays,
      requiredToken: info.requiredToken,
      tokenType: info.tokenType,
      minTokenBalance: info.minTokenBalance,
      tokenId: info.tokenId,
    }
    
    const freshResult = await checkRequirements(userAddress, requirementsInfo)
    
    setIsVerifying(false)
    
    if (freshResult.allPassed) {
      register()
    } else {
      alert("Your wallet no longer meets the requirements. Please check again.")
    }
  }

  const handleCopyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ============ VALIDATION ============
  if (!campaignAddr || !isAddress(campaignAddr)) {
    return (
      <div className="pt-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-error/10 border border-error/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-error" />
          <span className="text-sm text-error">Invalid campaign address</span>
        </div>
      </div>
    )
  }

  if (loadingInfo) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-48 sm:h-56 bg-surface-2 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-surface-2 rounded w-3/4" />
                <div className="h-4 bg-surface-2 rounded w-full" />
                <div className="h-4 bg-surface-2 rounded w-2/3" />
                <div className="h-32 bg-surface-2 rounded-xl mt-4" />
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-surface-2 rounded-xl" />
                <div className="h-32 bg-surface-2 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="pt-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-warning/10 border border-warning/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-sm text-warning">Campaign not found or failed to load.</span>
        </div>
      </div>
    )
  }

  // ============ DATA PROCESSING ============
  const creatorAddress = info.creator
  const deadlineTimestamp = info.deadline ?? 0
  const deadlineDate = deadlineTimestamp > 0 ? new Date(deadlineTimestamp * 1000) : null
  const isValidDeadline = deadlineDate && !isNaN(deadlineDate.getTime())
  const isPastDeadline = isValidDeadline ? deadlineDate < new Date() : true

  const isRaffle = info.selectionMode === 1
  const isFCFS = info.selectionMode === 0
  const totalSlots = info.totalSlots ?? 0
  const registered = registrantCount ?? 0
  const isFull = totalSlots > 0 && registered >= totalSlots
  const isCampaignEnded = !isActive || isPastDeadline || isFull
  const fillPct = totalSlots > 0 ? Math.min(100, (registered / totalSlots) * 100) : 0

  // ✅ LOGIC WINNER - gunakan data winners dari contract, dengan fallback
  const getWinnersData = () => {
    // Jika contract sudah mengembalikan winners array
    if (winners && Array.isArray(winners) && winners.length > 0) {
      return {
        list: winners,
        count: winners.length
      }
    }
    
    // Fallback: hitung dari winnerCount (bigint/number)
    if (winnerCount !== undefined && winnerCount !== null && Number(winnerCount) > 0) {
      return {
        list: [],
        count: Number(winnerCount)
      }
    }
    
    // Fallback FCFS: jika campaign ended, semua registrants adalah winners
    if (isFCFS && isCampaignEnded && registrants && Array.isArray(registrants) && registrants.length > 0) {
      return {
        list: registrants,
        count: registrants.length
      }
    }
    
    // Tidak ada data winner
    return {
      list: [],
      count: 0
    }
  }

  const winnersData = getWinnersData()
  const displayWinners = winnersData.list
  const totalWinners = winnersData.count

  // ✅ LOGIC ISWINNER - samakan dengan Profile.tsx
  const isWinner = isRegistered && (() => {
    if (isRaffle) {
      return isWinnerFromContract === true
    }
    if (isFCFS && isCampaignEnded) {
      return true
    }
    return false
  })()

  // ============ REQUIREMENTS LOGIC ============
  const isTxRequirementMet = (info.minTransactions === 0) || (reqResult?.txCount === true)
  const isWalletAgeRequirementMet = (info.minWalletAgeDays === 0) || (reqResult?.walletAge === true)
  
  const hasTokenRequirement = !!(
    info.requiredToken && 
    info.requiredToken !== '0x0000000000000000000000000000000000000000' &&
    info.requiredToken !== '' &&
    (info.minTokenBalance ?? 0) > 0
  )
  
  const isTokenRequirementMet = !hasTokenRequirement || tokenCheckResult === true

  const hasAnyRequirement = (info.minTransactions > 0) || 
    (info.minWalletAgeDays > 0) || 
    hasTokenRequirement

  const allRequirementsMet = isTxRequirementMet && 
    isWalletAgeRequirementMet && 
    (!hasTokenRequirement || (tokenCheckDone && tokenCheckResult === true))

  const totalRequirements = [
    info.minTransactions > 0,
    info.minWalletAgeDays > 0,
    hasTokenRequirement
  ].filter(Boolean).length

  const metRequirements = [
    info.minTransactions > 0 ? isTxRequirementMet : null,
    info.minWalletAgeDays > 0 ? isWalletAgeRequirementMet : null,
    hasTokenRequirement ? tokenCheckResult === true : null
  ].filter(r => r === true).length

  const canRegister = isConnected && isCorrectNetwork && !isRegistered && isActive
    && !isPastDeadline && reqChecked && allRequirementsMet
    && (isRaffle || (slotsRemaining ?? 0) > 0) && !isVerifying

  const canRunRaffle = isConnected && userAddress?.toLowerCase() === creatorAddress?.toLowerCase()
    && isRaffle && isPastDeadline && isActive && !info.raffleRun

  const getTokenRequirementLabel = () => {
    if (!hasTokenRequirement) return null
    
    const minBalance = info.minTokenBalance?.toString() ?? '1'
    const tokenIdValue = info.tokenId?.toString() ?? '0'
    
    if (info.tokenType === 1) {
      return `Hold at least ${minBalance} token(s)`
    }
    if (info.tokenType === 2) {
      if (tokenIdValue !== '0') {
        return `Own NFT Token ID: ${tokenIdValue}`
      }
      return `Hold at least ${minBalance} NFT(s)`
    }
    return `Hold token`
  }

  const getTokenContractLabel = () => {
    if (!hasTokenRequirement || !info.requiredToken) return null
    return shortAddr(info.requiredToken)
  }

  const getButtonText = () => {
    if (isPending) return 'Confirm in wallet…'
    if (isConfirming) return 'Registering…'
    if (isVerifying) return 'Verifying requirements…'
    if (checking) return 'Checking requirements…'
    if (!reqChecked) return 'Loading requirements…'
    if (hasTokenRequirement && !tokenCheckDone) return 'Verify token balance first'
    if (!canRegister) {
      if (isPastDeadline) return 'Registration ended'
      if (!isRaffle && slotsRemaining === 0) return 'All slots filled'
      if (!isTxRequirementMet) return 'Insufficient transactions'
      if (!isWalletAgeRequirementMet) return 'Wallet too new'
      if (hasTokenRequirement && tokenCheckResult === false) return 'Insufficient token balance'
      return 'Requirements not met'
    }
    return isRaffle ? 'Enter Raffle' : 'Claim Spot'
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Banner with IPFS support */}
        <div className="h-48 sm:h-56 rounded-2xl overflow-hidden bg-surface-2 mb-6 relative group">
          {info.bannerImage ? (
            <img 
              src={ipfsToUrl(info.bannerImage)}
              alt={info.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              onError={(e) => {
                console.log('Gambar gagal load:', info.bannerImage)
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-surface-2 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-6 flex items-center gap-2">
            {info.isFeatured && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/90 text-white backdrop-blur-sm">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            {info.isPro && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                Pro
              </span>
            )}
          </div>

          {/* Status badge */}
          <div className="absolute top-4 right-6">
            <span className={`text-xs px-2.5 py-1 rounded-full backdrop-blur-sm ${
              !isActive ? 'bg-surface-2/90 text-text-secondary' :
              isPastDeadline && isRaffle ? 'bg-warning/90 text-white' :
              isPastDeadline && isFCFS ? 'bg-blue-500/90 text-white' :
              'bg-success/90 text-white'
            }`}>
              {!isActive ? 'Ended' : 
               isPastDeadline && isRaffle ? 'Drawing soon' : 
               isPastDeadline && isFCFS ? 'Registration closed' :
               'Live'}
            </span>
          </div>

          {/* Countdown */}
          {isActive && !isPastDeadline && countdown && (
            <div className="absolute bottom-4 right-6">
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm font-mono">
                {countdown}
              </span>
            </div>
          )}

          {/* Winner badge on banner */}
          {isWinner && (
            <div className="absolute bottom-4 left-6">
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-yellow-500/90 text-white backdrop-blur-sm">
                <Trophy className="w-3 h-3" /> You won!
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ MAIN CONTENT ============ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">{info.name || 'Untitled'}</h1>
                  {/* Mode badges */}
                  <div className="flex items-center gap-2 mb-2">
                    {isRaffle && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Raffle
                      </span>
                    )}
                    {isFCFS && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        First Come First Served
                      </span>
                    )}
                  </div>
                </div>
                {isConnected && userAddress?.toLowerCase() === creatorAddress?.toLowerCase() && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    Owner
                  </span>
                )}
              </div>
              
              {info.description && (
                <p className="text-text-secondary text-sm leading-relaxed">{info.description}</p>
              )}

              {/* Social links */}
              <div className="flex flex-wrap gap-2 mt-4">
                {info.twitter && (
                  <a
                    href={`https://twitter.com/${info.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-primary/30 rounded-lg text-xs text-text-secondary hover:text-primary transition-all duration-200"
                  >
                    <Twitter className="w-3.5 h-3.5" /> {info.twitter}
                  </a>
                )}
                {info.discord && (
                  <a
                    href={info.discord.startsWith('http') ? info.discord : `https://discord.gg/${info.discord}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-primary/30 rounded-lg text-xs text-text-secondary hover:text-primary transition-all duration-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Discord
                  </a>
                )}
                {info.website && (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-primary/30 rounded-lg text-xs text-text-secondary hover:text-primary transition-all duration-200"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                <a
                  href={`${EXPLORER_URL}/address/${campaignAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-primary/30 rounded-lg text-xs text-text-secondary hover:text-primary transition-all duration-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Explorer
                </a>
              </div>
            </div>

            {/* Requirements - Step by Step */}
            <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text text-sm">Requirements</h3>
                {totalRequirements > 0 && (
                  <span className="text-xs text-text-secondary">
                    {metRequirements}/{totalRequirements} met
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalRequirements > 0 && (
                <div className="h-1.5 bg-surface-2 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(metRequirements/totalRequirements) * 100}%` }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {/* Step 1: Min Transactions */}
                <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    {checking && checkingStep === 'tx' ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : info.minTransactions === 0 ? (
                      <CheckCircle className="w-4 h-4 text-success opacity-40" />
                    ) : reqResult?.txCount === true ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : reqResult?.txCount === false ? (
                      <XCircle className="w-4 h-4 text-error" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                    <div>
                      <span className="text-sm text-text">
                        {info.minTransactions === 0 ? 'No transaction requirement' : `Min ${info.minTransactions} transaction(s)`}
                      </span>
                      {reqResult && info.minTransactions > 0 && !checking && (
                        <p className={`text-xs mt-0.5 ${reqResult.txCount ? 'text-success' : 'text-error'}`}>
                          {reqResult.txCount 
                            ? `✓ You have ${reqResult.details?.txCount ?? 0} transactions` 
                            : `✗ Only ${reqResult.details?.txCount ?? 0} transactions`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Min Wallet Age */}
                <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    {checking && checkingStep === 'wallet' ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : info.minWalletAgeDays === 0 ? (
                      <CheckCircle className="w-4 h-4 text-success opacity-40" />
                    ) : reqResult?.walletAge === true ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : reqResult?.walletAge === false ? (
                      <XCircle className="w-4 h-4 text-error" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                    <div>
                      <span className="text-sm text-text">
                        {info.minWalletAgeDays === 0 ? 'No wallet age requirement' : `Wallet age ≥ ${info.minWalletAgeDays} day(s)`}
                      </span>
                      {reqResult && info.minWalletAgeDays > 0 && !checking && (
                        <p className={`text-xs mt-0.5 ${reqResult.walletAge ? 'text-success' : 'text-error'}`}>
                          {reqResult.walletAge 
                            ? `✓ Wallet is ${reqResult.details?.walletAgeDays ?? 0} days old` 
                            : `✗ Wallet only ${reqResult.details?.walletAgeDays ?? 0} days old`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Token Requirement - Manual Check */}
                {hasTokenRequirement && (
                  <div className="py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {tokenChecking ? (
                          <Loader2 className="w-4 h-4 text-warning animate-spin" />
                        ) : !tokenCheckDone ? (
                          <div className="w-4 h-4 rounded-full border-2 border-warning" />
                        ) : tokenCheckResult === true ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-error" />
                        )}
                        <div>
                          <span className="text-sm text-text">{getTokenRequirementLabel()}</span>
                          {getTokenContractLabel() && (
                            <span className="text-xs text-text-secondary ml-2">({getTokenContractLabel()})</span>
                          )}
                        </div>
                      </div>
                      
                      {!tokenCheckDone && (
                        <button
                          onClick={handleManualTokenCheck}
                          disabled={tokenChecking}
                          className="text-xs px-3 py-1.5 bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {tokenChecking ? 'Checking…' : 'Verify'}
                        </button>
                      )}
                      
                      {tokenCheckDone && (
                        <span className={`text-xs font-medium shrink-0 ${tokenCheckResult ? 'text-success' : 'text-error'}`}>
                          {tokenCheckResult ? 'Qualified' : 'Failed'}
                        </span>
                      )}
                    </div>

                    {/* Token balance bar */}
                    {tokenCheckDone && (
                      <div className="mt-2.5 pl-7">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary">
                            Your balance: <span className={tokenCheckResult ? 'text-success font-medium' : 'text-error font-medium'}>{tokenBalanceUser}</span>
                          </span>
                          <span className="text-xs text-text-secondary">
                            Required: <span className="text-text font-medium">{tokenBalanceRequired}</span>
                          </span>
                        </div>
                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              tokenCheckResult ? 'bg-success' : 'bg-error'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (Number(tokenBalanceUser) / Number(tokenBalanceRequired)) * 100)}%` 
                            }}
                          />
                        </div>
                        {!tokenCheckResult && (
                          <p className="text-xs text-error mt-1">
                            You need {Number(tokenBalanceRequired) - Number(tokenBalanceUser)} more token(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* No requirements message */}
                {!hasAnyRequirement && (
                  <div className="flex items-center gap-2 py-2.5 px-3 text-sm text-text-secondary opacity-70">
                    <CheckCircle className="w-4 h-4 text-success opacity-40" />
                    Open to everyone — no requirements
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors">
                <p className="text-lg font-bold text-text">{registered}</p>
                <p className="text-xs text-text-secondary">Registered</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors">
                <p className="text-lg font-bold text-text">{totalSlots}</p>
                <p className="text-xs text-text-secondary">Total Slots</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors">
                <p className="text-lg font-bold text-text">{totalWinners}</p>
                <p className="text-xs text-text-secondary">Winners</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors">
                <p className="text-lg font-bold text-text">
                  {isRaffle ? 'Raffle' : 'FCFS'}
                </p>
                <p className="text-xs text-text-secondary">Mode</p>
              </div>
            </div>

            {/* ✅ WINNERS PANEL - DENGAN FALLBACK */}
            {isCampaignEnded && totalWinners > 0 && (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAllWinners(!showAllWinners)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-medium text-text hover:bg-surface-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Winners
                    <span className="text-xs text-text-secondary font-normal">({totalWinners})</span>
                  </span>
                  <span className={`text-xs text-text-secondary transition-transform duration-200 ${showAllWinners ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {showAllWinners && (
                  <div className="px-5 pb-4 max-h-60 overflow-y-auto space-y-1">
                    {displayWinners.length > 0 ? (
                      displayWinners.map((w, i) => (
                        <div 
                          key={w} 
                          className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors duration-200 ${
                            userAddress?.toLowerCase() === w.toLowerCase() 
                              ? 'bg-yellow-500/5 border border-yellow-500/20' 
                              : 'bg-surface-2 hover:bg-surface-2/70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary font-mono w-5">{i + 1}</span>
                            <a
                              href={`${EXPLORER_URL}/address/${w}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-text hover:text-primary transition-colors"
                            >
                              {shortAddr(w)}
                            </a>
                            {userAddress?.toLowerCase() === w.toLowerCase() && (
                              <span className="text-xs text-yellow-400 font-medium ml-2 flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> You!
                              </span>
                            )}
                          </div>
                          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-text-secondary">
                          {isRaffle 
                            ? 'Winner addresses not available. Check explorer for details.' 
                            : `${totalWinners} winner${totalWinners !== 1 ? 's' : ''} selected`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Raffle not drawn yet info */}
            {!isCampaignEnded && isRaffle && registered > 0 && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-text font-medium mb-1">Raffle Not Drawn Yet</p>
                    <p className="text-xs text-text-secondary">
                      Winners will be selected after the deadline. {registered} participant{registered !== 1 ? 's' : ''} entered.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FCFS Winners Info */}
            {isFCFS && isCampaignEnded && registrants && registrants.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-400 font-medium mb-1">FCFS Campaign Ended</p>
                    <p className="text-xs text-blue-400/80">
                      All {registrants.length} registered participant{registrants.length !== 1 ? 's are' : ' is'} winner{registrants.length !== 1 ? 's' : ''} in this First Come First Served campaign.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - No registrants */}
            {registered === 0 && isActive && (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-text-secondary opacity-30 mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-1">No registrants yet</p>
                <p className="text-xs text-text-secondary opacity-70">
                  {isPastDeadline 
                    ? 'Registration period has ended with no participants' 
                    : 'Be the first to register!'}
                </p>
              </div>
            )}

            {/* All registrants */}
            {registrants && registrants.length > 0 && (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAllRegistrants(!showAllRegistrants)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-medium text-text hover:bg-surface-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-secondary" />
                    All Registrants
                    <span className="text-xs text-text-secondary font-normal">({registrants.length})</span>
                  </span>
                  <span className={`text-xs text-text-secondary transition-transform duration-200 ${showAllRegistrants ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {showAllRegistrants && (
                  <div className="px-5 pb-4 max-h-64 overflow-y-auto space-y-1">
                    {registrants.map((r, i) => (
                      <div 
                        key={r} 
                        className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors duration-200 ${
                          userAddress?.toLowerCase() === r.toLowerCase() 
                            ? 'bg-primary/5 border border-primary/10' 
                            : 'bg-surface-2 hover:bg-surface-2/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-secondary font-mono w-5">{i + 1}</span>
                          <a
                            href={`${EXPLORER_URL}/address/${r}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-text hover:text-primary transition-colors"
                          >
                            {shortAddr(r)}
                          </a>
                          {userAddress?.toLowerCase() === r.toLowerCase() && (
                            <span className="text-xs text-primary font-medium">You</span>
                          )}
                        </div>
                        {isFCFS && isCampaignEnded && (
                          <Trophy className="w-3 h-3 text-yellow-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============ SIDEBAR ============ */}
          <div className="space-y-4">
            {/* Stats card */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary flex items-center gap-1.5">
                  {isRaffle ? <Trophy className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  Mode
                </span>
                <span className="font-medium text-text">{isRaffle ? 'Raffle' : 'First Come First Served'}</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Registrants
                  </span>
                  <span className="font-medium text-text">{registered}/{totalSlots}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                {!isRaffle && slotsRemaining !== undefined && slotsRemaining > 0 && isActive && (
                  <p className="text-xs text-text-secondary mt-1.5">
                    {slotsRemaining} {slotsRemaining === 1 ? 'spot' : 'spots'} remaining
                  </p>
                )}
              </div>

              {/* Winners count di sidebar */}
              {totalWinners > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Winners
                  </span>
                  <span className="font-medium text-yellow-400">{totalWinners}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Deadline
                </span>
                <span className="font-medium text-text text-xs">
                  {isPastDeadline || !isValidDeadline
                    ? 'Ended'
                    : isValidDeadline && deadlineDate
                      ? formatDistanceToNow(deadlineDate, { addSuffix: true })
                      : 'No deadline'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Creator</span>
                <a
                  href={`${EXPLORER_URL}/address/${creatorAddress || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text hover:text-primary transition-colors"
                >
                  {shortAddr(creatorAddress || '')}
                </a>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                !isActive ? 'bg-surface-2 text-text-secondary' :
                isPastDeadline && isRaffle && isActive ? 'bg-warning/10 text-warning border border-warning/20' :
                isCampaignEnded && isFCFS ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                'bg-success/10 text-success border border-success/20'
              }`}>
                {!isActive ? (
                  'Campaign completed'
                ) : isPastDeadline && isRaffle && isActive ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Awaiting raffle draw
                  </>
                ) : isCampaignEnded && isFCFS ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    FCFS — all registered are winners
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Live (accepting registrations)

                  </>
                )}
              </div>
            </div>

            {/* Action card */}
            <div className="bg-surface border border-border rounded-xl p-5">
              {!isConnected ? (
                <div className="text-center py-2">
                  <p className="text-sm text-text-secondary mb-3">Connect your wallet to participate</p>
                  <div className="text-xs text-text-secondary opacity-70 space-y-1">
                    <p>• No wallet? <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get started →</a></p>
                    <p>• Need test tokens? <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Faucet →</a></p>
                  </div>
                </div>
              ) : !isCorrectNetwork ? (
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-3">Wrong network detected</p>
                  <button
                    onClick={switchToLiteForge}
                    className="w-full py-2.5 bg-warning/10 border border-warning/30 text-warning rounded-lg text-sm font-medium hover:bg-warning/20 transition-all duration-200"
                  >
                    Switch to LiteForge
                  </button>
                </div>
              ) : isRegistered ? (
                <div className="text-center py-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isWinner 
                      ? 'bg-yellow-500/10 border border-yellow-500/30' 
                      : 'bg-success/10 border border-success/30'
                  }`}>
                    {isWinner ? (
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-success" />
                    )}
                  </div>
                  <p className={`text-sm font-semibold mb-2 ${isWinner ? 'text-yellow-400' : 'text-success'}`}>
                    {isWinner ? 'You won a spot!' : "You're registered!"}
                  </p>
                  {isWinner && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-400">Winner</span>
                    </div>
                  )}
                  {!isWinner && !isActive && (
                    <p className="text-xs text-text-secondary mt-2">
                      {isRaffle 
                        ? "You weren't selected this time. Better luck next round!"
                        : "Campaign has ended. Check the winners list above."}
                    </p>
                  )}
                </div>
              ) : !isActive ? (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary">This campaign has ended</p>
                  {totalWinners > 0 && (
                    <p className="text-xs text-text-secondary mt-1">
                      {totalWinners} winner{totalWinners !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              ) : isPastDeadline ? (
                <div className="text-center py-4">
                  <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Registration period has ended</p>
                  {isRaffle && (
                    <p className="text-xs text-text-secondary mt-1">Waiting for raffle to be drawn</p>
                  )}
                </div>
              ) : !isRaffle && (slotsRemaining ?? 0) === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary">All slots are filled</p>
                  <p className="text-xs text-text-secondary mt-1">{totalSlots} participants registered</p>
                </div>
              ) : (
                <>
                  {/* Requirements badges */}
                  {reqChecked && hasAnyRequirement && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {info.minTransactions > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isTxRequirementMet 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-error/10 text-error border border-error/20'
                        }`}>
                          TX {isTxRequirementMet ? '✓' : '✗'}
                        </span>
                      )}
                      {info.minWalletAgeDays > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isWalletAgeRequirementMet 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-error/10 text-error border border-error/20'
                        }`}>
                          Age {isWalletAgeRequirementMet ? '✓' : '✗'}
                        </span>
                      )}
                      {hasTokenRequirement && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tokenCheckResult === true 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : tokenCheckDone 
                              ? 'bg-error/10 text-error border border-error/20'
                              : 'bg-warning/10 text-warning border border-warning/20'
                        }`}>
                          Token {tokenCheckResult === true ? '✓' : tokenCheckDone ? '✗' : '?'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Error message */}
                  {writeError && (
                    <div className="mb-3 p-3 bg-error/10 border border-error/20 rounded-lg">
                      <p className="text-xs text-error break-words">
                        {writeError.message.includes('User rejected') 
                          ? 'Transaction was rejected in your wallet' 
                          : writeError.message.includes('insufficient funds')
                            ? 'Insufficient funds for gas. Get test tokens from the faucet.'
                            : writeError.message.slice(0, 120)}
                      </p>
                      {writeError.message.includes('insufficient funds') && (
                        <a 
                          href={FAUCET_URL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Get tokens from faucet →
                        </a>
                      )}
                    </div>
                  )}
                  
                  {isConfirmed ? (
                    <div className="flex items-center justify-center gap-2 text-success text-sm py-2">
                      <CheckCircle className="w-4 h-4" /> Successfully registered!
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={!canRegister || isPending || isConfirming || checking || isVerifying}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        canRegister && !isPending && !isConfirming && !checking && !isVerifying
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer'
                          : 'bg-surface-2 text-text-secondary cursor-not-allowed'
                      }`}
                    >
                      {(isPending || isConfirming || isVerifying || checking) && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {getButtonText()}
                    </button>
                  )}

                  {/* Helpful messages */}
                  {reqChecked && !allRequirementsMet && hasTokenRequirement && !tokenCheckDone && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-warning">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Verify your token balance above to complete all requirements.</span>
                    </div>
                  )}

                  {reqChecked && !allRequirementsMet && tokenCheckDone && (
                    <div className="mt-3 p-2 bg-warning/5 border border-warning/10 rounded-lg">
                      <p className="text-xs text-warning leading-relaxed">
                        Your wallet doesn't meet all requirements.
                        {!isTxRequirementMet && ' Increase your transaction count.'}
                        {!isWalletAgeRequirementMet && ' Wait for your wallet to age.'}
                        {hasTokenRequirement && tokenCheckResult === false && 
                          ` You need ${Number(tokenBalanceRequired) - Number(tokenBalanceUser)} more token(s).`}
                      </p>
                    </div>
                  )}

                  {canRegister && !isRaffle && (slotsRemaining ?? 0) <= 3 && (slotsRemaining ?? 0) > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-warning">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Only {slotsRemaining} {slotsRemaining === 1 ? 'spot' : 'spots'} left! Act fast.</span>
                    </div>
                  )}
                </>
              )}

              {/* Creator: run raffle */}
              {canRunRaffle && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={runRaffle}
                    disabled={isPending || isConfirming}
                    className="w-full py-2.5 bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isPending || isConfirming ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Drawing winners…</>
                    ) : (
                      <><Trophy className="w-4 h-4" /> Draw Raffle Winners</>
                    )}
                  </button>
                  <p className="text-xs text-text-secondary text-center mt-2">
                    Only the campaign creator can draw winners
                  </p>
                </div>
              )}
            </div>

            {/* Contract info */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-text-secondary mb-1.5">Contract Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-text break-all flex-1">{campaignAddr}</p>
                  <button
                    onClick={() => handleCopyAddress(campaignAddr)}
                    className="shrink-0 p-1.5 hover:bg-surface-2 rounded-lg transition-colors"
                    title={copied ? 'Copied!' : 'Copy address'}
                  >
                    {copied ? (
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="text-xs text-text-secondary">
                Created {info.createdAt && info.createdAt > 0
                  ? formatDistanceToNow(new Date(info.createdAt * 1000), { addSuffix: true })
                  : 'recently'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
