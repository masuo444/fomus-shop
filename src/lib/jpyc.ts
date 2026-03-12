import { ethers } from 'ethers'
import siteConfig from '@/site.config'

// ERC-20 minimal ABI for Transfer events and balanceOf
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

const RPC_TIMEOUT_MS = 10000

export async function getProvider(): Promise<ethers.JsonRpcProvider> {
  const urls = [siteConfig.jpyc.rpcUrl, ...siteConfig.jpyc.fallbackRpcUrls]

  for (const url of urls) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      // Test the connection with a timeout
      await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('RPC timeout')), RPC_TIMEOUT_MS)
        ),
      ])
      return provider
    } catch (err) {
      console.warn(`RPC failed for ${url}:`, err)
      continue
    }
  }

  throw new Error('All RPC endpoints failed')
}

export function getJpycContract(provider: ethers.JsonRpcProvider) {
  return new ethers.Contract(siteConfig.jpyc.contractAddress, ERC20_ABI, provider)
}

/**
 * Verify a JPYC transfer on Polygon.
 * Checks that a Transfer event exists where:
 * - `to` matches our wallet address
 * - `value` >= expected amount (in JPYC's smallest unit, 18 decimals)
 * - transaction is within the specified block range
 */
export async function verifyJpycTransfer(params: {
  txHash: string
  expectedAmount: number // in JPY (1 JPYC = 1 JPY)
}): Promise<{
  verified: boolean
  from?: string
  amount?: number
  error?: string
}> {
  const { txHash, expectedAmount } = params
  const walletAddress = siteConfig.jpyc.walletAddress.toLowerCase()

  if (!walletAddress) {
    return { verified: false, error: 'JPYC wallet not configured' }
  }

  try {
    const provider = await getProvider()
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt) {
      return { verified: false, error: 'Transaction not found' }
    }

    if (receipt.status !== 1) {
      return { verified: false, error: 'Transaction failed' }
    }

    // Parse Transfer events from the JPYC contract
    const contract = getJpycContract(provider)
    const transferEvent = contract.interface.getEvent('Transfer')
    if (!transferEvent) {
      return { verified: false, error: 'Contract ABI error' }
    }

    const jpycAddress = siteConfig.jpyc.contractAddress.toLowerCase()

    for (const log of receipt.logs) {
      // Only check logs from the JPYC contract
      if (log.address.toLowerCase() !== jpycAddress) continue

      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        })

        if (!parsed || parsed.name !== 'Transfer') continue

        const to = parsed.args[1].toLowerCase()
        const value = parsed.args[2] as bigint

        if (to === walletAddress) {
          // JPYC has 18 decimals, so 1 JPYC = 10^18
          const amountJpy = Number(ethers.formatUnits(value, 18))

          if (amountJpy >= expectedAmount) {
            return {
              verified: true,
              from: parsed.args[0],
              amount: amountJpy,
            }
          } else {
            return {
              verified: false,
              error: `Amount insufficient: sent ${amountJpy} JPYC, expected ${expectedAmount} JPYC`,
            }
          }
        }
      } catch {
        // Not a Transfer event from JPYC, skip
        continue
      }
    }

    return { verified: false, error: 'No matching JPYC transfer found in transaction' }
  } catch (err) {
    console.error('JPYC verification error:', err)
    return { verified: false, error: 'Verification failed' }
  }
}
