import 'dotenv/config';
import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("TraceCredit contract", function() {

  async function deployCreditFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const initialSupply = 10_000_000;
    const traceCredit = await ethers.deployContract("TraceCredit", [initialSupply]);
    await traceCredit.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { traceCredit, owner, addr1, addr2 };
  }

  it("Should assign the initial supply to the owner", async function () {
    const { traceCredit, owner } = await loadFixture(deployCreditFixture);

    const ownerBalance = await traceCredit.balanceOf(owner.address);
    const value = 10_000_000n * (10n ** 18n);
    expect(ownerBalance).to.equal(value);
  });

  it("Should transfer tokens between accounts", async function () {
    const { traceCredit, addr1, addr2 } = await loadFixture(deployCreditFixture);
    await traceCredit.transfer(addr1.address, 100);
    const addr1Balance = await traceCredit.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);

    await traceCredit.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await traceCredit.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it("Transfer tokens to a new ethers account", async function () {
    const { traceCredit } = await loadFixture(deployCreditFixture);
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
    const wallet = new ethers.Wallet(PRIVATE_KEY);

    await traceCredit.transfer(wallet.address, 100);
    const walletBalance = await traceCredit.balanceOf(wallet.address);
    expect(walletBalance).to.equal(100);
  })
});
