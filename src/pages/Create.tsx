import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { useFactory } from '../hooks/useFactory'
import { useWalletStore } from '../store/useWalletStore'
import NetworkGuard from '../components/wallet/NetworkGuard'
import Step1 from '../components/create/Step1'
import Step2 from '../components/create/Step2'
import Step3 from '../components/create/Step3'
import Step4 from '../components/create/Step4'
import FactoryAddressInput from '../components/ui/FactoryAddressInput'
import { isAddress } from 'viem'

const STEPS = [
  { label: 'Project Info' },
  { label: 'WL Settings' },
  { label: 'Requirements' },
  { label: 'Deploy' },
]

function validate(step: number, form: ReturnType<typeof useCampaignStore.getState>['createForm']) {
  // Step 1: Project Info
  if (step === 0) {
    return form.name.trim().length > 0
  }
  
  // Step 2: WL Settings
  if (step === 1) {
    return form.totalSlots > 0 && form.deadline !== null
  }
  
  // Step 3: Requirements
  if (step === 2) {
    // Jika tidak ada contract address (opsional), boleh lanjut
    if (!form.requiredToken || !form.requiredToken.trim()) {
      return true
    }
    
    // Jika ada contract address tapi tidak valid, jangan lanjut
    if (!isAddress(form.requiredToken)) {
      return false
    }
    
    // Jika contract address valid tapi belum pilih tokenType, jangan lanjut
    if (!form.tokenType) {
      return false
    }
    
    // Validasi berdasarkan tokenType yang dipilih
    if (form.tokenType === 'ERC20') {
      // ERC-20: minTokenBalance harus ≥ 1
      return (form.minTokenBalance || 1) >= 1
    }
    
    if (form.tokenType === 'ERC721') {
      if (form.nftType === 'collection') {
        // Collection NFT: minTokenBalance harus ≥ 1
        return (form.minTokenBalance || 1) >= 1
      }
      if (form.nftType === 'single') {
        // Single NFT: tokenId harus diisi
        return form.tokenId && form.tokenId.trim().length > 0
      }
      // Sudah pilih tokenType ERC721 tapi belum pilih nftType
      return false
    }
    
    if (form.tokenType === 'ERC1155') {
      if (form.nftType === 'collection') {
        // Collection: minTokenBalance harus ≥ 1
        return (form.minTokenBalance || 1) >= 1
      }
      if (form.nftType === 'single') {
        // Single: tokenId harus diisi DAN minTokenBalance ≥ 1
        return (form.tokenId && form.tokenId.trim().length > 0) && (form.minTokenBalance || 1) >= 1
      }
      // Sudah pilih tokenType ERC1155 tapi belum pilih nftType
      return false
    }
    
    // Jika tokenType tidak dikenal
    return false
  }
  
  // Step 4: Deploy (selalu true, karena validasi sudah di tombol deploy)
  return true
}

export default function Create() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { createForm, createStep, setCreateForm, setCreateStep, resetCreateForm } = useCampaignStore()
  const { factoryAddress } = useWalletStore()
  const {
    createCampaign,
    proFee,
    featuredFee,
    isWritePending,
    isConfirming,
    isConfirmed,
    txHash,
    writeError,
  } = useFactory()

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        resetCreateForm()
        navigate('/dashboard')
      }, 2000)
    }
  }, [isConfirmed])

  const canNext = validate(createStep, createForm)

  const handleDeploy = () => {
    createCampaign(createForm)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-1">Create Whitelist Campaign</h1>
          <p className="text-text-secondary text-sm">Deploy an on-chain WL campaign to LiteForge testnet</p>
        </div>

        <NetworkGuard>
          {/* Factory address */}
          {!factoryAddress && (
            <div className="mb-6 p-4 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-sm font-medium text-warning mb-2">Set factory address first</p>
              <FactoryAddressInput />
            </div>
          )}

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-2 ${i <= createStep ? 'text-primary' : 'text-text-secondary'}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < createStep
                      ? 'border-primary bg-primary text-white'
                      : i === createStep
                      ? 'border-primary text-primary'
                      : 'border-border text-text-secondary'
                  }`}>
                    {i < createStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${i === createStep ? 'text-text' : 'text-text-secondary'}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 ${i < createStep ? 'bg-primary' : 'bg-border'} transition-colors`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-semibold text-text">{STEPS[createStep].label}</h2>
            </div>
            <div className="p-6">
              {createStep === 0 && <Step1 form={createForm} onChange={setCreateForm} />}
              {createStep === 1 && <Step2 form={createForm} onChange={setCreateForm} />}
              {createStep === 2 && <Step3 form={createForm} onChange={setCreateForm} />}
              {createStep === 3 && <Step4 form={createForm} proFee={proFee} featuredFee={featuredFee} />}
            </div>

            {/* Error */}
            {writeError && (
              <div className="mx-6 mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <p className="text-xs text-error">{writeError.message.slice(0, 200)}</p>
              </div>
            )}

            {/* Success */}
            {isConfirmed && (
              <div className="mx-6 mb-4 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-xs text-success font-medium">Campaign deployed! Redirecting…</p>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 pb-6 flex justify-between">
              <button
                onClick={() => setCreateStep(Math.max(0, createStep - 1))}
                disabled={createStep === 0}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text disabled:opacity-30 transition-colors"
              >
                Back
              </button>

              {createStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCreateStep(createStep + 1)}
                  disabled={!canNext}
                  className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleDeploy}
                  disabled={!factoryAddress || isWritePending || isConfirming || isConfirmed}
                  className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isWritePending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isWritePending ? 'Confirm in wallet…' : 'Deploying…'}
                    </>
                  ) : (
                    'Deploy Campaign'
                  )}
                </button>
              )}
            </div>
          </div>
        </NetworkGuard>
      </div>
    </div>
  )
}