import { Image, Twitter, MessageSquare, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { CreateCampaignForm } from '../../types'

interface Props {
  form: CreateCampaignForm
  onChange: (v: Partial<CreateCampaignForm>) => void
  onValidationChange?: (isValid: boolean) => void // <-- Menggunakan tanda '?' agar bersifat opsional
}

export default function Step1({ form, onChange, onValidationChange }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [checkingImage, setCheckingImage] = useState(false)

  // Helper: convert IPFS to HTTP gateway
  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return url
  }

  // Check if image is valid when bannerImage changes
  useEffect(() => {
    if (!form.bannerImage) {
      setImageLoaded(false)
      setImageError(false)
      setCheckingImage(false)
      return
    }

    setCheckingImage(true)
    setImageLoaded(false)
    setImageError(false)

    const img = window.Image ? new window.Image() : document.createElement('img')
    const imageUrl = getImageUrl(form.bannerImage)
    
    img.onload = () => {
      setImageLoaded(true)
      setImageError(false)
      setCheckingImage(false)
    }
    
    img.onerror = () => {
      setImageLoaded(false)
      setImageError(true)
      setCheckingImage(false)
    }
    
    img.src = imageUrl
  }, [form.bannerImage])

  // Mengirim status ke file induk dengan pengaman agar tidak crash
  useEffect(() => {
    const isValid = form.name.trim().length > 0 && (!form.bannerImage || imageLoaded);
    
    // KUNCI PERBAIKAN: Hanya panggil jika fungsinya terdefinisi di file induk
    if (typeof onValidationChange === 'function') {
      onValidationChange(isValid);
    }
  }, [form.name, form.bannerImage, imageLoaded, onValidationChange]);

  return (
    <div className="space-y-5">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Project Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="My Awesome NFT Project"
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={3}
          placeholder="Describe your project and whitelist campaign…"
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none resize-none transition-colors"
        />
      </div>

      {/* Banner Image URL */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-text-secondary" /> Banner Image URL (IPFS or HTTP)
        </label>
        <input
          type="url"
          value={form.bannerImage}
          onChange={e => onChange({ bannerImage: e.target.value })}
          placeholder="ipfs://... or https://..."
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors font-mono"
        />
        
        {/* Image Preview with Loading & Error States */}
        {form.bannerImage && (
          <div className="mt-2 h-40 rounded-lg overflow-hidden border border-border bg-surface-3 flex items-center justify-center p-2 relative">
            {checkingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-2/80">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!checkingImage && imageError && (
              <div className="text-center text-error text-xs p-2">
                <p>⚠️ Failed to load image</p>
                <p className="text-text-secondary mt-1">Check URL or use HTTP gateway</p>
              </div>
            )}
            
            {!checkingImage && imageLoaded && (
              <img 
                src={getImageUrl(form.bannerImage)} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-md"
              />
            )}
          </div>
        )}
      </div>

      {/* Twitter & Discord */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
            <Twitter className="w-3.5 h-3.5 text-text-secondary" /> Twitter
          </label>
          <input
            type="text"
            value={form.twitter}
            onChange={e => onChange({ twitter: e.target.value })}
            placeholder="@handle"
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-text-secondary" /> Discord
          </label>
          <input
            type="text"
            value={form.discord}
            onChange={e => onChange({ discord: e.target.value })}
            placeholder="discord.gg/..."
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-text-secondary" /> Website
        </label>
        <input
          type="url"
          value={form.website}
          onChange={e => onChange({ website: e.target.value })}
          placeholder="https://yourproject.xyz"
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors"
        />
      </div>

      {/* Validation Message */}
      {form.bannerImage && imageError && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-xs text-error">
          ⚠️ Banner image failed to load. Please check the URL or use a different image host.
        </div>
      )}
    </div>
  )
}
