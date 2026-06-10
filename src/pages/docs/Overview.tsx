

import { Link } from 'react-router-dom'
import { useState } from 'react'

type MainTab = 'overview' | 'guide'
type GuideTab = 'creator' | 'user'

export default function Docs() {
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [guideTab, setGuideTab] = useState<GuideTab>('creator')

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <img src="/duck-icon.svg" alt="LitDucks" className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-text mb-2">LitDucks Docs</h1>
        <p className="text-text-secondary text-lg">
          Whitelist Management Platform for LitVM LiteForge
        </p>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setMainTab('overview')}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            mainTab === 'overview'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setMainTab('guide')}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            mainTab === 'guide'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'
          }`}
        >
          Guide
        </button>
      </div>

      {/* ════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════ */}
      {mainTab === 'overview' && (
        <div>
            {/* Table of Contents */}
<div className="bg-surface border border-border rounded-xl p-6 mb-8">
  <h2 className="text-lg font-semibold text-text mb-4">Table of Contents</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
    <a href="#what" className="text-primary hover:underline py-1">What is LitDucks?</a>
    <a href="#features" className="text-primary hover:underline py-1">Features</a>
    <a href="#quick-start" className="text-primary hover:underline py-1">Quick Start</a>
    <a href="#requirements" className="text-primary hover:underline py-1">Requirements Types</a>
    <a href="#tiers" className="text-primary hover:underline py-1">Tiers</a>
    <a href="#contracts" className="text-primary hover:underline py-1">Smart Contracts</a>
    <a href="#faq" className="text-primary hover:underline py-1">FAQ</a>
  </div>
</div>

          {/* What is LitDucks */}
          <section id="what" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">What is LitDucks?</h2>
            <p className="text-text-secondary mb-2">
              LitDucks is the first native whitelist management platform built specifically for{' '}
              <strong>LitVM LiteForge testnet</strong>.
            </p>
            <p className="text-text-secondary">
              NFT projects and token sales can create whitelist campaigns, and users can register
              with on-chain wallet verification, no more Google Forms or manual spreadsheets.
            </p>
          </section>

          {/* Features */}
          <section id="features" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'On-Chain Verification',
                  desc:  'Wallet age, transaction count, token/NFT holding checked on-chain.',
                },
                {
                  icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
                  title: 'Anti-Sybil Protection',
                  desc:  'Prevent bots with multiple combined requirements.',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'FCFS & Raffle',
                  desc:  'Choose between first-come-first-served or random raffle.',
                },
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  title: 'Dashboard & CSV',
                  desc:  'Manage campaigns and export registrants data.',
                },
                {
                  icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                  title: 'Merkle Root Export',
                  desc:  'Export winners as Merkle tree for gas-efficient minting.',
                },
                {
                  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                  title: 'Whitelist History',
                  desc:  'Track all your registrations in profile page.',
                },
              ].map((f) => (
                <div key={f.title} className="bg-surface border border-border rounded-lg p-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text mb-1">{f.title}</h3>
                  <p className="text-text-secondary text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Start */}
          <section id="quick-start" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">Quick Start</h2>
            <div className="space-y-4">
              {[
                { n:1, title:'Connect Wallet',   desc:<>Connect your wallet to LiteForge testnet (Chain ID: 4441).</> },
                { n:2, title:'Create Campaign',  desc:<>Go to <Link to="/create" className="text-primary hover:underline">Create Campaign</Link> and fill in your project details.</> },
                { n:3, title:'Set Requirements', desc:<>Configure minimum transactions, wallet age, or token/NFT holding.</> },
                { n:4, title:'Deploy & Share',   desc:<>Deploy your campaign and share the link with your community.</> },
                { n:5, title:'Manage & Export',  desc:<>View registrants, run raffle, export CSV or Merkle root.</> },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">{s.n}</div>
                  <div>
                    <h3 className="font-semibold text-text">{s.title}</h3>
                    <p className="text-text-secondary text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Requirements Types */}
          <section id="requirements" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">Requirements Types</h2>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 border-b border-border">
                    <th className="text-left py-3 px-4 text-text font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-text font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-text-secondary font-medium">Min Transactions</td>
                    <td className="py-3 px-4 text-text-secondary">Wallet must have X transactions on LiteForge</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-text-secondary font-medium">Min Wallet Age</td>
                    <td className="py-3 px-4 text-text-secondary">Wallet must be at least X days old</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-text-secondary font-medium">Token/NFT Holding</td>
                    <td className="py-3 px-4 text-text-secondary">Wallet must hold specific ERC20/ERC721/ERC1155 tokens</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Tiers */}
          <section id="tiers" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">Tiers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-text">Free Tier</h3>
                  <div className="text-3xl font-bold text-primary mt-2">FREE</div>
                </div>
                <ul className="space-y-2 text-sm text-text-secondary">
                  {['Up to 100 WL slots','On-chain verification','FCFS & Raffle','Dashboard & CSV export'].map(i => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-surface border border-primary/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-primary">Pro Tier</h3>
                  <div className="text-2xl font-bold text-text mt-2">Unlimited Slots</div>
                  <p className="text-xs text-text-secondary mt-1">For campaigns &gt; 100 slots</p>
                </div>
                <ul className="space-y-2 text-sm text-text-secondary">
                  {['Unlimited WL slots','All Free features','Priority support','Advanced analytics'].map(i => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-2 bg-success/10 border border-success/20 rounded-lg text-center">
                  <p className="text-xs text-success font-medium">FREE for testnet during hackathon</p>
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-xs text-center mt-4">
              Free tier automatically upgrades to Pro when creating campaigns with &gt; 100 slots.
            </p>
          </section>

          {/* Smart Contracts */}
          <section id="contracts" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">Smart Contracts</h2>
            <div className="space-y-3">
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold text-text mb-1">LitDucksFactory.sol</h3>
                <p className="text-text-secondary text-sm mb-2">Deploys campaign contracts and handles tier management.</p>
                <code className="text-xs bg-surface-2 px-2 py-1 rounded block break-all">
                  Factory: 0xdDC8255958463A7BF7dC19657800201a1f8a00B6
                </code>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold text-text mb-1">LitDucksCampaign.sol</h3>
                <p className="text-text-secondary text-sm">On-chain wallet registration, requirements check, and Merkle root export.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-3">FAQ</h2>
            <div className="space-y-4">
              {[
                { q:'When does Free tier upgrade to Pro?',  a:'Automatically when you create a campaign with more than 100 WL slots.' },
                { q:'Which wallets are supported?',          a:'MetaMask, WalletConnect, and any EVM-compatible wallet.' },
                { q:'How to get zkLTC for gas?',             a:<>Get from <a href="https://liteforge.hub.caldera.xyz" target="_blank" className="text-primary hover:underline">faucet</a> — free testnet tokens.</> },
                { q:'Is it open source?',                    a:<>Yes. Check our <a href="https://github.com/ffffffffhugfadil/litducks" target="_blank" className="text-primary hover:underline">GitHub</a>.</> },
              ].map((f) => (
                <div key={f.q} className="bg-surface border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-text mb-1">{f.q}</h3>
                  <p className="text-text-secondary text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Guide CTA */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-text mb-3">Ready to start? Check the step-by-step guide.</p>
            <button
              onClick={() => setMainTab('guide')}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all"
            >
              View Guide →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          GUIDE TAB
      ════════════════════════════════════════ */}
      {mainTab === 'guide' && (
        <div>
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text mb-2">LitDucks Guide</h2>
            <p className="text-text-secondary text-lg">Complete walkthrough for creators and users</p>
          </div>

          {/* Guide sub-tabs */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setGuideTab('creator')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                guideTab === 'creator'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'
              }`}
            >
              For Creators
            </button>
            <button
              onClick={() => setGuideTab('user')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                guideTab === 'user'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'
              }`}
            >
              For Users
            </button>
          </div>

          {/* ── CREATOR GUIDE ── */}
          {guideTab === 'creator' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary/5 to-surface border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-text mb-2">Creator Guide</h2>
                <p className="text-text-secondary">
                  Launch your whitelist campaign in under 5 minutes. Follow these steps to create,
                  manage, and export your whitelist.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h3 className="text-xl font-semibold text-text">Connect Your Wallet</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">First, make sure you're on the correct network and connect your wallet.</p>
                  <div className="bg-surface-2 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-text mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-text-secondary space-y-1 text-sm">
                      <li>Install MetaMask or any EVM-compatible wallet</li>
                      <li>Switch to <strong>LiteForge Testnet</strong> (Chain ID: 4441)</li>
                      <li>Get zkLTC from <a href="https://liteforge.hub.caldera.xyz" target="_blank" className="text-primary hover:underline">faucet</a> for gas fees</li>
                    </ul>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <p className="text-sm text-warning">Make sure your wallet shows "LitVM LiteForge" network before proceeding.</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h3 className="text-xl font-semibold text-text">Create Campaign</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">
                    Click <Link to="/create" className="text-primary hover:underline">Create Campaign</Link> in the navigation bar.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Basic Info</h4>
                      <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                        <li><strong>Campaign Name</strong> - Your project name</li>
                        <li><strong>Description</strong> - What users need to know</li>
                        <li><strong>Banner Image</strong> - IPFS or HTTP URL (optional)</li>
                        <li><strong>Social Links</strong> - Twitter, Discord, Website</li>
                      </ul>
                    </div>
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Campaign Settings</h4>
                      <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                        <li><strong>Total Slots</strong> - Max whitelist spots (≤100 free, &gt;100 Pro)</li>
                        <li><strong>Deadline</strong> - When registration closes</li>
                        <li><strong>Selection Mode</strong> - FCFS or Raffle</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                    <h3 className="text-xl font-semibold text-text">Set Requirements</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">Configure on-chain verification requirements to prevent bots and sybil attacks.</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Transaction Count</h4>
                      <p className="text-text-secondary text-sm">Require minimum number of transactions on LiteForge.</p>
                      <code className="text-xs block mt-2 bg-background p-2 rounded">Example: 5+ transactions</code>
                    </div>
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Wallet Age</h4>
                      <p className="text-text-secondary text-sm">Require wallet to be at least X days old.</p>
                      <code className="text-xs block mt-2 bg-background p-2 rounded">Example: 7+ days old</code>
                    </div>
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Token/NFT Holding</h4>
                      <p className="text-text-secondary text-sm">Require holding specific ERC20, ERC721, or ERC1155 tokens.</p>
                      <code className="text-xs block mt-2 bg-background p-2 rounded">Example: Hold at least 1 NFT</code>
                    </div>
                  </div>
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    <p className="text-sm text-success">Pro tip: Combine multiple requirements for maximum anti-sybil protection</p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                    <h3 className="text-xl font-semibold text-text">Deploy Campaign</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">Review your campaign details and deploy to the blockchain.</p>
                  <div className="bg-surface-2 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-text mb-2">Tier Information</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li><strong>Free Tier</strong> - Up to 100 WL slots, no payment required</li>
                      <li><strong>Pro Tier</strong> - Unlimited WL slots, automatically enabled for &gt;100 slots</li>
                    </ul>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <p className="text-sm text-warning">Make sure you have enough zkLTC for gas fees (very small amount).</p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</div>
                    <h3 className="text-xl font-semibold text-text">Share Campaign</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">After deployment, you'll get a unique campaign link. Share it with your community.</p>
                  <div className="bg-surface-2 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Promotion Tips</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li>Post on Twitter/X with LitDucks LiteForge</li>
                      <li>Share in Discord communities</li>
                      <li>Pin campaign link in your project's announcement channel</li>
                      <li>Update your project's documentation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">6</div>
                    <h3 className="text-xl font-semibold text-text">Manage & Export</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">Monitor registrations and export your whitelist from the Dashboard.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">Dashboard Features</h4>
                      <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                        <li>View live registration count</li>
                        <li>See all registered wallets</li>
                        <li>Export CSV of registrants</li>
                        <li>Run raffle (for Raffle mode)</li>
                        <li>Export Merkle root for minting</li>
                      </ul>
                    </div>
                    <div className="bg-surface-2 rounded-xl p-4">
                      <h4 className="font-semibold text-text mb-2">CSV Export Format</h4>
                      <code className="text-xs block bg-background p-2 rounded">
                        address,slot_number<br />
                        0x1234...5678,1<br />
                        0xabcd...efgh,2
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── USER GUIDE ── */}
          {guideTab === 'user' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary/5 to-surface border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-text mb-2">User Guide</h2>
                <p className="text-text-secondary">
                  Register for whitelists and secure your spot for NFT mints or token sales.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h3 className="text-xl font-semibold text-text">Browse Campaigns</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">
                    Go to <Link to="/explore" className="text-primary hover:underline">Explore</Link> to see all active whitelist campaigns.
                  </p>
                  <div className="bg-surface-2 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Filter Options</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li><strong>Live</strong> - Currently active campaigns</li>
                      <li><strong>Ended</strong> - Completed campaigns</li>
                      <li><strong>FCFS</strong> - First come, first served</li>
                      <li><strong>Raffle</strong> - Random draw after deadline</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h3 className="text-xl font-semibold text-text">Connect Wallet</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">Click "Connect Wallet" in the top-right corner and select your wallet.</p>
                  <div className="bg-surface-2 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li>Install MetaMask or any EVM-compatible wallet</li>
                      <li>Switch to <strong>LiteForge Testnet</strong> (Chain ID: 4441)</li>
                      <li>Get zkLTC from <a href="https://liteforge.hub.caldera.xyz" target="_blank" className="text-primary hover:underline">faucet</a> for gas fees</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                    <h3 className="text-xl font-semibold text-text">Check Requirements</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">Each campaign has specific requirements. The system automatically checks your wallet.</p>
                  <div className="bg-surface-2 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Requirement Types</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li><strong>Transaction Count</strong> - Your total transactions on LiteForge</li>
                      <li><strong>Wallet Age</strong> - How long your wallet has been active</li>
                      <li><strong>Token/NFT Holding</strong> - Specific tokens or NFTs you must own</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                    <h3 className="text-xl font-semibold text-text">Register for Whitelist</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">
                    If you meet all requirements, click "Register for Whitelist" and confirm the transaction.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <p className="text-sm text-success font-medium mb-2">Success (FCFS)</p>
                      <p className="text-text-secondary text-xs">You'll see "Registered!" immediately.</p>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                      <p className="text-sm text-warning font-medium mb-2">Raffle Mode</p>
                      <p className="text-text-secondary text-xs">You'll be entered into the draw. Winners selected after deadline.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</div>
                    <h3 className="text-xl font-semibold text-text">Track Your Registrations</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">
                    View all your whitelist registrations in your <Link to="/profile" className="text-primary hover:underline">Profile</Link>.
                  </p>
                  <div className="bg-surface-2 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Profile Features</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li>See all campaigns you've registered for</li>
                      <li>Check if you won (for Raffle campaigns)</li>
                      <li>View registration timestamp</li>
                      <li>Link to campaign details</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">6</div>
                    <h3 className="text-xl font-semibold text-text">Claim Your Spot</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary mb-4">
                    If selected, you'll receive a notification. Follow the project's instructions for minting.
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Next Steps</h4>
                    <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                      <li>Check project's Twitter/Discord for mint announcements</li>
                      <li>Visit project's minting page</li>
                      <li>Connect wallet and mint your NFT/token</li>
                      <li>Merkle proof may be required (provided by project)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview CTA */}
          <div className="mt-10 bg-surface border border-border rounded-xl p-6 text-center">
            <p className="text-text-secondary text-sm mb-3">
              Need more information? Check the Overview section.
            </p>
            <button
              onClick={() => setMainTab('overview')}
              className="text-primary hover:underline text-sm font-medium"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-12 text-center pt-8 border-t border-border">
        <p className="text-text-secondary text-sm">
          Built for <strong>LiteForge Hackathon</strong> • Chain ID: 4441 • zkLTC
        </p>
        <p className="text-text-secondary text-xs mt-2">
          <a href="https://github.com/ffffffffhugfadil/litducks" target="_blank" className="hover:underline">GitHub</a>
          {' • '}
          <a href="https://x.com/litducksnft" target="_blank" className="hover:underline">Twitter</a>
          {' • '}
          <a href="https://liteforge.hub.caldera.xyz" target="_blank" className="hover:underline">Get zkLTC</a>
        </p>
      </div>
    </div>
  )
}
