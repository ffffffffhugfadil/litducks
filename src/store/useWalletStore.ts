import { create } from 'zustand'
import { persist } from 'zustand/middleware'


const DEFAULT_FACTORY_ADDRESS = "0xdDC8255958463A7BF7dC19657800201a1f8a00B6"

interface WalletStore {
  factoryAddress: string
  setFactoryAddress: (addr: string) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      factoryAddress: DEFAULT_FACTORY_ADDRESS,
      setFactoryAddress: (addr) => set({ factoryAddress: addr }),
    }),
    {
      name: 'wallet-storage',
    }
  )
)
