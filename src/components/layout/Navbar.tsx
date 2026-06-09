// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Compass, PlusCircle, LayoutDashboard } from 'lucide-react'
import ConnectButton from '../wallet/ConnectButton'

const links = [
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/create', label: 'Create', icon: PlusCircle },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Navbar() {
  const location = useLocation()
  const { address } = useAccount()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo - Dengan favicon.svg */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <img src="/favicon.svg" alt="LitDucks" className="w-5 h-5" />
          </div>
          <span className="font-semibold text-text tracking-tight">
            LitDucks <span className="text-primary">WL</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}
              >
                {label}
              </Link>
            )
          })}
          {address && (
            <Link
              to={`/profile/${address}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/profile')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text hover:bg-surface'
              }`}
            >
              Profile
            </Link>
          )}
        </nav>

        {/* Wallet */}
        <ConnectButton />
      </div>
    </header>
  )
}