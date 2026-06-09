import { defineChain } from 'viem'

export const liteForge = defineChain({
  id: 4441,
  name: 'LitVM LiteForge Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'zkLTC',
    symbol: 'zkLTC',
  },
  rpcUrls: {
    default: {
      http: ['https://liteforge.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LiteForge Explorer',
      url: 'https://liteforge.explorer.caldera.xyz',
    },
  },
  testnet: true,
})

export const EXPLORER_URL = 'https://liteforge.explorer.caldera.xyz'
export const FAUCET_URL = 'https://liteforge.hub.caldera.xyz'
export const CHAIN_ID = 4441
