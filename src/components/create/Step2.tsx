// src/components/create/Step2.tsx
import { Zap, Trophy } from 'lucide-react'
import type { CreateCampaignForm, SelectionMode } from '../../types'

interface Props {
  form: CreateCampaignForm
  onChange: (v: Partial<CreateCampaignForm>) => void
}

export default function Step2({ form, onChange }: Props) {
  const minDate = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)

  // Untuk demo/testing, kita set FREE=true (bisa diubah ke false kalau sudah production)
  const IS_FREE_FOR_TESTING = true  // 
  return (
    <div className="space-y-5">
      {/* Pilihan Mode: FCFS atau Raffle */}
      <div className="grid grid-cols-2 gap-3">
        {(['FCFS', 'Raffle'] as SelectionMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => onChange({ selectionMode: mode })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              form.selectionMode === mode
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface-2 hover:border-border-2'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              form.selectionMode === mode ? 'bg-primary/20' : 'bg-surface'
            }`}>
              {mode === 'FCFS' ? (
                <Zap className={`w-4 h-4 ${form.selectionMode === mode ? 'text-primary' : 'text-text-secondary'}`} />
              ) : (
                <Trophy className={`w-4 h-4 ${form.selectionMode === mode ? 'text-primary' : 'text-text-secondary'}`} />
              )}
            </div>
            <p className={`font-semibold text-sm ${form.selectionMode === mode ? 'text-primary' : 'text-text'}`}>
              {mode}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {mode === 'FCFS'
                ? 'First come, first served. Slots fill as users register.'
                : 'Random draw after deadline. Fair selection from all entrants.'}
            </p>
          </button>
        ))}
      </div>

      {/* Input Total WL Slots */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Total WL Slots <span className="text-error">*</span>
        </label>
        <input
          type="number"
          min={1}
          value={form.totalSlots}
          onChange={e => onChange({ totalSlots: parseInt(e.target.value) || 1 })}
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
        />
        
        {form.totalSlots <= 100 ? (
          <p className="text-xs text-success mt-1.5 flex items-center gap-1">
             Free Tier Active (Max 100 slots - FREE)
          </p>
        ) : (
          <p className="text-xs text-warning mt-1.5 flex items-center gap-1">
             More than 100 slots requires Pro tier
          </p>
        )}
      </div>

      {/* Input Deadline */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Deadline <span className="text-error">*</span>
        </label>
        <input
          type="datetime-local"
          min={minDate}
          value={form.deadline ? form.deadline.toISOString().slice(0, 16) : ''}
          onChange={e => onChange({ deadline: e.target.value ? new Date(e.target.value) : null })}
          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border focus:border-primary rounded-lg text-sm text-text outline-none transition-colors"
        />
      </div>

      {/* Opsi Tier - Hanya Pro */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-medium text-text">Pro Tier</h4>
        
        <label className="flex items-start gap-3 p-3 bg-surface-2 border border-border rounded-lg cursor-pointer hover:border-border-2 transition-colors">
          <input
            type="checkbox"
            checked={form.isPro || form.totalSlots > 100}
            disabled={form.totalSlots > 100}
            onChange={e => onChange({ isPro: e.target.checked })}
            className="mt-0.5 accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-text">
              Pro —{' '}
              {IS_FREE_FOR_TESTING ? (
                <>
                  <span className="line-through text-text-secondary">0.5 zkLTC</span>{' '}
                  <span className="text-success font-bold">FREE</span>
                </>
              ) : (
                '0.5 zkLTC'
              )}
            </p>
            <p className="text-xs text-text-secondary">
              {form.totalSlots > 100 
                ? 'Automatically active because slots > 100' 
                : IS_FREE_FOR_TESTING
                  ? ' FREE for testing! (Originally 0.5 zkLTC)'
                  : 'Unlimited WL slots (Free for ≤ 100 slots)'}
            </p>
          </div>
        </label>
      </div>

      {/* Banner promosi FREE untuk testing */}
      {IS_FREE_FOR_TESTING && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-center">
          <p className="text-xs text-success font-medium">
             HACKATHON MODE: Pro features are FREE!
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Original: Pro = 0.5 zkLTC
          </p>
        </div>
      )}
    </div>
  )
}
