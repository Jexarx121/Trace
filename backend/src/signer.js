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
  { name: 'nonce', type: 'uint256'},
  { name: 'data', type: 'bytes'}
];

const getTransactionTypeData = (chainId, verifyingContract) => {
  return {
    types: {
      EIP712,
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

async function signTypedData(signer, data) {
  if (typeof(signer) === 'string') {
    const privateKey = Buffer.from(signer.replace(/^0x/, ''), 'hex');
    return signer._signTypedData(privateKey, { data });
  };

  // Can potentially add other inputs for different EIP712 inputs
};

async function buildRequest(forwarder, input) {
  const nonce = (await forwarder.nonces(input.from)).toString();
  return { value: 0, gas: 1e6, nonce, ...input };
};

async function buildTypedData(forwarder, request, provider) {
  const chainId = await provider.getNetwork().then(n => n.chainId);
  const forwarderAddress = await forwarder.getAddress();
  const typeData = getTransactionTypeData(chainId, forwarderAddress);
  return { ...typeData, message: request };
};

export async function signMetaTransactionRequest(signer, forwarder, input, provider) {
  const request = await buildRequest(forwarder, input);
  console.log("HERE 7");
  const toSign = await buildTypedData(forwarder, request, provider);
  console.log("HERE 8");
  const signature = await signTypedData(signer, toSign);
  console.log("HERE 9");
  return { signature, request };
};
