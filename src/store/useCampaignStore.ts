import { create } from 'zustand'
import type { CreateCampaignForm } from '../types'

const defaultForm: CreateCampaignForm = {
  name: '',
  description: '',
  twitter: '',
  discord: '',
  website: '',
  bannerImage: '',
  totalSlots: 100,
  deadline: null,
  selectionMode: 'FCFS',
  minTransactions: 1,
  minWalletAgeDays: 1,
  requiredToken: '',           
  tokenType: undefined,        
  nftType: undefined,         
  tokenId: '',                 
  minTokenBalance: 1,         
  isPro: false,
  isFeatured: false,
}

interface CampaignStore {
  createForm: CreateCampaignForm
  createStep: number
  setCreateForm: (form: Partial<CreateCampaignForm>) => void
  setCreateStep: (step: number) => void
  resetCreateForm: () => void
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  createForm: { ...defaultForm },
  createStep: 0,
  setCreateForm: (form) =>
    set((state) => ({ createForm: { ...state.createForm, ...form } })),
  setCreateStep: (step) => set({ createStep: step }),
  resetCreateForm: () => set({ createForm: { ...defaultForm }, createStep: 0 }),
}))