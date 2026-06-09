import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, isAddress, zeroAddress } from 'viem'
import { FACTORY_ABI } from '../abis/factory'
import { useWalletStore } from '../store/useWalletStore'
import type { CreateCampaignForm } from '../types'

export function useFactory() {
  const { factoryAddress } = useWalletStore()
  const address = factoryAddress as `0x${string}` | undefined

  // Hanya fungsi yang ADA di ABI
  const { data: allCampaigns, isLoading: loadingCampaigns, refetch: refetchAll } = useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'getAllCampaigns',
    query: { enabled: !!address },
  })

  const { data: proFee } = useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'proFee',
    query: { enabled: !!address },
  })

  const { data: featuredFee } = useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'featuredFee',
    query: { enabled: !!address },
  })

  const { data: freeTierMaxSlots } = useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'freeTierMaxSlots',
    query: { enabled: !!address },
  })

  const { data: campaignsCount } = useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'getCampaignsCount',
    query: { enabled: !!address },
  })

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  const createCampaign = (form: CreateCampaignForm) => {
    if (!address) {
      console.error('❌ Factory address not set')
      alert('Factory address not configured. Please set it first.')
      return
    }

    if (!form.deadline) {
      alert('Please select a deadline date')
      return
    }

    const deadlineTimestamp = Math.floor(form.deadline.getTime() / 1000)
    const now = Math.floor(Date.now() / 1000)
    
    if (deadlineTimestamp <= now) {
      alert('Deadline must be in the future')
      return
    }

    const deadline = BigInt(deadlineTimestamp)
    const selectionMode = form.selectionMode === 'FCFS' ? 0 : 1
    
    let requiredToken: `0x${string}` = zeroAddress
    if (form.requiredToken && isAddress(form.requiredToken)) {
      requiredToken = form.requiredToken as `0x${string}`
    }

    const minTransactions = BigInt(Math.max(1, form.minTransactions || 1))
    const minWalletAgeDays = BigInt(Math.max(1, form.minWalletAgeDays || 1))
    const minTokenBalance = BigInt(form.minTokenBalance || 1)
    const tokenType = form.tokenType === 'ERC20' ? 1 : form.tokenType === 'ERC721' ? 2 : form.tokenType === 'ERC1155' ? 3 : 0
    const tokenId = BigInt(form.tokenId || 0)

    const freeMaxSlots = freeTierMaxSlots ? Number(freeTierMaxSlots) : 100
    const isPro = form.isPro || form.totalSlots > freeMaxSlots
    
    let value = BigInt(0)
    if (isPro && proFee) {
      value += proFee
    }
    if (form.isFeatured && featuredFee) {
      value += featuredFee
    }

    console.log('🚀 Creating campaign:', {
      name: form.name,
      totalSlots: form.totalSlots,
      requiredToken,
      tokenType,
      minTokenBalance: minTokenBalance.toString(),
      tokenId: tokenId.toString(),
      isPro,
      isFeatured: form.isFeatured,
      value: value.toString(),
    })

    // ========== TAMBAHKAN GAS LIMIT MANUAL DI SINI ==========
    writeContract({
      address,
      abi: FACTORY_ABI,
      functionName: 'createCampaign',
      args: [{
        name: form.name,
        description: form.description || '',
        twitter: form.twitter || '',
        discord: form.discord || '',
        website: form.website || '',
        bannerImage: form.bannerImage || '',
        totalSlots: BigInt(form.totalSlots),
        deadline: deadline,
        selectionMode: selectionMode,
        minTransactions: minTransactions,
        minWalletAgeDays: minWalletAgeDays,
        requiredToken: requiredToken,
        tokenType: tokenType,
        minTokenBalance: minTokenBalance,
        tokenId: tokenId,
        isPro: isPro,
        isFeatured: form.isFeatured,
      }],
      value,
      gas: 3000000n,  // ← TAMBAHKAN INI (3.000.000 gas limit manual)
    })
  }

  // Untuk mendapatkan campaign berdasarkan creator, panggil langsung dari komponen
  const getCreatorCampaigns = (creator: `0x${string}`) => {
    return useReadContract({
      address,
      abi: FACTORY_ABI,
      functionName: 'getCreatorCampaigns',
      args: [creator],
      query: { enabled: !!address && !!creator },
    })
  }

  return {
    allCampaigns: allCampaigns as `0x${string}`[] | undefined,
    campaignsCount,
    proFee,
    featuredFee,
    freeTierMaxSlots,
    loadingCampaigns,
    createCampaign,
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    reset,
    refetchAll,
    getCreatorCampaigns,
  }
}