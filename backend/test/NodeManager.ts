import 'dotenv/config'
import { ethers } from "hardhat";
import { signMetaTransactionRequest } from "../src/signer"

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

    const forwarderFactory = await ethers.getContractFactory("ERC2771Forwarder");
    const forwarder = await forwarderFactory.deploy('ERC2771Forwarder');
    const forwarderAddress = await forwarder.getAddress();

    const traceCreditAddress = await traceCredit.getAddress();
    const nodeManager = await ethers.deployContract("NodeManager", [traceCreditAddress, forwarderAddress]);
    await nodeManager.waitForDeployment();

    // creates the variables to be used in different tests to avoid duplication
    return { nodeManager, accounts, traceCredit, forwarder };
  }

  it.skip("Should create a node and transfer tokens from traceCredit contract to addr2", async function () {
    const { nodeManager, accounts, traceCredit } = await loadFixture(deployNodeFixture);
    const nodeManagerAddress = await nodeManager.getAddress();
    const addr1 = accounts[1];
    const addr2 = accounts[2];

    await traceCredit.transfer(addr1.address, 10);
    await traceCredit.transfer(nodeManagerAddress, 3000);

    await nodeManager.connect(addr1).createNode(addr2.address, 50, 1);

    const [sender, receiver, amount, postId] = await nodeManager.getNodeDetails(0);
    expect(sender).to.equal(addr1);
    expect(receiver).to.equal(addr2);
    expect(amount).to.equal(50);
    expect(postId).to.equal(1);
  });

  it("Should create a node through a meta-tx", async function () {
    const { nodeManager, accounts, forwarder, traceCredit } = await loadFixture(deployNodeFixture);
    const signer = accounts[2];
    const relayer = accounts[3];
    const receiver = accounts[4];

    console.log("Test forwarder");
    
    const tForwarder = await forwarder.connect(relayer);

    await traceCredit.transfer(nodeManager.getAddress(), 3000);
    const PRIVATE_KEY = "0x8528a64c98bbc9e8fbf2f714db810fb81f99c8af63c1c6d78c82fd2576ccaca7";
    const from = new ethers.Wallet(PRIVATE_KEY).address;
    const data = nodeManager.interface.encodeFunctionData('createNode', [receiver.address, 12, 2]);
    const to = await nodeManager.getAddress();

    const { request, signature } = await signMetaTransactionRequest(signer, tForwarder, { to, from, data});
    console.log(request);
    console.log(signature);

    // const gasLimit = (parseInt(request.gas) + 50000).toString();
    await forwarder.execute(request, signature).then((tx: { wait: () => any; }) => tx.wait());
    expect(await traceCredit.balanceOf(receiver).to.equal(12));
  });
});