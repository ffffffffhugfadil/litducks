// src/components/create/Step1.tsx
import { Image, Twitter, MessageSquare, Globe, Upload, Loader2, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { CreateCampaignForm } from '../../types'

interface Props {
  form: CreateCampaignForm
  onChange: (v: Partial<CreateCampaignForm>) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function Step1({ form, onChange, onValidationChange }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [checkingImage, setCheckingImage] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper: convert IPFS to HTTP gateway
  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
    }
    return url
  }

  // Upload image to Pinata
  const uploadToIPFS = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer cca7a4759285dd0901d5`
        },
        body: formData
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      const ipfsUrl = `ipfs://${data.IpfsHash}`
      
      setUploadProgress(100)
      onChange({ bannerImage: ipfsUrl })
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setUploadProgress(0)
      alert('Failed to upload image. Please try again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, WebP)')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    
    uploadToIPFS(file)
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

  // Mengirim status ke file induk
  useEffect(() => {
    const isValid = form.name.trim().length > 0 && (!form.bannerImage || imageLoaded)
    if (typeof onValidationChange === 'function') {
      onValidationChange(isValid)
    }
  }, [form.name, form.bannerImage, imageLoaded, onValidationChange])

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

      {/* Banner Image */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-text-secondary" /> Banner Image (Optional)
        </label>
        
        {/* Upload Area */}
        <div className="mb-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2.5 bg-surface-2 border border-dashed border-border hover:border-primary rounded-lg text-sm text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image (JPEG, PNG, GIF, WebP, max 5MB)
              </>
            )}
          </button>
        </div>

        {/* Or input URL manually */}
        <div className="relative">
          <input
            type="text"
            value={form.bannerImage}
            onChange={e => onChange({ bannerImage: e.target.value })}
            placeholder="Or enter IPFS / HTTP URL directly..."
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text placeholder-text-secondary outline-none transition-colors font-mono"
          />
          {form.bannerImage && (
            <button
              onClick={() => onChange({ bannerImage: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Image Preview with Loading & Error States */}
        {form.bannerImage && (
          <div className="mt-2 h-40 rounded-lg overflow-hidden border border-border bg-surface-2 flex items-center justify-center p-2 relative">
            {checkingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-2/80">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}
            
            {!checkingImage && imageError && (
              <div className="text-center text-error text-xs p-2">
                <p>⚠️ Failed to load image</p>
                <p className="text-text-secondary mt-1">Check URL or upload a new image</p>
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
          ⚠️ Banner image failed to load. Please check the URL or upload a new image.
        </div>
      )}
    </div>
  )
}
