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
  const initialSupply = 10000000;

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, { speed: 'fast'});

  // TraceCredit contract deployment
  const traceCreditFactory = await ethers.getContractFactory("TraceCredit", { signer: relaySigner});
  const traceCredit = await defender.deployContract(traceCreditFactory, [initialSupply]);
  await traceCredit.waitForDeployment();
  const traceCreditAddress = await traceCredit.getAddress();

  // // Trusted forwarder deployment
  // const forwarderFactory = await ethers.getContractFactory("ERC2771Forwarder", { signer : relaySigner});
  // const forwarder = await defender.deployContract(forwarderFactory, ["ERC2771Forwarder"]);
  // await forwarder.waitForDeployment();
  // const forwarderAddress = await forwarder.getAddress();

  // // NodeManager contract deployment
  // const nodeManagerFactory = await ethers.getContractFactory("NodeManager", { signer: relaySigner });
  // const nodeManager = await defender.deployContract(nodeManagerFactory, [traceCreditAddress, forwarderAddress]);
  // await nodeManager.waitForDeployment();
  // const nodeManagerAddress = await nodeManager.getAddress();

  // check if thing is deployed first 
  writeFileSync('deploy.json', JSON.stringify({
    // nodeManager: nodeManagerAddress,
    // forwarder: forwarderAddress,
    traceCredit: traceCreditAddress
  }, null, 2));

  console.log('Contract deployed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
