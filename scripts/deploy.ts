import { ethers } from "hardhat";

async function main() {
  const gibaCoin = await ethers.deployContract("GibaCoin");
  await gibaCoin.waitForDeployment();
  const address = await gibaCoin.getAddress();

  console.log(`Contract deployed at ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
