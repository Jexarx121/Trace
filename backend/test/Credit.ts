import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("Credit contract", function() {

  async function deployCreditFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const traceCredit = await ethers.deployContract("Credit");
    await traceCredit.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { traceCredit, owner, addr1, addr2 };
  }

  it("Should set the right owner", async function () {
    const { traceCredit, owner } = await loadFixture(deployCreditFixture);
    expect(await traceCredit.owner()).to.equal(owner.address);
  })

  it("Deployment should assign the total supply of credits to the owner", async function () {
    const { traceCredit, owner } = await loadFixture(deployCreditFixture);
    const ownerBalance = await traceCredit.balanceOf(owner.address);
    expect(await traceCredit.totalSupply()).to.equal(ownerBalance);
  });
});
