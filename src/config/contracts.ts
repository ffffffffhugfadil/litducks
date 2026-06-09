// src/config/contracts.ts

export const FACTORY_ADDRESS = "0xdDC8255958463A7BF7dC19657800201a1f8a00B6";

// ============================================
// FACTORY ABI
// ============================================
export const FACTORY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "campaignAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isPro",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isFeatured",
        "type": "bool"
      }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "bannerImage", "type": "string" },
          { "internalType": "string", "name": "twitter", "type": "string" },
          { "internalType": "string", "name": "discord", "type": "string" },
          { "internalType": "string", "name": "website", "type": "string" },
          { "internalType": "uint256", "name": "totalSlots", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "uint8", "name": "selectionMode", "type": "uint8" },
          { "internalType": "uint256", "name": "minTransactions", "type": "uint256" },
          { "internalType": "uint256", "name": "minWalletAgeDays", "type": "uint256" },
          { "internalType": "address", "name": "requiredToken", "type": "address" },
          { "internalType": "uint8", "name": "tokenType", "type": "uint8" },
          { "internalType": "uint256", "name": "minTokenBalance", "type": "uint256" },
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "bool", "name": "isPro", "type": "bool" },
          { "internalType": "bool", "name": "isFeatured", "type": "bool" }
        ],
        "internalType": "struct LitDucksCampaign.CampaignParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createCampaign",
    "outputs": [{ "internalType": "address", "name": "campaignAddress", "type": "address" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCampaigns",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "creator", "type": "address" }],
    "name": "getCreatorCampaigns",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFeaturedCampaigns",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaignsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "featuredFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freeTierMaxSlots",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "isFeaturedCampaign",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factoryOwner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ============================================
// CAMPAIGN ABI
// ============================================
export const CAMPAIGN_ABI = [
  { "inputs": [], "name": "name", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "description", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "bannerImage", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "twitter", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "discord", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "website", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "creator", "outputs": [{ "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSlots", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "deadline", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "createdAt", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "registrantCount", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "slotsRemaining", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "selectionMode", "outputs": [{ "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isActive", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isPro", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isFeatured", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "raffleRun", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "merkleRoot", "outputs": [{ "type": "bytes32" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "winnerCount", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "minTransactions", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "minWalletAgeDays", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "requiredToken", "outputs": [{ "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "tokenType", "outputs": [{ "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "minTokenBalance", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "tokenId", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "a", "type": "address" }], "name": "isRegistered", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "a", "type": "address" }], "name": "isWinner", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "a", "type": "address" }], "name": "registeredAt", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getRegistrants", "outputs": [{ "type": "address[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getWinners", "outputs": [{ "type": "address[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getParams", "outputs": [{ "components": [{ "type": "string" }, { "type": "string" }, { "type": "string" }, { "type": "string" }, { "type": "string" }, { "type": "string" }, { "type": "uint256" }, { "type": "uint256" }, { "type": "uint8" }, { "type": "uint256" }, { "type": "uint256" }, { "type": "address" }, { "type": "uint8" }, { "type": "uint256" }, { "type": "uint256" }, { "type": "bool" }, { "type": "bool" }], "type": "tuple" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "register", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "merkleRoot_", "type": "bytes32" }], "name": "runRaffle", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "root", "type": "bytes32" }], "name": "setMerkleRoot", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "newDeadline", "type": "uint256" }], "name": "extendDeadline", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "bannerImage_", "type": "string" }, { "name": "twitter_", "type": "string" }, { "name": "discord_", "type": "string" }, { "name": "website_", "type": "string" }], "name": "setMetadata", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface CampaignParams {
  name: string;
  description: string;
  bannerImage: string;
  twitter: string;
  discord: string;
  website: string;
  totalSlots: bigint;
  deadline: bigint;
  selectionMode: number;
  minTransactions: bigint;
  minWalletAgeDays: bigint;
  requiredToken: string;
  tokenType: number;
  minTokenBalance: bigint;
  tokenId: bigint;
  isPro: boolean;
  isFeatured: boolean;
}

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
}