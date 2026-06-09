import { create } from 'zustand'

interface WalletStore {
  factoryAddress: string
  setFactoryAddress: (addr: string) => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  factoryAddress: localStorage.getItem('litducks_factory') || '',
  setFactoryAddress: (addr) => {
    localStorage.setItem('litducks_factory', addr)
    set({ factoryAddress: addr })
  },
}))
