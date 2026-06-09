import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { liteForge } from './chain'

export const wagmiConfig = createConfig({
  chains: [liteForge],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected(),
  ],
  transports: {
    [liteForge.id]: http('https://liteforge.rpc.caldera.xyz/http'),
  },
})

export const FACTORY_ADDRESS = (import.meta as any).env.VITE_FACTORY_ADDRESS as `0x${string}`;