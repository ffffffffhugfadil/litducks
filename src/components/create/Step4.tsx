import { formatEther } from 'viem'
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { CreateCampaignForm } from '../../types'
import { useWalletStore } from '../../store/useWalletStore'
import { format } from 'date-fns'

interface Props {
  form: CreateCampaignForm
  proFee?: bigint
  featuredFee?: bigint
}

export default function Step4({ form, proFee, featuredFee }: Props) {
  const { factoryAddress } = useWalletStore()

  const isPro = form.isPro || form.totalSlots > 100
  const pf = proFee ?? BigInt('500000000000000000')
  const ff = featuredFee ?? BigInt('2000000000000000000')

  let totalCost = BigInt(0)
  if (isPro) totalCost += pf
  if (form.isFeatured) totalCost += ff

  // Helper untuk memotong address panjang (Truncate)
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

  // Base Rows yang selalu tampil
  const rows = [
    { label: 'Project Name', value: form.name },
    { label: 'Selection Mode', value: form.selectionMode },
    { label: 'Total Slots', value: form.totalSlots.toString() },
    {
      label: 'Deadline',
      value: form.deadline ? format(form.deadline, 'PPP p') : 'Not set',
    },
    { label: 'Min Transactions', value: form.minTransactions.toString() },
    { label: 'Min Wallet Age', value: `${form.minWalletAgeDays} days` },
  ]

  // Suntik Data Token Requirement Dinamis berdasarkan input Step 3
  if (form.requiredToken) {
    rows.push({
      label: 'Required Token Contract',
      value: truncateAddress(form.requiredToken),
    })
    
    if (form.tokenType) {
      rows.push({
        label: 'Token Standard',
        value: form.tokenType,
      })

      if (form.tokenType === 'ERC20') {
        rows.push({
          label: 'Min Balance Required',
          value: `${form.minTokenBalance || 1} Tokens`,
        })
      } else {
        // Untuk ERC721 & ERC1155
        rows.push({
          label: 'NFT Requirement Type',
          value: form.nftType === 'single' ? 'Specific Token ID' : 'Entire Collection',
        })
        
        if (form.nftType === 'single' && form.tokenId) {
          rows.push({
            label: 'Target Token ID',
            value: `#${form.tokenId}`,
          })
        }
        
        rows.push({
          label: 'Min Amount Required',
          value: `${form.minTokenBalance || 1} Item(s)`,
        })
      }
    }
  } else {
    rows.push({ label: 'Token Requirement', value: 'None' })
  }

  // Tambahkan baris Tier status di bagian akhir
  rows.push(
    { label: 'Tier', value: isPro ? 'Pro Tier' : 'Free Tier' },
    { label: 'Featured Placement', value: form.isFeatured ? 'Yes' : 'No' }
  )

  return (
    <div className="space-y-5">
      {/* Alert 1: Factory Config Error */}
      {!factoryAddress && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-error">Factory not configured</p>
            <p className="text-text-secondary text-xs mt-0.5">
              Set the deployed factory address in the settings to continue.
            </p>
          </div>
        </div>
      )}

      {/* Alert 2: Gagal Validasi jika Isian Step 3 Menggantung */}
      {form.requiredToken && !form.tokenType && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Incomplete Token Configuration</p>
            <p className="text-text-secondary text-xs mt-0.5">
              You provided a contract address but did not specify the token standard in Step 3.
            </p>
          </div>
        </div>
      )}

      {/* Campaign Summary Card */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-text">Campaign Review Summary</p>
        </div>
        <div className="divide-y divide-border">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5 hover:bg-surface-3/30 transition-colors">
              <span className="text-xs text-text-secondary">{label}</span>
              <span className="text-xs text-text font-medium font-mono tracking-tight">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment / Cost Section */}
      {totalCost > BigInt(0) ? (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">Total Payment</span>
            <span className="text-lg font-bold text-primary">
              {formatEther(totalCost)} zkLTC
            </span>
          </div>
          <div className="space-y-1 text-xs text-text-secondary border-t border-border/40 pt-2 mt-2">
            {isPro && (
              <div className="flex justify-between">
                <span>Pro tier activation fee</span>
                <span className="font-mono">{formatEther(pf)} zkLTC</span>
              </div>
            )}
            {form.isFeatured && (
              <div className="flex justify-between">
                <span>Featured placement banner fee</span>
                <span className="font-mono">{formatEther(ff)} zkLTC</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-success/5 border border-success/20 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-success font-medium">Free tier — No payment required</span>
        </div>
      )}
    </div>
  )
}