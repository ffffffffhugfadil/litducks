// src/hooks/useRequirements.ts
import { useState } from 'react'

export interface RequirementCheck {
  txCount: boolean
  walletAge: boolean
  tokenBalance: boolean
  allPassed: boolean
  details: {
    txCount: number
    walletAgeDays: number
    tokenBalance: number
  }
}

interface CampaignInfoForRequirements {
  minTransactions: number
  minWalletAgeDays: number
  requiredToken: string
  tokenType: number
  minTokenBalance: number
  tokenId: number
}

const EXPLORER_API = 'https://liteforge.explorer.caldera.xyz/api'
const BLOCKSCOUT_API = 'https://liteforge.explorer.caldera.xyz/api/v2'

export function useRequirements() {
  const [checking, setChecking] = useState(false)
  const [checkingStep, setCheckingStep] = useState<'tx' | 'wallet' | 'token' | null>(null)
  const [result, setResult] = useState<RequirementCheck | null>(null)

  const checkRequirements = async (
    walletAddress: `0x${string}`,
    info: CampaignInfoForRequirements
  ): Promise<RequirementCheck> => {
    setChecking(true)
    
    try {
      let txCount = 0
      let walletAgeDays = 0
      let tokenBalance = 0

      // ============ STEP 1: CEK TRANSACTIONS ============
      setCheckingStep('tx')
      console.log('🔄 Step 1: Checking transactions...')
      
      try {
        const response = await fetch(
          `${EXPLORER_API}?module=account&action=txlist&address=${walletAddress}`
        )
        const data = await response.json()
        
        if (data.status === '1' && data.result && Array.isArray(data.result)) {
          txCount = data.result.length
          console.log(`✅ Transactions found: ${txCount}`)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
      
      const txCountOk = (info.minTransactions === 0) || (txCount >= (info.minTransactions || 0))
      
      // Update result sementara
      const step1Result = {
        txCount: txCountOk,
        walletAge: false,
        tokenBalance: false,
        allPassed: false,
        details: { txCount, walletAgeDays: 0, tokenBalance: 0 }
      }
      setResult(step1Result)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // ============ STEP 2: CEK WALLET AGE ============
      setCheckingStep('wallet')
      console.log('🔄 Step 2: Checking wallet age...')
      
      try {
        const response = await fetch(
          `${EXPLORER_API}?module=account&action=txlist&address=${walletAddress}`
        )
        const data = await response.json()
        
        if (data.status === '1' && data.result && Array.isArray(data.result) && data.result.length > 0) {
          let oldestTimestamp = Infinity
          for (const tx of data.result) {
            const ts = parseInt(tx.timeStamp)
            if (ts < oldestTimestamp) oldestTimestamp = ts
          }
          if (oldestTimestamp !== Infinity) {
            const now = Math.floor(Date.now() / 1000)
            walletAgeDays = Math.floor((now - oldestTimestamp) / (24 * 60 * 60))
            console.log(`✅ Wallet age: ${walletAgeDays} days`)
          }
        }
      } catch (error) {
        console.error('Error fetching wallet age:', error)
      }
      
      const walletAgeOk = (info.minWalletAgeDays === 0) || (walletAgeDays >= (info.minWalletAgeDays || 0))
      
      // Update result sementara
      const step2Result = {
        txCount: txCountOk,
        walletAge: walletAgeOk,
        tokenBalance: false,
        allPassed: false,
        details: { txCount, walletAgeDays, tokenBalance: 0 }
      }
      setResult(step2Result)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // ============ STEP 3: CEK TOKEN BALANCE ============
      setCheckingStep('token')
      console.log('🔄 Step 3: Checking token balance...')
      
      const hasTokenRequirement = info.requiredToken && 
        info.requiredToken !== '0x0000000000000000000000000000000000000000'

      if (hasTokenRequirement) {
        try {
          const response = await fetch(
            `${BLOCKSCOUT_API}/addresses/${walletAddress}/token-balances`
          )
          
          if (response.ok) {
            const balances = await response.json()
            const matchingToken = balances.find((item: any) => 
              item.token?.address?.toLowerCase() === info.requiredToken.toLowerCase()
            )
            
            if (matchingToken) {
              let rawBalance = matchingToken.value || matchingToken.balance || 0
              tokenBalance = Number(rawBalance)
              
              if (matchingToken.token?.decimals && tokenBalance > 0) {
                tokenBalance = tokenBalance / Math.pow(10, matchingToken.token.decimals)
              }
              console.log(`✅ Token balance: ${tokenBalance}`)
            }
          }
        } catch (error) {
          console.error('Error fetching token balance:', error)
        }
      }
      
      const tokenBalanceOk = !hasTokenRequirement || tokenBalance >= (info.minTokenBalance || 1)
      
      // ============ ✅ PERBAIKAN: allPassed dihitung dengan benar ============
      // allPassed = true HANYA jika SEMUA requirement terpenuhi
      // - Jika minTransactions = 0, anggap terpenuhi
      // - Jika minWalletAgeDays = 0, anggap terpenuhi  
      // - Jika tidak ada token requirement, anggap terpenuhi
      const allPassed = (info.minTransactions === 0 || txCountOk) && 
                        (info.minWalletAgeDays === 0 || walletAgeOk) && 
                        (!hasTokenRequirement || tokenBalanceOk)
      
      console.log("📊 Final Requirement Check:", {
        minTx: info.minTransactions,
        minWalletAge: info.minWalletAgeDays,
        hasTokenRequirement,
        txCount: `${txCount} >= ${info.minTransactions} = ${txCountOk}`,
        walletAge: `${walletAgeDays} >= ${info.minWalletAgeDays} = ${walletAgeOk}`,
        tokenBalance: `${tokenBalance} >= ${info.minTokenBalance || 1} = ${tokenBalanceOk}`,
        allPassed
      })
      
      // Reset checking step
      setCheckingStep(null)
      
      const finalResult: RequirementCheck = {
        txCount: txCountOk,
        walletAge: walletAgeOk,
        tokenBalance: tokenBalanceOk,
        allPassed,
        details: {
          txCount,
          walletAgeDays,
          tokenBalance,
        }
      }

      setResult(finalResult)
      return finalResult
    } catch (error) {
      console.error('❌ Error checking requirements:', error)
      setCheckingStep(null)
      const errorResult: RequirementCheck = {
        txCount: false,
        walletAge: false,
        tokenBalance: false,
        allPassed: false,
        details: {
          txCount: 0,
          walletAgeDays: 0,
          tokenBalance: 0,
        }
      }
      setResult(errorResult)
      return errorResult
    } finally {
      setChecking(false)
    }
  }

  return { checking, checkingStep, result, checkRequirements }
}