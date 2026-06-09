import { useState } from 'react'
import { Settings, Check } from 'lucide-react'
import { useWalletStore } from '../../store/useWalletStore'
import { isAddress } from 'viem'

export default function FactoryAddressInput() {
  const { factoryAddress, setFactoryAddress } = useWalletStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(factoryAddress)
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (isAddress(input)) {
      setFactoryAddress(input)
      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false) }, 1000)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        {factoryAddress
          ? `Factory: ${factoryAddress.slice(0, 8)}…`
          : 'Set Factory Address'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="0x… factory contract"
        className="px-3 py-1.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-xs text-text placeholder-text-secondary outline-none font-mono w-64 transition-colors"
        autoFocus
      />
      <button
        onClick={save}
        disabled={!isAddress(input)}
        className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-text-secondary hover:text-text">
        Cancel
      </button>
    </div>
  )
}
