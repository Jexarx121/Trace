'use strict';

const { Defender } = require('@openzeppelin/defender-sdk');
const { ethers } = require('ethers');

const { forwarderABI } = require('../src/forwarder');
const FORWARDER_ADDRESS= require('../deploy.json').forwarder;

// Tutorial from https://docs.openzeppelin.com/defender/v2/guide/meta-tx

async function relay(forwarder, request, signature) {
  // Users can have roles and only validate their request based on roles in whitelist
  // Future thing to do 

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
  const forwarder = new ethers.Contract(FORWARDER_ADDRESS, forwarderABI, signer);

  // Relay transaction!
  const tx = await relay(forwarder, request, signature);
  console.log(`Sent meta-tx: ${tx.hash}`);
  return { txHash: tx.hash };
}

module.exports = {
  handler,
  relay
};
