import { ethers } from "hardhat";

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe.skip("Credit contract", function () {
  async function deployCreditFixture() {
    const [ addr1, addr2 ] = await ethers.getSigners();
    const credit = await ethers.deployContract('Credit');
    await credit.waitForDeployment();

    return { credit, addr1, addr2 };
  }

  describe("Sign up", function () {
    it("Should initialise new user with 100 credits", async function () {
      const { credit, addr1 } = await loadFixture(deployCreditFixture);
      await credit.connect(addr1).signUp();
      const userCredit = await credit.getCredit((await addr1.getAddress()).toString());
      expect(userCredit).to.equal(100);
    });

    it("should revert if user is already signed up", async function () {
      const { credit, addr1 } = await loadFixture(deployCreditFixture);
      await credit.connect(addr1).signUp();
      await expect(credit.connect(addr1).signUp()).to.be.revertedWith("User already signed up");
    });
  });

  describe("Finish work", function () {
    it("should increase user's credits by 10 after finishing work", async function () {
      const { credit, addr1 } = await loadFixture(deployCreditFixture);
      await credit.connect(addr1).signUp();
      await credit.connect(addr1).finishWork((await addr1.getAddress()).toString(), 1, 10);
      const userCredit = await credit.getCredit((await addr1.getAddress()).toString());
      expect(userCredit).to.equal(110);
    });

    it("should emit WorkDone event", async function () {
      const { credit, addr1 } = await loadFixture(deployCreditFixture);
      await credit.connect(addr1).signUp();
      await expect(credit.connect(addr1).finishWork((await addr1.getAddress()).toString(), 1, 10))
        .to.emit(credit, "WorkDone")
        .withArgs((await addr1.getAddress()).toString(), 10, 1);
    });

    it("should revert if user does not exist", async function () {
      const { credit, addr2 } = await loadFixture(deployCreditFixture);
      await expect(credit.connect(addr2).finishWork((await addr2.getAddress()).toString(), 1, 10)).to.be.revertedWith("User does not exist");
    });
  });

  describe("Gain credit", function() {
    it("should increase user's credit by specified amount", async function () {
      const { credit, addr1 } = await loadFixture(deployCreditFixture);
      await credit.connect(addr1).signUp();
      await credit.connect(addr1).gainCredit(50);
      const userCredit = await credit.getCredit((await addr1.getAddress()).toString());
      expect(userCredit).to.equal(150);
    });

    it("should revert if user does not exist", async function () {
      const { credit, addr2 } = await loadFixture(deployCreditFixture);
      await expect(credit.connect(addr2).gainCredit(50)).to.be.revertedWith("User doesn't exist");
    });
  })
})