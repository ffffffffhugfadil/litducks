// src/hooks/useCampaign.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CAMPAIGN_ABI } from '../config/contracts'

export interface CampaignInfo {
  address: string;
  name: string;
  description: string;
  bannerImage: string;
  creator: string;
  totalSlots: number;
  registrantCount: number;
  slotsRemaining: number;
  deadline: number;
  createdAt: number;
  selectionMode: number;
  isActive: boolean;
  isPro: boolean;
  isFeatured: boolean;
  raffleRun: boolean;
  winnerCount: number;
  merkleRoot: string;
  minTransactions: number;
  minWalletAgeDays: number;
  requiredToken: string;
  tokenType: number;
  minTokenBalance: number;
  tokenId: number;
  twitter: string;
  discord: string;
  website: string;
}

export function useCampaign(address: `0x${string}` | undefined) {
  const enabled = !!address && address !== "0x0000000000000000000000000000000000000000"

  // ============ READ CONTRACTS - PARAMS ============
  const { data: rawInfo, isLoading: loadingInfo, refetch: refetchInfo } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'getParams',
    query: { enabled },
  })

  // ============ READ CONTRACTS - LISTS ============
  const { data: registrants, isLoading: loadingRegistrants, refetch: refetchRegistrants } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'getRegistrants',
    query: { enabled },
  })

  const { data: winners, refetch: refetchWinners } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'getWinners',
    query: { enabled },
  })

  // ============ READ CONTRACTS - COUNTS & STATUS ============
  const { data: registrantCount, refetch: refetchCount } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'registrantCount',
    query: { enabled },
  })

  const { data: winnerCount, refetch: refetchWinnerCount } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'winnerCount',
    query: { enabled },
  })

  const { data: isActive, refetch: refetchActive } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'isActive',
    query: { enabled },
  })

  const { data: slotsRemaining, refetch: refetchSlots } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'slotsRemaining',
    query: { enabled },
  })

  // ============ READ CONTRACTS - METADATA ============
  const { data: creator, refetch: refetchCreator } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'creator',
    query: { enabled },
  })

  const { data: createdAt, refetch: refetchCreatedAt } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'createdAt',
    query: { enabled },
  })

  const { data: deadline, refetch: refetchDeadline } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'deadline',
    query: { enabled },
  })

  const { data: totalSlots, refetch: refetchTotalSlots } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'totalSlots',
    query: { enabled },
  })

  const { data: raffleRun, refetch: refetchRaffleRun } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'raffleRun',
    query: { enabled },
  })

  const { data: merkleRoot, refetch: refetchMerkleRoot } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'merkleRoot',
    query: { enabled },
  })

  const { data: selectionMode, refetch: refetchSelectionMode } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'selectionMode',
    query: { enabled },
  })

  // ============ READ CONTRACTS - REQUIREMENTS ============
  const { data: minTransactions, refetch: refetchMinTransactions } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'minTransactions',
    query: { enabled },
  })

  const { data: minWalletAgeDays, refetch: refetchMinWalletAgeDays } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'minWalletAgeDays',
    query: { enabled },
  })

  const { data: requiredToken, refetch: refetchRequiredToken } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'requiredToken',
    query: { enabled },
  })

  const { data: tokenType, refetch: refetchTokenType } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'tokenType',
    query: { enabled },
  })

  const { data: minTokenBalance, refetch: refetchMinTokenBalance } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'minTokenBalance',
    query: { enabled },
  })

  const { data: tokenId, refetch: refetchTokenId } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'tokenId',
    query: { enabled },
  })

  // ============ READ CONTRACTS - SOCIAL ============
  const { data: twitter, refetch: refetchTwitter } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'twitter',
    query: { enabled },
  })

  const { data: discord, refetch: refetchDiscord } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'discord',
    query: { enabled },
  })

  const { data: website, refetch: refetchWebsite } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'website',
    query: { enabled },
  })

  // ============ READ CONTRACTS - BASIC INFO ============
  const { data: name, refetch: refetchName } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'name',
    query: { enabled },
  })

  const { data: description, refetch: refetchDescription } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'description',
    query: { enabled },
  })

  const { data: bannerImage, refetch: refetchBannerImage } = useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'bannerImage',
    query: { enabled },
  })

  // ============ WRITE CONTRACTS ============
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  const register = () => {
    if (!address) return
    writeContract({ address, abi: CAMPAIGN_ABI, functionName: 'register' })
  }

  const runRaffle = () => {
    if (!address) return
    const emptyMerkle = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`
    writeContract({ 
      address, 
      abi: CAMPAIGN_ABI, 
      functionName: 'runRaffle',
      args: [emptyMerkle]
    })
  }

  const setMerkleRoot = (root: `0x${string}`) => {
    if (!address) return
    writeContract({
      address,
      abi: CAMPAIGN_ABI,
      functionName: 'setMerkleRoot',
      args: [root]
    })
  }

  // ============ REFETCH ALL ============
  const refetchAll = () => {
    refetchInfo()
    refetchRegistrants()
    refetchWinners()
    refetchCount()
    refetchWinnerCount()
    refetchActive()
    refetchSlots()
    refetchCreator()
    refetchCreatedAt()
    refetchDeadline()
    refetchTotalSlots()
    refetchRaffleRun()
    refetchMerkleRoot()
    refetchSelectionMode()
    refetchMinTransactions()
    refetchMinWalletAgeDays()
    refetchRequiredToken()
    refetchTokenType()
    refetchMinTokenBalance()
    refetchTokenId()
    refetchTwitter()
    refetchDiscord()
    refetchWebsite()
    refetchName()
    refetchDescription()
    refetchBannerImage()
  }

  // ============ BUILD INFO OBJECT ============
  const info: CampaignInfo | undefined = enabled && name !== undefined
    ? {
        address: address as string,
        name: (name as string) || "Untitled",
        description: (description as string) || "",
        bannerImage: (bannerImage as string) || "",
        creator: (creator as string) || "",
        totalSlots: Number(totalSlots ?? 0),
        registrantCount: Number(registrantCount ?? 0),
        slotsRemaining: Number(slotsRemaining ?? 0),
        deadline: Number(deadline ?? 0),
        createdAt: Number(createdAt ?? 0),
        selectionMode: Number(selectionMode ?? 0),
        isActive: isActive ?? false,
        isPro: false,
        isFeatured: false,
        raffleRun: raffleRun ?? false,
        winnerCount: Number(winnerCount ?? 0),
        merkleRoot: (merkleRoot as string) || "0x0000000000000000000000000000000000000000000000000000000000000000",
        minTransactions: Number(minTransactions ?? 0),
        minWalletAgeDays: Number(minWalletAgeDays ?? 0),
        requiredToken: (requiredToken as string) || "0x0000000000000000000000000000000000000000",
        tokenType: Number(tokenType ?? 0),
        minTokenBalance: Number(minTokenBalance ?? 0),
        tokenId: Number(tokenId ?? 0),
        twitter: (twitter as string) || "",
        discord: (discord as string) || "",
        website: (website as string) || "",
      }
    : undefined

  // ============ RETURN ============
  return {
    info,
    registrants: registrants as `0x${string}`[] | undefined,
    winners: winners as `0x${string}`[] | undefined,
    registrantCount: Number(registrantCount ?? 0),
    winnerCount: Number(winnerCount ?? 0),
    isActive: isActive ?? false,
    slotsRemaining: Number(slotsRemaining ?? 0),
    raffleRun: raffleRun ?? false,
    merkleRoot: merkleRoot as string | undefined,
    creator: creator as `0x${string}` | undefined,
    createdAt: createdAt as bigint | undefined,
    deadline: deadline as bigint | undefined,
    totalSlots: totalSlots as bigint | undefined,
    selectionMode: Number(selectionMode ?? 0),
    loadingInfo: loadingInfo || !enabled,
    loadingRegistrants,
    register,
    runRaffle,
    setMerkleRoot,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    reset,
    refetchAll,
  }
}

// ============ HELPER HOOKS ============
export function useCampaignRegistered(address: `0x${string}` | undefined, wallet: `0x${string}` | undefined) {
  const enabled = !!address && !!wallet && address !== "0x0000000000000000000000000000000000000000"
  
  return useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'isRegistered',
    args: wallet ? [wallet] : undefined,
    query: { enabled },
  })
}

export function useCampaignIsWinner(address: `0x${string}` | undefined, wallet: `0x${string}` | undefined) {
  const enabled = !!address && !!wallet && address !== "0x0000000000000000000000000000000000000000"
  
  return useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'isWinner',
    args: wallet ? [wallet] : undefined,
    query: { enabled },
  })
}

export function useCampaignRegisteredAt(address: `0x${string}` | undefined, wallet: `0x${string}` | undefined) {
  const enabled = !!address && !!wallet && address !== "0x0000000000000000000000000000000000000000"
  
  return useReadContract({
    address: enabled ? address : undefined,
    abi: CAMPAIGN_ABI,
    functionName: 'registeredAt',
    args: wallet ? [wallet] : undefined,
    query: { enabled },
  })
}