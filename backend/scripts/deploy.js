require('dotenv').config();
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require('@openzeppelin/defender-relay-client/lib/ethers');
const { ethers, defender } = require('hardhat');
const { writeFileSync } = require('fs');
require("@nomicfoundation/hardhat-ethers");

// tutorial from https://docs.openzeppelin.com/defender/v2/guide/meta-tx
async function main() {
  const credentials = { apiKey: process.env.RELAYER_KEY, apiSecret: process.env.RELAYER_SECRET };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, { speed: 'fast'});

  // TraceCredit contract deployment
  const initialSupply = "10000000";
  const traceCreditFactory = await ethers.getContractFactory("TraceCredit", { signer: relaySigner});
  const traceCredit = await defender.deployContract(traceCreditFactory, [initialSupply]);
  await traceCredit.waitForDeployment();
  const traceCreditAddress = await traceCredit.getAddress();

  // NodeManager contract deployment
  const nodeManagerFactory = await ethers.getContractFactory("NodeManager", { signer: relaySigner });
  const nodeManager = await defender.deployContract(nodeManagerFactory);
  await nodeManager.waitForDeployment();
  const nodeManagerAddress = await nodeManager.getAddress();

  // check if thing is deployed first 
  writeFileSync('deploy.json', JSON.stringify({
    nodeManager: nodeManagerAddress,
    // traceCredit: traceCreditAddress
  }, null, 2));

  console.log('Contract deployed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
