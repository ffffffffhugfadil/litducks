import { keccak256, encodePacked, type Address } from 'viem'

function hashLeaf(address: Address): `0x${string}` {
  return keccak256(encodePacked(['address'], [address]))
}

function hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  const sorted = a <= b ? [a, b] : [b, a]
  return keccak256(encodePacked(['bytes32', 'bytes32'], [sorted[0], sorted[1]]))
}

export function generateMerkleRoot(addresses: Address[]): `0x${string}` {
  if (addresses.length === 0) return '0x0000000000000000000000000000000000000000000000000000000000000000'

  let leaves: `0x${string}`[] = addresses.map(hashLeaf)

  while (leaves.length > 1) {
    const newLeaves: `0x${string}`[] = []
    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 >= leaves.length) {
        newLeaves.push(leaves[i])
      } else {
        newLeaves.push(hashPair(leaves[i], leaves[i + 1]))
      }
    }
    leaves = newLeaves
  }

  return leaves[0]
}

export function getMerkleProof(addresses: Address[], target: Address): `0x${string}`[] {
  if (addresses.length === 0) return []

  let leaves: `0x${string}`[] = addresses.map(hashLeaf)
  const targetLeaf = hashLeaf(target)
  const proof: `0x${string}`[] = []

  let targetIndex = leaves.findIndex(l => l === targetLeaf)
  if (targetIndex === -1) return []

  while (leaves.length > 1) {
    const newLeaves: `0x${string}`[] = []
    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 >= leaves.length) {
        newLeaves.push(leaves[i])
        if (i === targetIndex) targetIndex = Math.floor(i / 2)
      } else {
        newLeaves.push(hashPair(leaves[i], leaves[i + 1]))
        if (i === targetIndex) {
          proof.push(leaves[i + 1])
          targetIndex = Math.floor(i / 2)
        } else if (i + 1 === targetIndex) {
          proof.push(leaves[i])
          targetIndex = Math.floor(i / 2)
        }
      }
    }
    leaves = newLeaves
  }

  return proof
}
