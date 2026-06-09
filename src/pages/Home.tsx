// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ArrowRight, Layers, Users, Trophy, Shield, Zap, Star } from 'lucide-react'
import { useFactory } from '../hooks/useFactory'
import CampaignCard from '../components/campaigns/CampaignCard'
import SkeletonCard from '../components/campaigns/SkeletonCard'
import FactoryAddressInput from '../components/ui/FactoryAddressInput'
import { useWalletStore } from '../store/useWalletStore'
import { FAUCET_URL } from '../lib/chain'

export default function Home() {
  const { isConnected } = useAccount()
  const { factoryAddress } = useWalletStore()
  const { allCampaigns, campaignsCount, loadingCampaigns } = useFactory()

  // ✅ Urutkan dari yang terbaru (createdAt dari factory sudah berurutan, kita balik)
  // allCampaigns dari factory biasanya urutan dari lama ke baru
  // Maka kita reverse agar yang terbaru di atas
  const recentCampaigns = allCampaigns?.slice().reverse().slice(0, 6) ?? []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Built for LitVM LiteForge Testnet (Chain ID 4441)
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text leading-tight tracking-tight mb-6">
            Universal Whitelist<br />
            <span className="text-primary">Platform for LiteForge</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            Create and manage whitelists natively on LitVM LiteForge. 
            No bots, no spreadsheets, no manual verification, just pure on-chain security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              to="/create"
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all duration-150 hover:scale-105"
            >
              Create Campaign
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 px-6 py-3 bg-surface border border-border hover:border-border-2 text-text rounded-xl font-medium transition-colors"
            >
              Explore Whitelists
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xl font-bold text-text">{campaignsCount?.toString() ?? '—'}</p>
              <p className="text-xs text-text-secondary mt-0.5">Campaigns Created</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xl font-bold text-text">100 slots</p>
              <p className="text-xs text-text-secondary mt-0.5">Free Tier Limit</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xl font-bold text-text">LiteForge</p>
              <p className="text-xs text-text-secondary mt-0.5">Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Factory address config */}
      {!factoryAddress && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Factory contract not configured</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Deploy LitDucksFactory.sol to LiteForge and enter the address below.
              </p>
            </div>
            <FactoryAddressInput />
          </div>
        </section>
      )}

      {factoryAddress && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex justify-end">
          <FactoryAddressInput />
        </div>
      )}

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[
            { 
              icon: Shield, 
              title: 'Wallet Verification', 
              desc: 'Instant bot protection. Filters entrants by wallet age, minimum transaction count, or specific token balances.' 
            },
            { 
              icon: Zap, 
              title: 'FCFS & Fair Raffles', 
              desc: 'Run instant first-come-first-served queues or provably fair drawings powered by block.prevrandao.' 
            },
            { 
              icon: Trophy, 
              title: 'Merkle Root Exports', 
              desc: 'Generate cryptographic winner lists. Perfect for secure, low-gas token distributions or NFT mints.' 
            },
            { 
              icon: Layers, 
              title: 'Purely On-Chain', 
              desc: 'Zero Web2 database dependencies. Every registration and final winner list lives permanently on LiteForge.' 
            },
            { 
              icon: Users, 
              title: 'Flexible Tiers', 
              desc: 'Launch standard campaigns up to 100 slots for free, or scale to unlimited slots with Pro tier.' 
            },
            { 
              icon: Star, 
              title: 'Homepage Boosting', 
              desc: 'Feature your campaign directly on the main dashboard to maximize community reach and exposure.' 
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 bg-surface border border-border rounded-xl hover:border-border-2 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-text text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Campaigns Section */}
        {factoryAddress && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">Recent Campaigns</h2>
              <Link to="/explore" className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingCampaigns ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : recentCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCampaigns.map(addr => (
                  <CampaignCard key={addr} address={addr} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No campaigns yet</p>
                <Link to="/create" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Create the first one →
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      {!isConnected && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden p-8 bg-surface border border-border rounded-2xl text-center">
            <div className="absolute inset-0 bg-grid-pattern-sm bg-grid-sm opacity-50 pointer-events-none" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-text mb-2">Ready to launch your whitelist?</h3>
              <p className="text-text-secondary mb-6 text-sm">
                Connect your wallet and get started on LiteForge testnet.
                Free zkLTC available from the{' '}
                <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  faucet
                </a>.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}