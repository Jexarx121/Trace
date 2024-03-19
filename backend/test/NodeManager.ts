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

    const nodeManager = await ethers.deployContract("NodeManager");
    await nodeManager.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { nodeManager, accounts, traceCredit };
  }

  it("Should create a node after transferring tokens to addr2", async function () {
    const { nodeManager, accounts, traceCredit } = await loadFixture(deployNodeFixture);
    const addr1 = accounts[1];
    const addr2 = accounts[2];
    const amountCredit = 50;
    const postIdStuff = 1;

    await traceCredit.transfer(addr1.address, 50);
    await traceCredit.connect(addr1).transfer(addr2.address, amountCredit);
    await nodeManager.connect(addr1).createNode(addr1.address, addr2.address, amountCredit, postIdStuff);

    const [sender, receiver, amount, postId] = await nodeManager.getNodeDetails(0);
    expect(sender).to.equal(addr1);
    expect(receiver).to.equal(addr2);
    expect(amount).to.equal(50);
    expect(postId).to.equal(1);
  });
});