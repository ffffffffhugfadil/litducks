// src/pages/Campaign.tsx
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useEffect, useState, useRef } from 'react'
import {
  Calendar, Users, Globe, Twitter, MessageSquare, ExternalLink,
  Trophy, Zap, CheckCircle, XCircle, Loader2, AlertTriangle, Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
  const { data: isWinner } = useCampaignIsWinner(campaignAddr, userAddress)

  const { checking, checkingStep, result: reqResult, checkRequirements } = useRequirements()

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
      requiredToken: info.requiredToken,
      tokenType: info.tokenType,
      minTokenBalance: info.minTokenBalance,
      tokenId: info.tokenId,
    }
    
    checkRequirements(userAddress, requirementsInfo).then(() => {
      setReqChecked(true)
    })
  }, [userAddress, info, isCorrectNetwork, checkRequirements])

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

  // ============ VALIDATION ============
  if (!campaignAddr || !isAddress(campaignAddr)) {
    return (
      <div className="pt-24 text-center text-text-secondary">
        Invalid campaign address
      </div>
    )
  }

  if (loadingInfo) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="pt-24 text-center text-text-secondary">
        Campaign not found or failed to load.
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
  const totalSlots = info.totalSlots ?? 0
  const registered = registrantCount ?? 0
  const fillPct = totalSlots > 0 ? Math.min(100, (registered / totalSlots) * 100) : 0

  // ============ PERBAIKAN BUG 0/0/0 ============
  const isTxRequirementMet = (info.minTransactions === 0) || (reqResult?.txCount === true)
  const isWalletAgeRequirementMet = (info.minWalletAgeDays === 0) || (reqResult?.walletAge === true)
  const isTokenRequirementMet = !info.requiredToken || 
    info.requiredToken === '0x0000000000000000000000000000000000000000' ||
    (reqResult?.tokenBalance === true)

  const hasAnyRequirement = (info.minTransactions > 0) || 
    (info.minWalletAgeDays > 0) || 
    (info.requiredToken && info.requiredToken !== '0x0000000000000000000000000000000000000000')

  const allRequirementsMet = !hasAnyRequirement || (isTxRequirementMet && isWalletAgeRequirementMet && isTokenRequirementMet)

  console.log("🔍 Requirement Check:", {
    minTx: info.minTransactions,
    minWalletAge: info.minWalletAgeDays,
    requiredToken: info.requiredToken,
    hasAnyRequirement,
    txMet: isTxRequirementMet,
    walletMet: isWalletAgeRequirementMet,
    tokenMet: isTokenRequirementMet,
    allRequirementsMet
  })

  const canRegister = isConnected && isCorrectNetwork && !isRegistered && isActive
    && !isPastDeadline && reqChecked && allRequirementsMet
    && (isRaffle || (slotsRemaining ?? 0) > 0) && !isVerifying

  const canRunRaffle = isConnected && userAddress?.toLowerCase() === creatorAddress?.toLowerCase()
    && isRaffle && isPastDeadline && isActive && !info.raffleRun

  const getTokenRequirementLabel = () => {
    if (!info.requiredToken || info.requiredToken === '0x0000000000000000000000000000000000000000') return null
    
    const minBalance = info.minTokenBalance?.toString() ?? '1'
    const tokenIdValue = info.tokenId?.toString() ?? '0'
    
    if (info.tokenType === 1) {
      return `Hold at least ${minBalance} token(s) from this contract`
    }
    if (info.tokenType === 2) {
      if (tokenIdValue !== '0') {
        return `Own specific NFT (Token ID: ${tokenIdValue})`
      }
      return `Hold at least ${minBalance} NFT(s) from this collection`
    }
    return `Hold token from ${shortAddr(info.requiredToken)}`
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Banner with IPFS support */}
        <div className="h-48 rounded-2xl overflow-hidden bg-surface-2 mb-6 relative">
          {info.bannerImage ? (
            <img 
              src={ipfsToUrl(info.bannerImage)}
              alt={info.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.log('Gambar gagal load:', info.bannerImage)
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            {info.isFeatured && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            {info.isPro && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary">
                Pro
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ MAIN CONTENT ============ */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-text mb-2">{info.name || 'Untitled'}</h1>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-2 rounded-lg text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" /> {info.twitter}
                  </a>
                )}
                {info.discord && (
                  <a
                    href={info.discord.startsWith('http') ? info.discord : `https://discord.gg/${info.discord}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-2 rounded-lg text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Discord
                  </a>
                )}
                {info.website && (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-2 rounded-lg text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                <a
                  href={`${EXPLORER_URL}/address/${campaignAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-border-2 rounded-lg text-xs text-text-secondary hover:text-text transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Contract
                </a>
              </div>
            </div>

            {/* Requirements - Step by Step */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-semibold text-text mb-4 text-sm">Requirements</h3>
              <div className="space-y-3">
                {/* Step 1: Min Transactions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {checking && checkingStep === 'tx' ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : reqResult?.txCount === true ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : reqResult?.txCount === false ? (
                      <XCircle className="w-4 h-4 text-error" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border" />
                    )}
                    <span className="text-sm text-text">
                      Min {info.minTransactions ?? 0} transaction(s)
                    </span>
                  </div>
                  {reqResult && !checking && (
                    <span className={`text-xs ${reqResult.txCount ? 'text-success' : 'text-error'}`}>
                      You have {reqResult.details?.txCount ?? 0} txs
                    </span>
                  )}
                </div>

                {/* Step 2: Min Wallet Age */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {checking && checkingStep === 'wallet' ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : reqResult?.walletAge === true ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : reqResult?.walletAge === false ? (
                      <XCircle className="w-4 h-4 text-error" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border" />
                    )}
                    <span className="text-sm text-text">
                      Wallet age ≥ {info.minWalletAgeDays ?? 0} day(s)
                    </span>
                  </div>
                  {reqResult && !checking && (
                    <span className={`text-xs ${reqResult.walletAge ? 'text-success' : 'text-error'}`}>
                      {reqResult.details?.walletAgeDays ?? 0} days old
                    </span>
                  )}
                </div>

                {/* Step 3: Token Requirement */}
                {info.requiredToken && info.requiredToken !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {checking && checkingStep === 'token' ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : reqResult?.tokenBalance === true ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : reqResult?.tokenBalance === false ? (
                        <XCircle className="w-4 h-4 text-error" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border" />
                      )}
                      <span className="text-sm text-text">{getTokenRequirementLabel()}</span>
                    </div>
                    {reqResult && !checking && (
                      <span className={`text-xs ${reqResult.tokenBalance ? 'text-success' : 'text-error'}`}>
                        Balance: {reqResult.details?.tokenBalance ?? 0} / {info.minTokenBalance ?? 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Winners Panel */}
            {!isActive && winners && winners.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text text-sm">Winners ({winners.length})</h3>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {winners.map((w, i) => (
                    <div key={w} className="flex items-center justify-between py-1.5 px-3 bg-surface-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary w-5">{i + 1}.</span>
                        <a
                          href={`${EXPLORER_URL}/address/${w}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-text hover:text-primary transition-colors"
                        >
                          {shortAddr(w)}
                          {userAddress?.toLowerCase() === w.toLowerCase() && (
                            <span className="ml-2 text-success">(You)</span>
                          )}
                        </a>
                      </div>
                      <Trophy className="w-3 h-3 text-warning" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All registrants */}
            {registrants && registrants.length > 0 && (
              <details className="bg-surface border border-border rounded-xl overflow-hidden">
                <summary className="px-5 py-3.5 cursor-pointer text-sm font-medium text-text hover:bg-surface-2 transition-colors">
                  All Registrants ({registrants.length})
                </summary>
                <div className="px-5 pb-4 max-h-64 overflow-y-auto space-y-1.5">
                  {registrants.map((r, i) => (
                    <div key={r} className="flex items-center justify-between py-1.5 px-3 bg-surface-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary w-5">{i + 1}</span>
                        <a
                          href={`${EXPLORER_URL}/address/${r}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-text hover:text-primary"
                        >
                          {shortAddr(r)}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
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
                <span className="font-medium text-text">{isRaffle ? 'Raffle' : 'FCFS'}</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Registrants
                  </span>
                  <span className="font-medium text-text">{registered} / {totalSlots}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

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

              {/* Status */}
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                !isActive ? 'bg-surface-2 text-text-secondary' :
                isPastDeadline && isRaffle && isActive ? 'bg-warning/10 text-warning border border-warning/20' :
                'bg-success/10 text-success border border-success/20'
              }`}>
                {!isActive ? 'Campaign completed' :
                 isPastDeadline && isRaffle && isActive ? 'Awaiting raffle draw' :
                 <><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live</>}
              </div>
            </div>

            {/* Action card */}
            <div className="bg-surface border border-border rounded-xl p-5">
              {!isConnected ? (
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-3">Connect wallet to register</p>
                  <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Get zkLTC from faucet →
                  </a>
                </div>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={switchToLiteForge}
                  className="w-full py-2.5 bg-warning/10 border border-warning/30 text-warning rounded-lg text-sm font-medium hover:bg-warning/20 transition-colors"
                >
                  Switch to LiteForge
                </button>
              ) : isRegistered ? (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-sm font-medium text-success mb-1">Registered!</p>
                  {isWinner && (
                    <p className="text-xs text-warning flex items-center justify-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> You won a WL spot!
                    </p>
                  )}
                  {!isWinner && !isActive && (
                    <p className="text-xs text-text-secondary">Better luck next time</p>
                  )}
                </div>
              ) : !isActive ? (
                <p className="text-sm text-center text-text-secondary">Campaign is completed</p>
              ) : isPastDeadline ? (
                <p className="text-sm text-center text-text-secondary">Registration deadline passed</p>
              ) : !isRaffle && (slotsRemaining ?? 0) === 0 ? (
                <p className="text-sm text-center text-text-secondary">All slots filled</p>
              ) : (
                <>
                  {/* ✅ ERROR MESSAGE DENGAN BREAK WORDS - DIPERBAIKI */}
                  {writeError && (
                    <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg">
                      <p className="text-xs text-error break-words whitespace-normal">
                        {writeError.message.includes('User rejected') 
                          ? '⚠️ Transaction rejected in wallet' 
                          : writeError.message.includes('insufficient funds')
                            ? '⚠️ Insufficient funds for gas'
                            : writeError.message.slice(0, 100)}
                      </p>
                    </div>
                  )}
                  
                  {isConfirmed ? (
                    <div className="flex items-center justify-center gap-2 text-success text-sm">
                      <CheckCircle className="w-4 h-4" /> Registered successfully!
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={!canRegister || isPending || isConfirming || checking || isVerifying}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        canRegister && !isPending && !isConfirming && !checking && !isVerifying
                          ? 'bg-primary hover:bg-primary-dark text-white cursor-pointer'
                          : 'bg-surface-2 text-text-secondary cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isPending ? 'Confirm in wallet…' : 'Registering…'}
                        </>
                      ) : checking || isVerifying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {isVerifying ? 'Verifying requirements…' : 'Checking requirements…'}</>
                      ) : !reqChecked ? (
                        'Loading…'
                      ) : !canRegister ? (
                        'Requirements not met'
                      ) : (
                        'Register for Whitelist'
                      )}
                    </button>
                  )}

                  {reqChecked && !allRequirementsMet && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-warning">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Your wallet does not meet all requirements for this campaign.</span>
                    </div>
                  )}
                </>
              )}

              {/* Creator: run raffle */}
              {canRunRaffle && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    onClick={runRaffle}
                    disabled={isPending || isConfirming}
                    className="w-full py-2.5 bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isPending || isConfirming ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                    ) : (
                      <><Trophy className="w-4 h-4" /> Run Raffle</>
                    )}
                  </button>
                  <p className="text-xs text-text-secondary text-center mt-1.5">Creator action</p>
                </div>
              )}
            </div>

            {/* Contract info */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-secondary mb-1.5">Contract Address</p>
              <p className="font-mono text-xs text-text break-all">{campaignAddr}</p>
              <p className="text-xs text-text-secondary mt-2">
                Created {info.createdAt && info.createdAt > 0
                  ? formatDistanceToNow(new Date(info.createdAt * 1000), { addSuffix: true })
                  : 'recently'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}