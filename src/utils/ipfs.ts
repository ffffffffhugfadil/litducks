// src/utils/ipfs.ts
export function ipfsToUrl(ipfsUrl: string | undefined): string {
  if (!ipfsUrl) return ''
  

  const GATEWAY = 'https://gateway.pinata.cloud/ipfs/'
  
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', GATEWAY)
  }
  
  if (ipfsUrl.startsWith('/ipfs/')) {
    return ipfsUrl.replace('/ipfs/', GATEWAY)
  }
  
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl
  }
  
  return ipfsUrl
}
