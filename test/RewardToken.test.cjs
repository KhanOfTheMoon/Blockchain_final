const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardToken Contract", function () {
  let RewardToken, rewardToken, owner, minter, otherAccount;

  beforeEach(async function () {
    [owner, minter, otherAccount] = await ethers.getSigners();

    RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await rewardToken.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await rewardToken.name()).to.equal("RewardToken");
      expect(await rewardToken.symbol()).to.equal("RWD");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const amount = ethers.parseUnits("100", 18);
      await rewardToken.mint(otherAccount.address, amount);
      
      expect(await rewardToken.balanceOf(otherAccount.address)).to.equal(amount);
    });

    it("Should allow designated minter to mint", async function () {
      await rewardToken.setMinter(minter.address);
      
      const amount = ethers.parseUnits("50", 18);
      await rewardToken.connect(minter).mint(otherAccount.address, amount);
      
      expect(await rewardToken.balanceOf(otherAccount.address)).to.equal(amount);
    });

    it("Should fail if unauthorized account tries to mint", async function () {
      const amount = ethers.parseUnits("100", 18);
      
      await expect(
        rewardToken.connect(otherAccount).mint(otherAccount.address, amount)
      ).to.be.revertedWith("Not minter");
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to set minter", async function () {
      await expect(
        rewardToken.connect(otherAccount).setMinter(otherAccount.address)
      ).to.be.revertedWithCustomError(rewardToken, "OwnableUnauthorizedAccount");
    });
  });
});