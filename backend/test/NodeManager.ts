import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe.skip("NodeManager Contract", function () {

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
    const amountPeople = 10;
    const hoursWorkedStuff = 10 

    await traceCredit.transfer(addr1.address, 50);
    await traceCredit.connect(addr1).transfer(addr2.address, amountCredit);
    await nodeManager.connect(addr1).createNode(postIdStuff, addr1.address, addr2.address, amountCredit, hoursWorkedStuff, amountPeople);

    const [sender, receiver, creditAmount, hoursWorked, amountOfPeople] = await nodeManager.getNodeDetails(postIdStuff);
    expect(sender).to.equal(addr1);
    expect(receiver).to.equal(addr2);
    expect(creditAmount).to.equal(50);
    expect(hoursWorked).to.equal(10);
    expect(amountOfPeople).to.equal(10);
  });
});