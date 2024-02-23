import { ethers } from "hardhat";
import Security from "../helpers/functions";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("NodeManager Contract", function () {

  async function deployNodeFixture() {
    const security = new Security();
    const [owner, addr1, addr2] = await ethers.getSigners();

    const traceCredit = await ethers.deployContract("Credit");
    await traceCredit.waitForDeployment();

    const trustedForwarder = security.decrypt(process.env.ADMIN_ACCOUNT!); 
    const nodeManager = await ethers.deployContract("NodeManager", [traceCredit, trustedForwarder]);
    await nodeManager.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { nodeManager, owner, addr1, addr2 };
  }

  it("Should create a node and transfer tokens", async function () {
    const { nodeManager, addr1, addr2 } = await loadFixture(deployNodeFixture);
    await nodeManager.transfer(nodeManager.address, 100);

    await nodeManager.connect(addr1).createNode(addr2.address, 50, 1);

    const [sender, receiver, amount, postId] = await nodeManager.getNodeDetails(0);
    expect(sender).to.equal(addr1.address);
    expect(receiver).to.equal(addr2.address);
    expect(amount).to.equal(50);
    expect(postId).to.equal(1);
  });
});