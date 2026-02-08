import hre from "hardhat";
const { ethers } = hre;

async function main() {
  // 1) Deploy RewardToken
  const Token = await ethers.getContractFactory("RewardToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddr = await token.getAddress();

  // 2) Deploy Crowdfunding 
  const CF = await ethers.getContractFactory("Crowdfunding");
  const cf = await CF.deploy(tokenAddr);
  await cf.waitForDeployment();

  const cfAddr = await cf.getAddress();

  // 3) Set minter
  const tx = await token.setMinter(cfAddr);
  await tx.wait();

  console.log("TOKEN_ADDRESS =", tokenAddr);
  console.log("CROWDFUNDING_ADDRESS =", cfAddr);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});