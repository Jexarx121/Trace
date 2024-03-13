import { ethers } from "ethers";
import { createInstance } from "./forwarder";
import { signMetaTransactionRequest } from '../../../backend/src/signer.js';

// Helper function to create data for createNode function call (assuming function arguments)
// function getCreateNodeData(receiver, amount, postId) {
//   const functionFragment = ethers.utils.formatFunctionFragment('createNode(address,uint256,uint256)');
//   const encoded = ethers.utils.encodeFunctionData(functionFragment, [receiver, amount, postId]);
//   return encoded;
// }

// export async function buildRequest(signer, contractAddress, receiver, amount, postId, provider) {
//   const functionAbi = await getFunctionABI(contractAddress, provider); // Fetch ABI dynamically
//   const functionArgs = [receiver, amount, postId];
//   const tx = await signer.sendTransaction({
//     from: signer.address,
//     to: contractAddress,
//     gasPrice: await provider.getGasPrice(), // Get current gas price
//     gasLimit: 21000, // adjust gas limit as needed
//     data: ethers.utils.encodeFunctionData(functionAbi, functionArgs),
//   });

//   return tx;
// };

async function sendMetaTransaction(nodeManager, provider, signer, receiver, creditAmount, postId) {
  const URL = import.meta.env.VITE_DEFENDER_ACTION_WEBHOOK_URL;
  if (!URL) {
    console.error("Missing url");
  };

  const forwarder = createInstance(provider);
  const from = await signer.getAddress();
  const data = nodeManager.interface.encodeFunctionData('createNode', [receiver, creditAmount, postId]);
  const to = await nodeManager.getAddress();

  const request = await signMetaTransactionRequest(signer, forwarder, { to, from, data }, provider);
  console.log(JSON.stringify(request));

  return fetch(URL, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type' : 'application/json' }
  });

};

export async function createNewNode(nodeManager, provider, signer, receiver, creditAmount, postId) {
  return sendMetaTransaction(nodeManager, provider, signer, receiver, creditAmount, postId);
};