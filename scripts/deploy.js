const RewardToken = await ethers.getContractFactory("RewardToken");
const rewardToken = await RewardToken.deploy();
await rewardToken.waitForDeployment();

const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
const crowdfunding = await Crowdfunding.deploy(await rewardToken.getAddress());
await crowdfunding.waitForDeployment();


await rewardToken.setMinter(await crowdfunding.getAddress());
