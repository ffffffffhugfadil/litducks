// src/components/create/Step3.tsx
import { Hash, Clock, Shield, Coins, Layers, Image, Images, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import type { CreateCampaignForm } from '../../types'
import { useState, useEffect } from 'react'
import { isAddress } from 'viem'

interface Props {
  form: CreateCampaignForm
  onChange: (v: Partial<CreateCampaignForm>) => void
}

const BLOCKSCOUT_API = 'https://liteforge.explorer.caldera.xyz/api/v2'

// Fungsi untuk mendeteksi tipe token - HANYA via API
async function detectTokenType(contractAddress: `0x${string}`): Promise<'ERC20' | 'ERC721' | 'ERC1155' | null> {
  console.log(`🔍 Detecting token type for ${contractAddress} via API...`)
  
  try {
    const response = await fetch(`${BLOCKSCOUT_API}/tokens/${contractAddress}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📡 API Response:', data)
      
      if (data.type === 'ERC-20') {
        console.log('✅ Detected ERC20 via API')
        return 'ERC20'
      }
      if (data.type === 'ERC-721') {
        console.log('✅ Detected ERC721 via API')
        return 'ERC721'
      }
      if (data.type === 'ERC-1155') {
        console.log('✅ Detected ERC1155 via API')
        return 'ERC1155'
      }
    } else {
      console.log('⚠️ API returned:', response.status)
    }
  } catch (error) {
    console.log('⚠️ API error:', error)
  }

  console.log('❌ Could not detect token type from API')
  return null
}

export default function Step3({ form, onChange }: Props) {
  const [showTokenConfig, setShowTokenConfig] = useState(form.requiredToken ? isAddress(form.requiredToken) : false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedType, setDetectedType] = useState<'ERC20' | 'ERC721' | 'ERC1155' | null>(null)
  const [detectError, setDetectError] = useState<string | null>(null)

  // Auto-detect token type via API only
  useEffect(() => {
    const detectType = async () => {
      if (!form.requiredToken || !isAddress(form.requiredToken)) {
        setDetectedType(null)
        setDetectError(null)
        return
      }

      setIsDetecting(true)
      setDetectError(null)
      
      try {
        const type = await detectTokenType(form.requiredToken as `0x${string}`)
        setDetectedType(type)
        
        if (type && !form.tokenType) {
          // Auto-select token type jika terdeteksi dari API
          onChange({ 
            tokenType: type, 
            nftType: undefined, 
            minTokenBalance: 1, 
            tokenId: undefined
          })
        }
      } catch (error) {
        console.error('Detection failed:', error)
        setDetectError('Could not detect token type from API')
      } finally {
        setIsDetecting(false)
      }
    }

    detectType()
  }, [form.requiredToken])

  // Validasi otomatis
  useEffect(() => {
    const isAddressValid = form.requiredToken && isAddress(form.requiredToken)
    if (isAddressValid && !form.tokenType) {
      onChange({ isStepValid: false } as any)
    } else {
      onChange({ isStepValid: true } as any)
    }
  }, [form.requiredToken, form.tokenType])
  
  const handleContractChange = (value: string) => {
    onChange({ requiredToken: value })
    if (value && isAddress(value)) {
      setShowTokenConfig(true)
    } else {
      setShowTokenConfig(false)
      setDetectedType(null)
      setDetectError(null)
      onChange({ 
        tokenType: undefined, 
        nftType: undefined, 
        minTokenBalance: 1, 
        tokenId: undefined 
      })
    }
  }
  
  const handleTokenTypeChange = (type: 'ERC20' | 'ERC721' | 'ERC1155' | undefined) => {
    onChange({ 
      tokenType: type,
      nftType: undefined,
      tokenId: undefined,
      minTokenBalance: 1
    })
  }
  
  const handleNftTypeChange = (nftType: 'collection' | 'single' | undefined) => {
    onChange({ nftType } as any)
  }
  
  const getRequirementDescription = () => {
    if (form.tokenType === 'ERC20') {
      return `Wallet must hold at least ${form.minTokenBalance || 1} tokens from this contract.`
    }
    if (form.tokenType === 'ERC721') {
      if (form.nftType === 'collection') {
        return `Wallet must own at least ${form.minTokenBalance || 1} NFT(s) from this collection.`
      }
      if (form.nftType === 'single') {
        return `Wallet must own the specific NFT with Token ID: ${form.tokenId || '?'}.`
      }
      return `Select requirement type (Collection or Single).`
    }
    if (form.tokenType === 'ERC1155') {
      if (form.nftType === 'collection') {
        return `Wallet must hold at least ${form.minTokenBalance || 1} token(s) from any ID in this collection.`
      }
      if (form.nftType === 'single') {
        return `Wallet must hold at least ${form.minTokenBalance || 1} token(s) of ID ${form.tokenId || '?'}.`
      }
      return `Select requirement type (Collection or Single).`
    }
    return 'Select token standard to configure requirement.'
  }
  
  return (
    <div className="space-y-5">
      <p className="text-sm text-text-secondary">
        Requirements are checked on-chain via the smart contract before registration.
      </p>

      {/* Minimum Transactions */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-text-secondary" /> Minimum Transactions
        </label>
        <input
          type="number"
          min={0}
          value={form.minTransactions}
          onChange={e => onChange({ minTransactions: parseInt(e.target.value) || 0 })}
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
        />
        <p className="text-xs text-text-secondary mt-1">Wallet must have at least this many transactions on LiteForge.</p>
      </div>

      {/* Minimum Wallet Age */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-text-secondary" /> Minimum Wallet Age (days)
        </label>
        <input
          type="number"
          min={0}
          value={form.minWalletAgeDays}
          onChange={e => onChange({ minWalletAgeDays: parseInt(e.target.value) || 0 })}
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
        />
        <p className="text-xs text-text-secondary mt-1">Days since first transaction on LiteForge.</p>
      </div>

      {/* ===== TOKEN / NFT REQUIREMENT ===== */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="text-sm font-medium text-text mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-primary" />
          Token / NFT Requirement (Optional)
        </h4>

        {/* Token Contract Address */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-text mb-1.5">
            Contract Address
          </label>
          <input
            type="text"
            value={form.requiredToken}
            onChange={e => handleContractChange(e.target.value)}
            placeholder="0x… (leave empty for no requirement)"
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm font-mono text-text placeholder-text-secondary outline-none transition-colors"
          />
          <p className="text-xs text-text-secondary mt-1">
            Supports ERC-20 (fungible), ERC-721 (NFT), and ERC-1155 (multi-token)
          </p>
        </div>

        {/* Auto-detect status */}
        {isDetecting && showTokenConfig && (
          <div className="mb-3 p-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-xs text-primary">Detecting token type from contract...</span>
          </div>
        )}

        {detectError && (
          <div className="mb-3 p-2 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-error" />
            <span className="text-xs text-error">{detectError}</span>
          </div>
        )}

        {detectedType && !form.tokenType && (
          <div className="mb-3 p-2 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-success">Detected: {detectedType} - Auto-selected!</span>
          </div>
        )}

        {/* Token Type Selection - Muncul jika address valid */}
        {showTokenConfig && (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text">
                  Token Standard <span className="text-error">*</span>
                </label>
                {form.tokenType && (
                  <button
                    type="button"
                    onClick={() => handleTokenTypeChange(undefined)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Change Standard
                  </button>
                )}
              </div>

              {/* JIKA BELUM MEMILIH STANDARD */}
              {!form.tokenType ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTokenTypeChange('ERC20')}
                      className="p-3 rounded-lg border text-center transition-all border-border bg-surface-2 text-text-secondary hover:border-primary/50"
                    >
                      <p className="text-sm font-medium text-text">ERC-20</p>
                      <p className="text-xs opacity-70">Fungible</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleTokenTypeChange('ERC721')}
                      className="p-3 rounded-lg border text-center transition-all border-border bg-surface-2 text-text-secondary hover:border-primary/50"
                    >
                      <p className="text-sm font-medium text-text">ERC-721</p>
                      <p className="text-xs opacity-70">NFT</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleTokenTypeChange('ERC1155')}
                      className="p-3 rounded-lg border text-center transition-all border-border bg-surface-2 text-text-secondary hover:border-primary/50"
                    >
                      <p className="text-sm font-medium text-text">ERC-1155</p>
                      <p className="text-xs opacity-70">Multi-Token</p>
                    </button>
                  </div>

                  {/* Peringatan agar user memilih koin */}
                  <div className="p-2.5 bg-warning/10 border border-warning/20 rounded-lg text-xs text-warning flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>You must select a Token Standard before you can continue.</span>
                  </div>
                </div>
              ) : (
                /* JIKA SUDAH MEMILIH STANDARD */
                <div className="w-full p-3 rounded-lg border border-primary bg-primary/10 text-primary flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold">
                      {form.tokenType === 'ERC20' && 'ERC-20 (Fungible Token)'}
                      {form.tokenType === 'ERC721' && 'ERC-721 (NFT Collection)'}
                      {form.tokenType === 'ERC1155' && 'ERC-1155 (Multi-Token)'}
                    </p>
                    <p className="text-xs opacity-80">Selected standard for this requirement.</p>
                  </div>
                  {detectedType === form.tokenType && (
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">✓ Auto-detected</span>
                  )}
                </div>
              )}
            </div>

            {/* ===== CONFIG ERC-20 ===== */}
            {form.tokenType === 'ERC20' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-text-secondary" /> Minimum Token Balance
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={form.minTokenBalance || 1}
                      onChange={e => onChange({ minTokenBalance: parseInt(e.target.value) || 1 })}
                      className="w-32 px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
                    />
                    <span className="text-xs text-text-secondary">tokens required</span>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CONFIG ERC-721 ===== */}
            {form.tokenType === 'ERC721' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Requirement Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNftTypeChange('collection')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.nftType === 'collection'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface-2 text-text-secondary hover:border-border-2'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Images className="w-4 h-4" />
                        <p className="text-sm font-medium">Collection / Any</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">Any NFT from this collection</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleNftTypeChange('single')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.nftType === 'single'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface-2 text-text-secondary hover:border-border-2'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        <p className="text-sm font-medium">Single Specific</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">Specific NFT by Token ID</p>
                    </button>
                  </div>
                </div>

                {form.nftType === 'collection' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-text-secondary" /> Minimum NFT Count
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={form.minTokenBalance || 1}
                        onChange={e => onChange({ minTokenBalance: parseInt(e.target.value) || 1 })}
                        className="w-32 px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
                      />
                      <span className="text-xs text-text-secondary">NFT(s) required</span>
                    </div>
                  </div>
                )}

                {form.nftType === 'single' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-text-secondary" /> Token ID
                    </label>
                    <input
                      type="text"
                      value={form.tokenId || ''}
                      onChange={e => onChange({ tokenId: e.target.value })}
                      placeholder="e.g., 1, 42, 123..."
                      className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== CONFIG ERC-1155 ===== */}
            {form.tokenType === 'ERC1155' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Requirement Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNftTypeChange('collection')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.nftType === 'collection'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface-2 text-text-secondary hover:border-border-2'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Images className="w-4 h-4" />
                        <p className="text-sm font-medium">Collection / Any</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">Any token ID from this contract</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleNftTypeChange('single')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.nftType === 'single'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface-2 text-text-secondary hover:border-border-2'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        <p className="text-sm font-medium">Single Specific</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">Specific Token ID only</p>
                    </button>
                  </div>
                </div>

                {form.nftType === 'collection' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-text-secondary" /> Minimum Token Balance
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={form.minTokenBalance || 1}
                        onChange={e => onChange({ minTokenBalance: parseInt(e.target.value) || 1 })}
                        className="w-32 px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
                      />
                      <span className="text-xs text-text-secondary">tokens required</span>
                    </div>
                  </div>
                )}

                {form.nftType === 'single' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-text-secondary" /> Token ID
                      </label>
                      <input
                        type="text"
                        value={form.tokenId || ''}
                        onChange={e => onChange({ tokenId: e.target.value })}
                        placeholder="e.g., 1, 42, 123..."
                        className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-text-secondary" /> Minimum Balance for Token ID
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          value={form.minTokenBalance || 1}
                          onChange={e => onChange({ minTokenBalance: parseInt(e.target.value) || 1 })}
                          className="w-32 px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
                        />
                        <span className="text-xs text-text-secondary">tokens required</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Summary Box */}
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-medium text-primary mb-1">Requirement Summary</p>
              <p className="text-xs text-text-secondary">{getRequirementDescription()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}