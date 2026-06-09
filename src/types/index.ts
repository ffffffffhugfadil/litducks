// src/types/index.ts

export interface CampaignInfo {
  name: string
  description: string
  twitter: string
  discord: string
  website: string
  bannerImage: string
  totalSlots: bigint
  deadline: bigint
  selectionMode: number        // 0 = FCFS, 1 = Raffle
  minTransactions: bigint
  minWalletAgeDays: bigint
  requiredToken: string        // address token yang di-require
  tokenType: number            // 0=ERC20, 1=ERC721, 2=ERC1155
  minTokenBalance: bigint
  tokenId: bigint
  isPro: boolean
  isFeatured: boolean
  creatorAddress: `0x${string}`
  createdAt: bigint
}

export interface CampaignStatus {
  registrantCount: bigint
  winnerCount: bigint
  isActive: boolean
  slotsRemaining: bigint
  raffleRun: boolean
  merkleRoot: string
}

export interface Registrant {
  wallet: `0x${string}`
  registeredAt: bigint
  isWinner: boolean
  slotNumber?: bigint
}

export interface Campaign {
  address: `0x${string}`
  info: CampaignInfo
  status: CampaignStatus
}

export interface RequirementCheck {
  txCount: boolean
  walletAge: boolean
  tokenBalance: boolean           
  allPassed: boolean
  details: {
    txCount: number
    walletAgeDays: number
    tokenBalance: number          
    requiredTokenBalance?: number 
  }
}

export type SelectionMode = 'FCFS' | 'Raffle'

// ✅ TAMBAHKAN nftType DI SINI
export interface CreateCampaignForm {
  name: string
  description: string
  twitter: string
  discord: string
  website: string
  bannerImage: string
  totalSlots: number
  deadline: Date | null
  selectionMode: SelectionMode
  minTransactions: number
  minWalletAgeDays: number
  requiredToken: string           
  tokenType?: 'ERC20' | 'ERC721' | 'ERC1155'
  nftType?: 'collection' | 'single'  // ✅ TAMBAHKAN FIELD INI
  tokenId?: string                              
  minTokenBalance: number          
  isPro: boolean
  isFeatured: boolean
}

export function formToCampaignParams(form: CreateCampaignForm, walletAddress: `0x${string}`): any {
  let tokenTypeNum = 0
  if (form.tokenType === 'ERC721') tokenTypeNum = 1
  if (form.tokenType === 'ERC1155') tokenTypeNum = 2
  
  const tokenIdBig = form.tokenId ? BigInt(form.tokenId) : 0n
  
  return {
    name: form.name,
    description: form.description,
    bannerImage: form.bannerImage || "",
    twitter: form.twitter || "",
    discord: form.discord || "",
    website: form.website || "",
    totalSlots: BigInt(form.totalSlots),
    deadline: BigInt(form.deadline ? Math.floor(form.deadline.getTime() / 1000) : 0),
    selectionMode: form.selectionMode === 'FCFS' ? 0 : 1,
    minTransactions: BigInt(form.minTransactions || 0),
    minWalletAgeDays: BigInt(form.minWalletAgeDays || 0),
    requiredToken: (form.requiredToken as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    tokenType: tokenTypeNum,
    minTokenBalance: BigInt(form.minTokenBalance || 0),
    tokenId: tokenIdBig,
    isPro: form.isPro,
    isFeatured: form.isFeatured,
  }
}