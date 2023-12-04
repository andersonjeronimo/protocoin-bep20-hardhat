import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Protocoin Tests", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ProtoCoin = await ethers.getContractFactory("ProtoCoin");
    const protocoin = await ProtoCoin.deploy();
    return { protocoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await protocoin.name();
    expect(name).to.equal("ProtoCoin");
  });

  it("Should have correct symbol", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await protocoin.symbol();
    expect(symbol).to.equal("PRC");
  });

  it("Should have correct decimals", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await protocoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have total suply", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSuply = await protocoin.totalSupply();
    expect(totalSuply).to.equal(1000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await protocoin.balanceOf(owner.address);
    expect(balance).to.equal(1000n * 10n ** 18n);
  });

  it("Should transfer balance", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalance = await protocoin.balanceOf(owner.address);
    const otherAccountBalance = await protocoin.balanceOf(otherAccount.address);
    await protocoin.transfer(otherAccount.address, 1n);
    const ownerBalanceAfter = await protocoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await protocoin.balanceOf(otherAccount.address);

    expect(ownerBalance).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((1000n * 10n ** 18n) - 1n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(1n);
  });

  it("Should NOT transfer (balance)", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protocoin.connect(otherAccount);
    await expect(instance.transfer(owner.address, 1n))
      .to.be.revertedWithCustomError(protocoin, "ERC20InsufficientBalance");
  });

  it("Should aprove", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    await protocoin.approve(otherAccount.address, 1n);
    const value = await protocoin.allowance(owner.address, otherAccount.address);
    expect(value).to.equal(1n);
  });

  it("Should transfer from", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const ownerBalance = await protocoin.balanceOf(owner.address);
    const otherAccountBalance = await protocoin.balanceOf(otherAccount.address);
    await protocoin.approve(otherAccount.address, 10n);

    const instance = protocoin.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, 5n);

    const allowance = await protocoin.allowance(owner.address, otherAccount.address);

    const ownerBalanceAfter = await protocoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await protocoin.balanceOf(otherAccount.address);

    expect(ownerBalance).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((1000n * 10n ** 18n) - 5n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(5n);
    expect(allowance).to.equal(5n);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protocoin.connect(otherAccount);
    await instance.approve(owner.address, 1n);
    await expect(protocoin.transferFrom(otherAccount.address, owner.address, 1n))
      .to.be.revertedWithCustomError(protocoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protocoin.connect(otherAccount);
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1n))
      .to.be.revertedWithCustomError(protocoin, "ERC20InsufficientAllowance");
  });
});
