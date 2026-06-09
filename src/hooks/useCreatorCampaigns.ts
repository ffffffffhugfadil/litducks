import { useReadContract } from 'wagmi'
import { FACTORY_ABI } from '../abis/factory'
import { useWalletStore } from '../store/useWalletStore'

export function useCreatorCampaigns(creator: `0x${string}` | undefined) {
  const { factoryAddress } = useWalletStore()
  const address = factoryAddress as `0x${string}` | undefined

  return useReadContract({
    address,
    abi: FACTORY_ABI,
    functionName: 'getCreatorCampaigns',  // ← ganti dari 'getCampaignsByCreator'
    args: creator ? [creator] : undefined,
    query: { enabled: !!address && !!creator },
  })
}