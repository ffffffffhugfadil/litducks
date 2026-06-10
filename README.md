# 🦆 LitDucks || Whitelist Management Platform for LitVM LiteForge

<div align="center">

![LitDucks](https://img.shields.io/badge/LitDucks-WL%20Platform-7C6CFF?style=for-the-badge)
![LiteForge](https://img.shields.io/badge/LiteForge-Testnet-f5c842?style=for-the-badge)
![Chain ID](https://img.shields.io/badge/Chain%20ID-4441-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**The first native on-chain whitelist management platform on LitVM LiteForge.**

[Live App](https://litducks.xyz) · [Docs](https://www.litducks.xyz/docs) · [Explorer](https://liteforge.explorer.caldera.xyz/address/0xdDC8255958463A7BF7dC19657800201a1f8a00B6) · [Twitter](https://x.com/litducksnft)

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Smart Contracts](#smart-contracts)
7. [Technology Stack](#technology-stack)
8. [Installation](#installation)
9. [Environment Variables](#environment-variables)
10. [Usage Guide](#usage-guide)
11. [Deployment](#deployment)
12. [Live Demo](#live-demo)
13. [Repository Structure](#repository-structure)
14. [Contributing](#contributing)
15. [License](#license)

---

## 🌐 Overview

**LitDucks** is the first native whitelist management platform deployed on the **LitVM LiteForge testnet** (Chain ID: 4441).

The platform allows project creators to launch whitelist campaigns with customizable on-chain verification requirements, while users can register their wallets through a simple interface that automatically checks eligibility based on predefined criteria.

Built for the **LiteForge Hackathon 2026** — Open Track.

> "No more Google Forms. No more manual spreadsheets. Pure on-chain whitelist management." 🦆

---

## ❌ Problem Statement

NFT projects and token sales on the LitVM testnet currently lack native tools to manage whitelists:

- **No wallet verification** — Google Forms accept anyone without proof of wallet ownership
- **Sybil attacks** — No way to prevent bots from filling up whitelist spots
- **Manual management** — Spreadsheet-based systems are error-prone and time-consuming
- **No native tooling** — Existing platforms (Premint, Atlas3) don't support LitVM natively
- **Fragmented workflow** — Creators must juggle multiple tools to run a simple WL campaign

---

## ✅ Solution

LitDucks provides a **decentralized, on-chain whitelist management system** where:

- Project creators launch campaigns with **configurable on-chain requirements**
- Users register directly with their **connected wallets**
- All registrations are **stored on-chain** for full transparency
- Verification happens **automatically** through smart contracts and blockchain data
- Winners are selected **on-chain** via FCFS or provably fair Raffle

---

## ✨ Features

### For Project Creators 🎨

| Feature | Description |
|---------|-------------|
| Campaign Creation | Name, description, banner image, social links |
| Slot Management | Up to 100 slots free, unlimited with Pro tier |
| Selection Modes | FCFS (First-Come-First-Served) or Raffle |
| Requirements | Minimum tx count, wallet age, token/NFT holding |
| Dashboard | Real-time registration monitoring |
| CSV Export | Download all registered wallets as CSV |
| Merkle Root | Generate Merkle root for gas-efficient minting |

### For Users 👤

| Feature | Description |
|---------|-------------|
| Browse Campaigns | Explore all active WL campaigns |
| Filter & Search | Filter by status, mode, and project name |
| Auto Verification | System checks wallet eligibility automatically |
| One-Click Register | Register via connected wallet |
| Profile Page | Track all whitelist registrations |
| Winner Status | Check raffle results on-chain |

### Platform Features ⚡

| Feature | Description |
|---------|-------------|
| On-Chain Verification | All checks via blockchain data, no off-chain API |
| Anti-Sybil | Combine multiple requirements for max protection |
| IPFS Support | Decentralized banner image storage |
| Responsive Design | Works on desktop and mobile |
| LiteForge Native | Built specifically for Chain ID 4441 |

---

## 🏗️ Architecture

### Smart Contract Pattern — Factory + Campaign

```
┌─────────────────────────────────────────────────────────────────┐
│                        LitDucksFactory.sol                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  createCampaign() → deploys new LitDucksCampaign         │   │
│  │  getAllCampaigns() → registry of all campaigns           │   │
│  │  getCreatorCampaigns(address) → per-creator index        │   │
│  │  getFeaturedCampaigns() → featured list                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │ deploys
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LitDucksCampaign.sol (per campaign)        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  register() → on-chain registration                      │   │
│  │  getRegistrants() → all registered wallets               │   │
│  │  runRaffle(bytes32) → random winner selection            │   │
│  │  setMerkleRoot(bytes32) → set winner merkle root         │   │
│  │  getParams() → campaign configuration                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Creator                  LitDucks Frontend             LiteForge Blockchain
     ║                             │                               │
     ╠═══ Fill campaign form ═════>│                               │
     ║                             ╠═══ deploy via Factory ═══════>│
     ║                             <─── campaign address ──────────╢
     <─── campaign live! ══════════╣                               │
     ║                             │                               │
═════════════════════════════════════════════════════════════════════════════
     ║                             │                               │
  User                             │                               │
     ║                             │                               │
     ╠═══ browse explore ═════════>│                               │
     ║                             ╠═══ read campaigns ═══════════>│
     ║                             <─── on-chain data ─────────────╢
     <─── campaign list ═══════════╣                               │
     ╠═══ click register ═════════>│                               │
     ║                             ╠═══ check requirements ═══════>│
     ║                             <─── eligible ──────────────────╢
     ╠═══ confirm tx ═════════════>│                               │
     ║                             ╠═══ register() ═══════════════>│
     ║                             <─── tx confirmed ──────────────╢
     <─── registered! ═════════════╣                               │
```

### Requirement Verification Flow

```
User connects wallet
        │
        ▼
Check: wallet has min X transactions? ──── No ──▶ Show requirement not met
        │ Yes
        ▼
Check: wallet age ≥ X days? ──────────────── No ──▶ Show requirement not met
        │ Yes
        ▼
Check: holds required token/NFT? ─────────── No ──▶ Show requirement not met
(if set)│ Yes / not required
        ▼
Show "Register for Whitelist" button ✅
```

---

## 📜 Smart Contracts

### LitDucksFactory.sol

**Address:** `0xdDC8255958463A7BF7dC19657800201a1f8a00B6`

**Network:** LitVM LiteForge Testnet (Chain ID: 4441)

**Explorer:** [View on LiteForge Explorer](https://liteforge.explorer.caldera.xyz/address/0xdDC8255958463A7BF7dC19657800201a1f8a00B6)

**Key Functions:**

```solidity
// Deploy a new campaign
function createCampaign(
    string memory _name,
    string memory _description,
    string memory _bannerImage,
    string memory _twitter,
    string memory _discord,
    string memory _website,
    uint256 _totalSlots,
    uint256 _deadline,
    uint8   _selectionMode,   // 0 = FCFS, 1 = Raffle
    uint256 _minTransactions,
    uint256 _minWalletAgeDays,
    address _requiredToken,
    uint8   _tokenType,       // 0 = none, 1 = ERC721, 2 = ERC20
    uint256 _minTokenBalance,
    uint256 _tokenId,
    bool    _isPro,
    bool    _isFeatured
) external payable returns (address campaignAddress)

// View all campaigns
function getAllCampaigns() external view returns (address[] memory)
function getCreatorCampaigns(address creator) external view returns (address[] memory)
function getCampaignsCount() external view returns (uint256)
```

### LitDucksCampaign.sol

Per-campaign contract deployed by the factory.

**Key Functions:**

```solidity
// Register wallet to whitelist
function register() external

// Run raffle (creator only, after deadline)
function runRaffle() external onlyCreator

// View functions
function getParams() external view returns (...)
function getRegistrants() external view returns (address[] memory)
function getWinners() external view returns (address[] memory)
function isRegistered(address user) external view returns (bool)
function isWinner(address user) external view returns (bool)
function isActive() external view returns (bool)
function slotsRemaining() external view returns (uint256)
function registrantCount() external view returns (uint256)
```

**CampaignInfo Struct:**

```solidity
struct CampaignInfo {
    string name;
    string description;
    string bannerImage;       // IPFS CID or URL
    string twitter;
    string discord;
    string website;
    uint256 totalSlots;
    uint256 deadline;         // Unix timestamp
    uint8 selectionMode;      // 0 = FCFS, 1 = Raffle
    uint256 minTransactions;  // min tx count on LiteForge
    uint256 minWalletAgeDays; // min wallet age in days
    address requiredToken;    // 0x0 = none
    uint8 tokenType;          // 0=none, 1=ERC721, 2=ERC20
    uint256 minTokenBalance;
    uint256 tokenId;
    bool isPro;
    bool isFeatured;
    address creatorAddress;
    uint256 createdAt;
}
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.3.1 |
| Language | TypeScript | 5.6.3 |
| Build Tool | Vite | 5.4.10 |
| Styling | TailwindCSS | 3.4.14 |
| Web3 Library | Wagmi + Viem | 2.12.7 + 2.21.0 |
| State Management | Zustand | 4.5.5 |
| Routing | React Router DOM | 6.26.2 |
| Animations | Framer Motion | 11.12.0 |
| Icons | Lucide React | 0.460.0 |
| Date Utils | date-fns | 3.6.0 |
| Smart Contracts | Solidity | 0.8.20 |
| Blockchain | LitVM LiteForge | Chain ID: 4441 |
| Deployment | Vercel | — |

---

## 🚀 Installation

### Prerequisites

- Node.js **v18 or v20** (not v24 — incompatible with Vite 5)
- npm package manager
- MetaMask or any EVM-compatible wallet
- zkLTC from [faucet](https://liteforge.hub.caldera.xyz) for gas

### Clone & Install

```bash
# Clone repository
git clone https://github.com/ffffffffhugfadil/litducks.git
cd litducks

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Add LiteForge Network to MetaMask

| Field | Value |
|-------|-------|
| Network Name | LitVM LiteForge |
| RPC URL | https://liteforge.rpc.caldera.xyz/http |
| Chain ID | 4441 |
| Currency Symbol | zkLTC |
| Block Explorer | https://liteforge.explorer.caldera.xyz |

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# LiteForge Testnet (Chain ID: 4441)
VITE_FACTORY_ADDRESS=0xdDC8255958463A7BF7dC19657800201a1f8a00B6
VITE_RPC_URL=https://liteforge.rpc.caldera.xyz/http

# Optional: Pinata IPFS for banner image uploads
VITE_PINATA_JWT=your_pinata_jwt_token_here
```

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FACTORY_ADDRESS` | Deployed factory contract address | ✅ |
| `VITE_RPC_URL` | LiteForge RPC endpoint | ✅ |
| `VITE_PINATA_JWT` | Pinata JWT for IPFS uploads | Optional |

---

## 📖 Usage Guide

### For Project Creators

**Step 1 — Connect Wallet**
```
Connect MetaMask → Switch to LiteForge (Chain ID: 4441) → Get zkLTC from faucet
```

**Step 2 — Create Campaign**
```
/create → Fill info → Set requirements → Deploy
```

**Campaign Configuration:**
```
Name           : Your project name
Description    : What users need to know
Banner Image   : IPFS CID or HTTP URL (optional)
Total Slots    : ≤100 = Free Tier | >100 = Pro Tier
Deadline       : Unix timestamp (future date)
Selection Mode : 0 = FCFS | 1 = Raffle
Min Tx Count   : Minimum transactions on LiteForge
Min Wallet Age : Minimum wallet age in days
Required Token : Token/NFT contract address (optional)
```

**Step 3 — Share & Monitor**
```
Share campaign link → Monitor via /dashboard → Export CSV/Merkle root
```

### For Users

**Step 1 — Browse** → `/explore`

**Step 2 — Connect Wallet** → MetaMask on LiteForge testnet

**Step 3 — Check Requirements** → System auto-verifies your wallet

**Step 4 — Register** → Click register → Confirm transaction

**Step 5 — Track** → View registrations at `/profile`

---

## 🌐 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "ready for deployment"
git push origin main

# 2. Connect to Vercel at vercel.com/new
# 3. Add environment variables
# 4. Deploy
```

**Vercel Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_FACTORY_ADDRESS` | `0xdDC8255958463A7BF7dC19657800201a1f8a00B6` |
| `VITE_RPC_URL` | `https://liteforge.rpc.caldera.xyz/http` |

**vercel.json** (already included):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

**.nvmrc** (already included):
```
20.17.0
```

---

## 🔗 Live Demo

| Link | URL |
|------|-----|
| **Live App** | https://litducks.xyz |
| **Documentation** | https://litducks.xyz/docs |
| **Explore Campaigns** | https://litducks.xyz/explore |
| **Create Campaign** | https://litducks.xyz/create |
| **Factory Contract** | https://liteforge.explorer.caldera.xyz/address/0xdDC8255958463A7BF7dC19657800201a1f8a00B6 |
| **GitHub** | https://github.com/ffffffffhugfadil/litducks |
| **Twitter** | https://x.com/litducksnft |

---

## 📁 Repository Structure

```
litducks/
├── public/
│   ├── duck-icon.svg           # App favicon/logo
│   └── favicon.svg             # Website favicon
├── src/
│   ├── components/
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.tsx
│   │   │   └── SkeletonCard.tsx # Loading state skeleton for campaigns
│   │   ├── create/
│   │   │   ├── Step1.tsx       # Basic campaign info form
│   │   │   ├── Step2.tsx       # WL slots & deadline settings
│   │   │   ├── Step3.tsx       # Requirements configuration
│   │   │   └── Step4.tsx       # Campaign review & deployment
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   └── Footer.tsx      # Footer with links
│   │   ├── ui/
│   │   │   └── FactoryAddressInput.tsx
│   │   └── wallet/
│   │       ├── ConnectButton.tsx # Wallet connection button
│   │       ├── NetworkBadge.tsx  # Network status indicator
│   │       └── NetworkGuard.tsx  # Network validation wrapper
│   ├── config/
│   │   └── contracts.ts        # Contract addresses & ABIs
│   ├── hooks/
│   │   ├── useCampaign.ts      # Campaign data & operations
│   │   ├── useCreatorCampaigns.ts # Creator-specific campaigns data
│   │   ├── useFactory.ts       # Factory contract interactions
│   │   ├── useNetworkGuard.ts  # Network validation hook
│   │   └── useRequirements.ts  # Requirement verification logic
│   ├── lib/
│   │   ├── blockscout.ts       # Blockscout explorer integrations
│   │   ├── chain.ts            # Chain configuration
│   │   ├── merkle.ts           # Merkle Tree generation for whitelists
│   │   └── wagmi.ts            # Wagmi client setup
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Create.tsx          # Campaign creation wizard
│   │   ├── Explore.tsx         # Browse all campaigns
│   │   ├── Campaign.tsx        # Single campaign detail
│   │   ├── Dashboard.tsx       # Creator management panel
│   │   ├── Profile.tsx         # User whitelist history
│   │   └── docs/
│   │       └── Overview.tsx    # Documentation Overview & Guide
│   ├── store/
│   │   ├── useCampaignStore.ts # Zustand store for campaign state
│   │   └── useWalletStore.ts   # Zustand store for wallet state
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── ipfs.ts             # IPFS gateway helper
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   ├── router.tsx              # React Router configuration
│   └── index.css               # Global styles (Tailwind)
├── contracts/
│   ├── LitDucksFactory.sol     # Factory contract
│   └── LitDucksCampaign.sol    # Individual campaign contract
├── dist/                       # Production build output (Generated)
├── node_modules/               # Installed npm packages (Ignored)
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked dependencies
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript Node config
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── index.html                  # HTML entry point
└── README.md                   # Project documentation
```

---

## 🏆 Hackathon Submission

| Field | Value |
|-------|-------|
| **Event** | LiteForge Hackathon 2026 |
| **Track** | Open Track |
| **Team** | @litducksnft |
| **Live App** | https://litducks.xyz |
| **GitHub** | https://github.com/ffffffffhugfadil/litducks |

**Why LitDucks fits "Hard Money Web3 alignment":**
- Built natively on LitVM LiteForge testnet
- Serves the ecosystem — every LitVM project needs WL management
- No centralized database — all data lives on-chain
- Contributes real utility to the Litecoin ecosystem
- First of its kind on LitVM — no competing solution exists

---

## 🤝 Contributing

This project was built for the LiteForge Hackathon.

For questions, feedback, or bug reports:
- Twitter: [@litducksnft](https://x.com/litducksnft)
- LVC Discord: `#liteforge-hackathon` channel
- GitHub Issues: [Open an issue](https://github.com/ffffffffhugfadil/litducks/issues)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **LiteForge Hackathon** organizers and judges
- **LitVM team** for building the testnet infrastructure
- **@circle_crypto** (LitecoinVM Co-founder) for guidance
- **@LitecoinVM** for supporting builders in the ecosystem
- **Dappit** for AI-powered no-code development tools
- **Caldera** for RPC and explorer infrastructure

---

<div align="center">

Built with 🦆 for the **LiteForge Hackathon 2026**

**LitVM LiteForge Testnet | Chain ID: 4441 | zkLTC**

[litducks.xyz](https://litducks.xyz) · [@litducksnft](https://x.com/litducksnft)

</div>
