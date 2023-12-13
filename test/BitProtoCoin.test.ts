import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BitProtoCoin Tests", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const BPC = await ethers.getContractFactory("BitProtoCoin");
    const bitProtoCoin = await BPC.deploy();
    return { bitProtoCoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await bitProtoCoin.name();
    expect(name).to.equal("BitProtoCoin");
  });

  it("Should have correct symbol (₿PC)", async function () {
    const B_SIGN_UNICODE = '\u{20BF}';
    const BPC_SYMBOL = `${B_SIGN_UNICODE}PC`;
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await bitProtoCoin.symbol();
    expect(symbol).to.equal(BPC_SYMBOL);
    expect(symbol).to.equal("₿PC");
  });

  it("Should have correct decimals", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await bitProtoCoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have total suply", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSuply = await bitProtoCoin.totalSupply();
    expect(totalSuply).to.equal(10000000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await bitProtoCoin.balanceOf(owner.address);
    expect(balance).to.equal(10000000n * 10n ** 18n);
  });

  it("Should transfer balance", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalance = await bitProtoCoin.balanceOf(owner.address);
    const otherAccountBalance = await bitProtoCoin.balanceOf(otherAccount.address);
    await bitProtoCoin.transfer(otherAccount.address, 1n);
    const ownerBalanceAfter = await bitProtoCoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await bitProtoCoin.balanceOf(otherAccount.address);
    expect(ownerBalance).to.equal(10000000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((10000000n * 10n ** 18n) - 1n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(1n);
  });

  it("Should NOT transfer (balance)", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = bitProtoCoin.connect(otherAccount);
    await expect(instance.transfer(owner.address, 1n))
      .to.be.revertedWithCustomError(bitProtoCoin, "ERC20InsufficientBalance");
  });

  it("Should aprove", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    await bitProtoCoin.approve(otherAccount.address, 1n);
    const value = await bitProtoCoin.allowance(owner.address, otherAccount.address);
    expect(value).to.equal(1n);
  });

  it("Should transfer from", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalance = await bitProtoCoin.balanceOf(owner.address);
    const otherAccountBalance = await bitProtoCoin.balanceOf(otherAccount.address);
    await bitProtoCoin.approve(otherAccount.address, 10n);
    const instance = bitProtoCoin.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, 5n);
    const allowance = await bitProtoCoin.allowance(owner.address, otherAccount.address);
    const ownerBalanceAfter = await bitProtoCoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await bitProtoCoin.balanceOf(otherAccount.address);
    expect(ownerBalance).to.equal(10000000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((10000000n * 10n ** 18n) - 5n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(5n);
    expect(allowance).to.equal(5n);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = bitProtoCoin.connect(otherAccount);
    await instance.approve(owner.address, 1n);
    await expect(bitProtoCoin.transferFrom(otherAccount.address, owner.address, 1n))
      .to.be.revertedWithCustomError(bitProtoCoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = bitProtoCoin.connect(otherAccount);
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1n))
      .to.be.revertedWithCustomError(bitProtoCoin, "ERC20InsufficientAllowance");
  });

  it("Should mint once", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const mintAmount = 1000n;
    await bitProtoCoin.setMintAmount(mintAmount);
    const balanceBefore = await bitProtoCoin.balanceOf(otherAccount.address);
    //const instance = bitProtoCoin.connect(otherAccount);    
    //await instance.mint();
    await bitProtoCoin.mint(otherAccount.address);
    const balanceAfter = await bitProtoCoin.balanceOf(otherAccount.address);
    expect(balanceAfter).to.equal(balanceBefore + mintAmount);
  });

  it("Should NOT mint twice", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const mintAmount = 1000n;
    await bitProtoCoin.setMintAmount(mintAmount);
    //const instance = bitProtoCoin.connect(otherAccount);
    //await instance.mint();
    await bitProtoCoin.mint(otherAccount.address);
    await expect(bitProtoCoin.mint(otherAccount.address))
      .to.be.revertedWith("You cannot mint twice in a row.");
  });

  it("Should mint twice (after time delay has been passed)", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const mintAmount = 1000n;
    await bitProtoCoin.setMintAmount(mintAmount);
    const balanceBefore = await bitProtoCoin.balanceOf(owner.address);
    await bitProtoCoin.mint(owner.address);
    const mintDelay = 60 * 60 * 24 * 2;//dois dias em segundos
    await time.increase(mintDelay);
    await bitProtoCoin.mint(owner.address);
    const balanceAfter = await bitProtoCoin.balanceOf(owner.address);
    expect(balanceAfter).to.equal(balanceBefore + (mintAmount * 2n));
  });

  it("Should NOT set mint amount", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const mintAmount = 1000n;
    const instance = bitProtoCoin.connect(otherAccount);
    await expect(instance.setMintAmount(mintAmount)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT set mint delay", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const mintDelay = 60 * 60 * 24;
    const instance = bitProtoCoin.connect(otherAccount);
    await expect(instance.setMintDelay(mintDelay)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT mint (amount equals zero)", async function () {
    const { bitProtoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    await expect(bitProtoCoin.mint(otherAccount.address))
      .to.be.revertedWith("Minting isn't enabled.");
  });

});
