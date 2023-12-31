import { ethers } from "hardhat";

async function main() {
  const bitProtoCoin = await ethers.deployContract("BitProtoCoin");
  await bitProtoCoin.waitForDeployment();
  const address = await bitProtoCoin.getAddress();

  console.log(`Contract deployed at ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
