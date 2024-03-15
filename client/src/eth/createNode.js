import { ethers } from "ethers";
import { createInstance } from "./forwarder";
import { signMetaTransactionRequest } from '../../../backend/src/signer.js';

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
  console.log(request.request);
  console.log("Signature: ", request.signature.length);
  const sig = ethers.Signature.from(request.signature);
  const finalSignature = ethers.concat([sig.r, sig.s, sig.v]);

  // return fetch(URL, {
  //   method: 'POST',
  //   body: JSON.stringify(request),
  //   headers: { 'Content-Type' : 'application/json' }
  // });

};

export async function createNewNode(nodeManager, provider, signer, receiver, creditAmount, postId) {
  return sendMetaTransaction(nodeManager, provider, signer, receiver, creditAmount, postId);
};