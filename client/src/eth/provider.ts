import { ethers } from 'ethers';

const MAIN_RPC_ENDPOINT= 'https://ethereum-sepolia.publicnode.com/';

export function createProvider() {
  // number after endpoint signifies how many retries before failing
  const provider = new ethers.JsonRpcProvider(MAIN_RPC_ENDPOINT);
  return provider;
}