// src/utils/ipfs.ts
export function ipfsToUrl(ipfsUrl: string | undefined): string {
  if (!ipfsUrl) return ''
  
  // Gateway yang paling stabil
  const GATEWAY = 'https://ipfs.io/ipfs/'
  
  // Handle berbagai format IPFS URL
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', GATEWAY)
  }
  
  if (ipfsUrl.startsWith('/ipfs/')) {
    return ipfsUrl.replace('/ipfs/', GATEWAY)
  }
  
  // Jika sudah berupa HTTP URL, return asli
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl
  }
  
  // Jika hanya CID (mulai dengan Qm atau panjang 46 karakter)
  if (ipfsUrl.length === 46 || ipfsUrl.startsWith('Qm')) {
    return `${GATEWAY}${ipfsUrl}`
  }
  
  return ipfsUrl
}