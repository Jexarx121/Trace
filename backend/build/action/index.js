'use strict';

const { Defender } = require('@openzeppelin/defender-sdk');
const { ethers } = require('ethers');

const FORWARDER_ABI = require('../src/forwarder').forwarderABI;
const FORWARDER_ADDRESS= require('../deploy.json').forwarder;

// Tutorial from https://docs.openzeppelin.com/defender/v2/guide/meta-tx

async function relay(forwarder, request, signature, whitelist) {
  // Users can have roles and only validate their request based on roles in whitelist
  const accepts = !whitelist || whitelist.includes(request.to);
  if (!accepts) throw new Error(`Rejected requrest to ${request.to}`);

  const valid = await forwarder.verify(request, signature);
  if (!valid) throw new Error('Invalid request.');

  const gasLimit = (parseInt(request.gas) + 50000).toString();
  return await forwarder.execute(request, signature, { gasLimit });
}
async function handler(event) {
  // Parse webhook payload
  if (!event.request || !event.request.body) throw new Error(`Missing payload`);
  const { request, signature } = event.request.body;
  console.log('Relaying', request);

  // Initialize Relayer provider and signer, and forwarder contract
  const creds = { ... event };

  const client = new Defender(creds);

  const provider = client.relaySigner.getProvider();
  const signer = client.relaySigner.getSigner(provider, { speed: 'fast' });
  const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ABI, signer);

  // Relay transaction!
  const tx = await relay(forwarder, request, signature);
  console.log(`Sent meta-tx: ${tx.hash}`);
  return { txHash: tx.hash };
}
module.exports = {
  handler,
  relay
};
