const ethSigUtil = require('eth-sig-util');

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
    return ethSigUtil.signTypedMessage(privateKey, { data });
  };

  // Can potentially add other inputs for different EIP712 inputs
};

async function buildRequest(forwarder, input) {
  const nonce = await forwarder.getNonce(input.from).then(nonce => nonce.toString());
  return { value: 0, gas: 1e6, nonce, ...input };
};

async function buildTypedData(forwarder, request) {
  const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);
  const forwarderAddress = await forwarder.getAddress();
  const typeData = getTransactionTypeData(chainId, forwarderAddress);
  return { ...typeData, message: request };
};

async function signMetaTransactionRequest(signer, forwarder, input) {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypedData(signer, input.from, toSign);
  return { signature, request };
}

module.exports = {
  signMetaTransactionRequest
}
