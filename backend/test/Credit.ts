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

  describe("Deployment", function () {
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

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function() {
      const { traceCredit, owner, addr1, addr2 } = await loadFixture(deployCreditFixture);
  
       // Transfer 50 tokens from owner to addr1
       await expect(
        traceCredit.transfer(addr1.address, 50)
      ).to.changeTokenBalances(traceCredit, [owner, addr1], [-50, 50]);
  
      // Transfer 50 tokens from addr1 to addr2
      await expect(
        traceCredit.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(traceCredit, [addr1, addr2], [-50, 50]);
    });
  });

  it("Should emit Transfer events", async function () {
    const { traceCredit, owner, addr1, addr2 } = await loadFixture(deployCreditFixture);

    // Transfer 50 tokens from owner to addr1
    await expect(traceCredit.transfer(addr1.address, 50))
      .to.emit(traceCredit, "Transfer")
      .withArgs(owner.address, addr1.address, 50);

    // Transfer 50 tokens from addr1 to addr2
    await expect(traceCredit.connect(addr1).transfer(addr2.address, 50))
      .to.emit(traceCredit, "Transfer")
      .withArgs(addr1.address, addr2.address, 50);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const { traceCredit, owner, addr1 } = await loadFixture(deployCreditFixture);

    const initialOwnerBalance = await traceCredit.balanceOf(owner.address);

    // Try to send 1 token from addr1 (0 tokens) to owner.
    // `require` will evaluate false and revert the transaction.
    await expect(
      traceCredit.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWith("Not enough credit");

    // Owner balance shouldn't have changed.
    expect(await traceCredit.balanceOf(owner.address)).to.equal(
      initialOwnerBalance
    );
  })
});
