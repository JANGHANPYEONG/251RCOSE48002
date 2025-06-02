import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const Staking = await ethers.getContractFactory("Staking");
  console.log("Deploying Staking contract...");
  const staking = await Staking.deploy();

  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("Staking contract deployed to:", stakingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 