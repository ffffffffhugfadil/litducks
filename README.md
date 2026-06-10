# LitDucks - Whitelist Management Platform for LitVM LiteForge

LitDucks is a comprehensive whitelist management platform built specifically for the LitVM LiteForge testnet (Chain ID: 4441). It enables NFT projects and token sales to create and manage whitelist campaigns with on-chain wallet verification, eliminating the need for Google Forms or manual spreadsheets.

## Table of Contents

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
14. [License](#license)

## Overview

LitDucks is the first native whitelist management platform deployed on the LitVM LiteForge testnet. The platform allows project creators to launch whitelist campaigns with customizable on-chain verification requirements, while users can register their wallets through a simple interface that automatically checks eligibility based on predefined criteria.

## Problem Statement

NFT projects and token sales on the LitVM testnet currently lack native tools to manage whitelists. Existing solutions rely on:

- Google Forms with no wallet verification, leading to sybil attacks
- External platforms that require manual data entry
- Spreadsheet-based management that is error-prone and time-consuming

## Solution

LitDucks provides a decentralized, on-chain whitelist management system where:

- Project creators can launch campaigns with configurable requirements
- Users register directly with their wallets
- All registrations are stored on-chain for transparency
- Verification happens automatically through smart contracts and blockchain data

## Features

### For Project Creators

- Campaign creation with customizable name, description, and banner image
- Configurable requirements including:
  - Minimum transaction count on LiteForge
  - Minimum wallet age in days
  - Required token holdings (ERC20, ERC721, ERC1155)
- Two selection modes: First-Come-First-Served (FCFS) or Raffle
- Free tier for campaigns up to 100 slots
- Pro tier automatically activated for campaigns exceeding 100 slots
- Dashboard to monitor registrations in real-time
- CSV export of all registered wallets
- Merkle root export for gas-efficient minting

### For Users

- Browse all active whitelist campaigns
- Filter campaigns by status (Live, Ended, FCFS, Raffle)
- Automatic wallet verification against campaign requirements
- One-click registration through connected wallet
- Profile page to track all whitelist registrations
- Winner status indication for raffle campaigns

### Platform Features

- On-chain verification using blockchain data
- Anti-sybil protection through multiple requirement types
- IPFS support for campaign banner images
- Responsive design for desktop and mobile devices
- Comprehensive documentation

## Architecture

The platform follows a factory-campaign pattern:

- **LitDucksFactory.sol**: Deploys new campaign contracts, handles tier management, and maintains a global registry of all campaigns
- **LitDucksCampaign.sol**: Individual campaign contract that manages registrations, verifies requirements, and handles winner selection for raffles

### Data Flow

1. Creator connects wallet and submits campaign parameters
2. Factory contract deploys new campaign contract
3. User connects wallet and views campaign requirements
4. System verifies user wallet against requirements using on-chain data
5. User registers through the campaign contract
6. Creator exports registrants list or runs raffle
7. Winners list exported as Merkle root for minting

## Smart Contracts

### LitDucksFactory.sol

| Function | Description |
|----------|-------------|
| `createCampaign()` | Deploys a new campaign contract |
| `getAllCampaigns()` | Returns all campaign addresses |
| `getCreatorCampaigns(address)` | Returns campaigns for a specific creator |
| `getFeaturedCampaigns()` | Returns featured campaigns |

**Address:** `0xdDC8255958463A7BF7dC19657800201a1f8a00B6`

### LitDucksCampaign.sol

| Function | Description |
|----------|-------------|
| `register(address)` | Registers a wallet to the whitelist |
| `getRegistrants()` | Returns all registered wallet addresses |
| `runRaffle(bytes32)` | Executes random winner selection |
| `exportMerkleRoot()` | Generates Merkle root from winners list |
| `checkRequirements(address)` | Verifies if wallet meets campaign requirements |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| Web3 Library | Wagmi + Viem |
| Wallet Connection | RainbowKit / MetaMask |
| Routing | React Router DOM |
| Smart Contracts | Solidity |
| Blockchain | LitVM LiteForge (Chain ID: 4441) |
| Date Formatting | date-fns |
| Icons | Lucide React |

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- MetaMask or any EVM-compatible wallet

### Steps

Clone the repository:

```bash
git clone https://github.com/ffffffffhugfadil/litducks.git
cd litducks
