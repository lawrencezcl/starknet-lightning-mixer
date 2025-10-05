import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format address for display
export function formatAddress(address: string, length: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

// Format amount with proper decimal places
export function formatAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

// Format token amount with symbol
export function formatTokenAmount(amount: string | number, symbol: string, decimals: number = 6): string {
  return `${formatAmount(amount, decimals)} ${symbol}`
}

// Calculate fee
export function calculateFee(amount: number, feeRate: number): number {
  return amount * feeRate
}

// Calculate net amount after fee
export function calculateNetAmount(amount: number, feeRate: number): number {
  return amount - calculateFee(amount, feeRate)
}

// Generate random ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

// Validate address format
export function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address)
}

// Convert hex to string
export function hexToString(hex: string): string {
  if (!hex || !hex.startsWith('0x')) return hex
  try {
    return Buffer.from(hex.replace('0x', ''), 'hex').toString()
  } catch {
    return hex
  }
}

// Convert string to hex
export function stringToHex(str: string): string {
  return '0x' + Buffer.from(str).toString('hex')
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

// Format duration in seconds to human readable format
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return '< 1m'
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Check if transaction is recent (within last 24 hours)
export function isRecentTransaction(timestamp: number): boolean {
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return (now - timestamp) < twentyFourHours
}

// Get privacy score based on settings
export function getPrivacyScore(settings: import('@/types/mixer').PrivacySettings): number {
  let score = 50 // Base score

  // Add points for privacy level
  switch (settings.privacyLevel) {
    case 'low':
      score += 10
      break
    case 'medium':
      score += 25
      break
    case 'high':
      score += 40
      break
  }

  // Add points for time delay
  if (settings.delayHours >= 6) score += 10
  else if (settings.delayHours >= 2) score += 5

  // Add points for splitting
  if (settings.splitIntoMultiple && settings.splitCount >= 3) score += 10
  else if (settings.splitIntoMultiple && settings.splitCount >= 2) score += 5

  // Add points for random amounts
  if (settings.useRandomAmounts) score += 5

  return Math.min(score, 100)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}