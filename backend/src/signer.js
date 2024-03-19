import { ethers } from 'ethers';

const EIP712 = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

const forwardRequest = [
  { name: 'from', type: 'address'},
  { name: 'to', type: 'address'},
  { name: 'value', type: 'uint256'},
  { name: 'gas', type: 'uint256'},
  // { name: 'deadline', type: 'uint48'},
  { name: 'nonce', type: 'uint256'},
  { name: 'data', type: 'bytes'}
];

const getTransactionTypeData = (chainId, verifyingContract) => {
  return {
    types: {
      forwardRequest,
    },
    domain: {
      name: 'ERC2771Forwarder',
      version: '0.0.1',
      chainId,
      verifyingContract,
    },
    primaryType: 'forwardRequest',
  };
};

async function signTypedDataFunction(signer, data) {
  if (typeof(signer.address) === 'string') {
    const privateKey = Buffer.from(signer.address.replace(/^0x/, ''), 'hex');
    const signature = await signer.signTypedData(data.domain, data.types, data.message);
    return signature;
  };

  // Can potentially add other inputs for different EIP712 inputs
};

async function buildRequest(forwarder, input) {
  const nonce = parseInt((await forwarder.nonces(input.from)).toString());
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  return { value: 0, gas: 1e6, deadline, nonce, ...input };
};

async function buildTypedData(forwarder, request, provider) {
  const chainId = await provider.getNetwork().then(n => n.chainId);
  const forwarderAddress = await forwarder.getAddress();
  const typeData = getTransactionTypeData(chainId, forwarderAddress);
  return { ...typeData, message: request };
};

export async function signMetaTransactionRequest(signer, forwarder, input, provider) {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request, provider);
  const signature = await signTypedDataFunction(signer, toSign);
  return { signature, request };
};
