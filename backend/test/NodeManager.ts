import { ethers } from "hardhat";
import Security from "../helpers/functions";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");
const { vars } = require("hardhat/config");

describe("NodeManager Contract", function () {

  async function deployNodeFixture() {
    const security = new Security();
    const [owner, addr1, addr2] = await ethers.getSigners();

    const traceCredit = await ethers.deployContract("Credit");
    await traceCredit.waitForDeployment();

    // environment vars set with https://hardhat.org/hardhat-runner/docs/guides/configuration-variables
    const ADMIN_ENCRYPTED_ADDRESS = vars.get("ADMIN_ENCRYPTED_ADDRESS");
    const trustedForwarder = security.decrypt(ADMIN_ENCRYPTED_ADDRESS); 

    const traceCreditAddress = await traceCredit.getAddress();
    const nodeManager = await ethers.deployContract("NodeManager", [traceCredit.target, trustedForwarder]);
    await nodeManager.waitForDeployment();
    console.log("NodeManager contract deplopyed to: ", nodeManager.target);

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