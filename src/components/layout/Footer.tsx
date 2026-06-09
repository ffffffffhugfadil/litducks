// src/components/layout/Footer.tsx
import { Layers, ExternalLink } from 'lucide-react'
import { EXPLORER_URL, FAUCET_URL } from '../../lib/chain'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            {/* ✅ Ganti Layers dengan DuckIcon dari public */}
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <img src="/duck-icon.svg" alt="Duck" className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-text text-sm">LitDucks WL</span>
              <p className="text-xs text-text-secondary mt-0.5">Whitelist management for LitVM LiteForge</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text flex items-center gap-1 transition-colors"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text flex items-center gap-1 transition-colors"
            >
              Faucet <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-text-secondary">
            Chain ID: 4441 · zkLTC · Testnet
          </p>
        </div>
      </div>
    </footer>
  )
}