const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding", function () {
  let crowdfunding, rewardToken, owner, creator, donor;
  const GOAL = ethers.parseEther("2");
  const DURATION = 3600;

  beforeEach(async function () {
    [owner, creator, donor] = await ethers.getSigners();
    
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();
    
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy(await rewardToken.getAddress());
    await crowdfunding.waitForDeployment();

    await rewardToken.setMinter(await crowdfunding.getAddress());
  });

  it("Should create a campaign", async function () {
    const tx = await crowdfunding.connect(creator).createCampaign("Test", GOAL, DURATION);
    await tx.wait();
    
    const campaign = await crowdfunding.campaigns(1);
    expect(campaign.title).to.equal("Test");
  });

  it("Should allow contribution", async function () {
    await crowdfunding.connect(creator).createCampaign("Test", GOAL, DURATION);
    const amount = ethers.parseEther("1");
    
    await expect(crowdfunding.connect(donor).contribute(1, { value: amount }))
      .to.emit(crowdfunding, "Contributed");
  });
});