import 'dotenv/config'
import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("NodeManager Contract", function () {

  async function deployNodeFixture() {
    const accounts = await ethers.getSigners();

    const initialSupply = 10000;
    const traceCredit = await ethers.deployContract("TraceCredit", [initialSupply]);
    await traceCredit.waitForDeployment();

    const forwarderFactory = await ethers.getContractFactory("ERC2771Forwarder");
    const forwarder = await forwarderFactory.deploy('ERC2771Forwarder');
    const forwarderAddress = await forwarder.getAddress();

    const traceCreditAddress = await traceCredit.getAddress()
    const nodeManager = await ethers.deployContract("NodeManager", [traceCreditAddress, forwarderAddress]);
    await nodeManager.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { nodeManager, accounts, traceCredit, forwarder };
  }

  it.skip("Should create a node and transfer tokens from traceCredit contract to addr2", async function () {
    const { nodeManager, accounts, traceCredit } = await loadFixture(deployNodeFixture);
    const nodeManagerAddress = await nodeManager.getAddress();
    const addr1 = accounts[1];
    const addr2 = accounts[2];

    await traceCredit.transfer(addr1.address, 10);
    await traceCredit.transfer(nodeManagerAddress, 3000);

    await nodeManager.connect(addr1).createNode(addr2.address, 50, 1);

    const [sender, receiver, amount, postId] = await nodeManager.getNodeDetails(0);
    expect(sender).to.equal(addr1);
    expect(receiver).to.equal(addr2);
    expect(amount).to.equal(50);
    expect(postId).to.equal(1);
  });

  it("Should create a node through a meta-tx", async function () {

  });
});