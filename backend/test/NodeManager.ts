import 'dotenv/config'
import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");
const { vars } = require("hardhat/config");

describe("NodeManager Contract", function () {

  async function deployNodeFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const initialSupply = 10000;
    const traceCredit = await ethers.deployContract("TraceCredit", [initialSupply]);
    await traceCredit.waitForDeployment();

    const relayerAddress = process.env.RELAYER_ADDRESS;
    const traceCreditAddress = await traceCredit.getAddress()

    const nodeManager = await ethers.deployContract("NodeManager", [traceCreditAddress, relayerAddress]);
    await nodeManager.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { nodeManager, owner, addr1, addr2, traceCredit };
  }

  it("Should create a node and transfer tokens", async function () {
    const { nodeManager, addr1, addr2, traceCredit } = await loadFixture(deployNodeFixture);
    const nodeManagerAddress = await nodeManager.getAddress();

    await traceCredit.transfer(addr1.address, 100);
    await traceCredit.transfer(nodeManagerAddress, 3000);

    // Approve the nodeManager contract to spend tokens on behalf of addr1
    await traceCredit.connect(addr1).approve(nodeManagerAddress, 50);
    await nodeManager.connect(addr1).createNode(addr2.address, 50, 1);

    const [sender, receiver, amount, postId] = await nodeManager.getNodeDetails(0);
    expect(sender).to.equal(addr1);
    expect(receiver).to.equal(addr2);
    expect(amount).to.equal(50);
    expect(postId).to.equal(1);
  });
});