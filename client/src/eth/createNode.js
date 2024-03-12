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
  console.log("HERE 2");

  const forwarder = createInstance(provider);
  console.log("HERE 3");
  const from = await signer.getAddress();
  console.log("HERE 4");
  const data = nodeManager.interface.encodeFunctionData('createNode', [receiver, creditAmount, postId]);
  console.log("HERE 5");
  const to = await nodeManager.getAddress();
  console.log("HERE 6");

  const request = await signMetaTransactionRequest(signer.provider, forwarder, { to, from, data });
  console.log("HERE 10");

  return fetch(URL, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type' : 'application/json' }
  });
};

export async function createNewNode(nodeManager, provider, signer, receiver, creditAmount, postId) {
  console.log("HERE");
  return sendMetaTransaction(nodeManager, provider, signer, receiver, creditAmount, postId);
};