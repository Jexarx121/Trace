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

  it.skip("Should assign the initial supply to the owner", async function () {
    const { traceCredit, owner } = await loadFixture(deployCreditFixture);

    const ownerBalance = await traceCredit.balanceOf(owner.address);
    const value = 10_000_000n * (10n ** 18n);
    expect(ownerBalance).to.equal(value);
  });

  it.skip("Should transfer tokens between accounts", async function () {
    const { traceCredit, addr1, addr2 } = await loadFixture(deployCreditFixture);
    await traceCredit.transfer(addr1.address, 100);
    const addr1Balance = await traceCredit.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);

    await traceCredit.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await traceCredit.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it.skip("Transfer tokens to a new ethers account", async function () {
    const { traceCredit } = await loadFixture(deployCreditFixture);
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
    const wallet = new ethers.Wallet(PRIVATE_KEY);

    await traceCredit.transfer(wallet.address, 100);
    const walletBalance = await traceCredit.balanceOf(wallet.address);
    expect(walletBalance).to.equal(100);
  });

  it.skip("Transfer tokens from one address to another using ethers account", async function () {
    const { traceCredit, owner, addr1, addr2 } = await loadFixture(deployCreditFixture);

    const MAIN_RPC_ENDPOINT= 'https://ethereum-sepolia-rpc.publicnode.com';
    const provider = new ethers.JsonRpcProvider(MAIN_RPC_ENDPOINT);
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
    const adminWallet = new ethers.Wallet(PRIVATE_KEY);
    const adminSigner = adminWallet.connect(provider);

    const wallet1 = ethers.Wallet.createRandom();
    const wallet1Signer = new ethers.Wallet(wallet1.privateKey);
    const wallet1TrueSigner = wallet1Signer.connect(provider);
    const wallet2 = ethers.Wallet.createRandom();
    const wallet2Signer = new ethers.Wallet(wallet2.privateKey);
    const wallet2TrueSigner = wallet2Signer.connect(provider);

    const transaction = await adminSigner.sendTransaction({
      to: wallet2TrueSigner.address,
      value: ethers.parseEther("0.001")
    });

    await transaction.wait();

    await traceCredit.transfer(wallet1TrueSigner.address, 100);
    await traceCredit.transfer(wallet2TrueSigner.address, 200);
    console.log("Address 1: ", wallet1TrueSigner.address)
    console.log("Address 2: ", wallet2TrueSigner.address);

    console.log("HERE");
    const approveTransaction = await traceCredit.connect(wallet2TrueSigner).approve(owner.address, 100, {gasLimit: 300000});
    await approveTransaction.wait();
    console.log(approveTransaction);
    const allowance = await traceCredit.allowance(wallet2TrueSigner.address, owner.address);
    console.log("Allowance: ", allowance.toString()); 
    const tx = await traceCredit.transferFrom(wallet2TrueSigner.address, wallet1TrueSigner.address, 100);
    console.log("HERE");
    
    // await traceCredit.transfer(addr1.address, 100);
    // await traceCredit.transfer(addr2.address, 200);

    // await traceCredit.connect(addr2).approve(owner.address, 100);
    // console.log(await traceCredit.allowance(addr2.address, owner.address));
    // await traceCredit.transferFrom(addr2.address, addr1.address, 100);

    // const wallet1Balance = await traceCredit.balanceOf(addr1);
    // const wallet2Balance = await traceCredit.balanceOf(addr2);

    const wallet1Balance = await traceCredit.balanceOf(wallet1TrueSigner);
    const wallet2Balance = await traceCredit.balanceOf(wallet2TrueSigner);
    const ownerBalance = await traceCredit.balanceOf(owner);
    expect(wallet1Balance).to.equal(200);
    expect(wallet2Balance).to.equal(100);
  })
});
