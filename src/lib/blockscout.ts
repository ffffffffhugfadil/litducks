const EXPLORER_API = 'https://liteforge.explorer.caldera.xyz/api'

export interface WalletStats {
  txCount: number
  firstTxTimestamp: number | null
  walletAgeDays: number
}

export async function getWalletStats(address: string): Promise<WalletStats> {
  try {
    // Get transaction count
    let txCount = 0
    try {
      const countRes = await fetch(`${EXPLORER_API}?module=account&action=txlist&address=${address}&sort=desc`)
      if (countRes.ok) {
        const data = await countRes.json()
        if (data.status === '1' && Array.isArray(data.result)) {
          txCount = data.result.length
        }
      }
    } catch {
      // fallback
    }

    // Get first tx for wallet age
    let firstTxTimestamp: number | null = null
    try {
      const firstTxRes = await fetch(`${EXPLORER_API}?module=account&action=txlist&address=${address}&sort=asc&page=1&offset=1`)
      if (firstTxRes.ok) {
        const data = await firstTxRes.json()
        if (data.status === '1' && data.result?.length > 0) {
          firstTxTimestamp = parseInt(data.result[0].timeStamp) * 1000
          if (txCount === 0) txCount = 1
        }
      }
    } catch {
      // fallback
    }

    const walletAgeDays = firstTxTimestamp
      ? Math.floor((Date.now() - firstTxTimestamp) / (1000 * 60 * 60 * 24))
      : 0

    return { txCount, firstTxTimestamp, walletAgeDays }
  } catch (err) {
    console.error('Blockscout API error:', err)
    return { txCount: 0, firstTxTimestamp: null, walletAgeDays: 0 }
  }
}


export async function getTokenBalance(walletAddress: string, tokenAddress: string): Promise<number> {
  try {
    const res = await fetch(
      `${EXPLORER_API}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${walletAddress}`
    )
    if (!res.ok) return 0
    const data = await res.json()
    if (data.status === '1') {
      return parseInt(data.result) || 0
    }
    return 0
  } catch {
    return 0
  }
}


export async function getNFTBalance(walletAddress: string, nftAddress: string): Promise<number> {
  return getTokenBalance(walletAddress, nftAddress)
}