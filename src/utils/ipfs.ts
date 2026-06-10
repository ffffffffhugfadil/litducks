// src/utils/ipfs.ts
export function ipfsToUrl(ipfsUrl: string | undefined): string {
  if (!ipfsUrl) return ''
  

  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl
  }
  

  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
  }
  

  if (ipfsUrl.startsWith('/ipfs/')) {
    return ipfsUrl.replace('/ipfs/', 'https://gateway.pinata.cloud/ipfs/')
  }
  

  if (ipfsUrl.startsWith('Qm') && ipfsUrl.length === 46) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`
  }
  
  return ipfsUrl
}
