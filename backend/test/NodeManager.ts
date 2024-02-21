import { ethers } from "hardhat";
import { decrypt } from "../../client/src/helpers/functions"

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("NodeManager Contract", function () {

  async function deployNodeFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const traceCredit = await ethers.deployContract("Credit");
    await traceCredit.waitForDeployment();

    const trustedForwarder = decrypt("dce3dbc62fd48a368cc3d864f80d4cf23a094e9a1929596d1d8b369c2c0c01525aaebb365a784f958a8a8e122b45b60e26047f9f17f113b66e7c01fe1428df36f02f24003c1da7305234407fbebb8d5d"); 
    const nodeManager = await ethers.deployContract("NodeManager", [traceCredit.address, trustedForwarder]);
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