// src/abis/factory.ts
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
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_proFee", "type": "uint256" }, { "internalType": "uint256", "name": "_featuredFee", "type": "uint256" }],
    "name": "setFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_max", "type": "uint256" }],
    "name": "setFreeTierMaxSlots",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const

export const FACTORY_ADDRESS = "0xdDC8255958463A7BF7dC19657800201a1f8a00B6"