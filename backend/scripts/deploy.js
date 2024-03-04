require('dotenv').config();
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require('@openzeppelin/defender-relay-client/lib/ethers');
const { ethers, defender } = require('hardhat');
const { writeFileSync } = require('fs');
require("@nomicfoundation/hardhat-ethers");

// tutorial from https://docs.openzeppelin.com/defender/v1/guide-metatx
async function main() {
  const credentials = { apiKey: process.env.RELAYER_KEY, apiSecret: process.env.RELAYER_SECRET };
  const initialSupply = 10000000;
  const TRUSTED_FORWARDER = process.env.RELAYER_AUTO_ADDRESS;

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, { speed: 'fast'});

  const traceCreditFactory = await ethers.getContractFactory("TraceCredit", { signer: relaySigner});
  const traceCredit = await defender.deployContract(traceCreditFactory, [initialSupply]);
  await traceCredit.waitForDeployment();

  // const traceCredit = await traceCreditFactory.deploy(initialSupply);
  const traceCreditAddress = await traceCredit.getAddress();

  const nodeManagerFactory = await ethers.getContractFactory("NodeManager", { signer: relaySigner });
  // const nodeManager = await nodeManagerFactory.deploy(traceCreditAddress, TRUSTED_FORWARDER);
  // const nodeManagerAddress = await nodeManager.getAddress();

  const nodeManager = await defender.deployContract(nodeManagerFactory, [traceCreditAddress, TRUSTED_FORWARDER]);
  const nodeManagerAddress = await nodeManager.getAddress();

  // check if thing is deployed first 
  writeFileSync('deploy.json', JSON.stringify({
    nodeManager: nodeManagerAddress,
  }, null, 2));

  console.log('Contract deployed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
