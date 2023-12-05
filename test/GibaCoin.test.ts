import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GibaCoin Tests", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const GibaCoin = await ethers.getContractFactory("GibaCoin");
    const gibaCoin = await GibaCoin.deploy();
    return { gibaCoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await gibaCoin.name();
    expect(name).to.equal("GibaCoin");
  });

  it("Should have correct symbol (G₿C)", async function () {
    const B_SIGN_UNICODE = '\u{20BF}';
    const GBC_SYMBOL = `G${B_SIGN_UNICODE}C`;
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await gibaCoin.symbol();
    expect(symbol).to.equal(GBC_SYMBOL);
    expect(symbol).to.equal("G₿C");
  });

  it("Should have correct decimals", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await gibaCoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have total suply", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSuply = await gibaCoin.totalSupply();
    expect(totalSuply).to.equal(1000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await gibaCoin.balanceOf(owner.address);
    expect(balance).to.equal(1000n * 10n ** 18n);
  });

  it("Should transfer balance", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalance = await gibaCoin.balanceOf(owner.address);
    const otherAccountBalance = await gibaCoin.balanceOf(otherAccount.address);
    await gibaCoin.transfer(otherAccount.address, 1n);
    const ownerBalanceAfter = await gibaCoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await gibaCoin.balanceOf(otherAccount.address);

    expect(ownerBalance).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((1000n * 10n ** 18n) - 1n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(1n);
  });

  it("Should NOT transfer (balance)", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = gibaCoin.connect(otherAccount);
    await expect(instance.transfer(owner.address, 1n))
      .to.be.revertedWithCustomError(gibaCoin, "ERC20InsufficientBalance");
  });

  it("Should aprove", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    await gibaCoin.approve(otherAccount.address, 1n);
    const value = await gibaCoin.allowance(owner.address, otherAccount.address);
    expect(value).to.equal(1n);
  });

  it("Should transfer from", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const ownerBalance = await gibaCoin.balanceOf(owner.address);
    const otherAccountBalance = await gibaCoin.balanceOf(otherAccount.address);
    await gibaCoin.approve(otherAccount.address, 10n);

    const instance = gibaCoin.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, 5n);

    const allowance = await gibaCoin.allowance(owner.address, otherAccount.address);

    const ownerBalanceAfter = await gibaCoin.balanceOf(owner.address);
    const otherAccountBalanceAfter = await gibaCoin.balanceOf(otherAccount.address);

    expect(ownerBalance).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfter).to.equal((1000n * 10n ** 18n) - 5n);
    expect(otherAccountBalance).to.equal(0);
    expect(otherAccountBalanceAfter).to.equal(5n);
    expect(allowance).to.equal(5n);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = gibaCoin.connect(otherAccount);
    await instance.approve(owner.address, 1n);
    await expect(gibaCoin.transferFrom(otherAccount.address, owner.address, 1n))
      .to.be.revertedWithCustomError(gibaCoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = gibaCoin.connect(otherAccount);
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1n))
      .to.be.revertedWithCustomError(gibaCoin, "ERC20InsufficientAllowance");
  });

  it("Should mint once", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);    
    const mintAmount = 1000n;
    await gibaCoin.setMintAmount(mintAmount);
    
    const balanceBefore = await gibaCoin.balanceOf(otherAccount.address);
    
    const instance = gibaCoin.connect(otherAccount);
    await instance.mint();
    
    const balanceAfter = await gibaCoin.balanceOf(otherAccount.address);

    expect(balanceAfter).to.equal(balanceBefore + mintAmount);    
  });

  it("Should NOT mint twice", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);    
    const mintAmount = 1000n;
    await gibaCoin.setMintAmount(mintAmount);    
    const instance = gibaCoin.connect(otherAccount);
    await instance.mint();      

    await expect(instance.mint()).to.be.revertedWith("You cannot mint twice in a row.");
  });

  it("Should mint twice (after time delay has been passed)", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);    
    const mintAmount = 1000n;
    await gibaCoin.setMintAmount(mintAmount);    
    const balanceBefore = await gibaCoin.balanceOf(owner.address);    
    await gibaCoin.mint();
    const mintDelay = 60 * 60 * 24 * 2;//dois dias em segundos
    await time.increase(mintDelay);
    await gibaCoin.mint();
    const balanceAfter = await gibaCoin.balanceOf(owner.address);
    expect(balanceAfter).to.equal(balanceBefore + (mintAmount * 2n));
  });

  it("Should NOT set mint amount", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);    
    const mintAmount = 1000n;
    const instance = gibaCoin.connect(otherAccount);
    await expect(instance.setMintAmount(mintAmount)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT set mint delay", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);    
    const mintDelay = 60 * 60 * 24;
    const instance = gibaCoin.connect(otherAccount);
    await expect(instance.setMintDelay(mintDelay)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT mint (amount equals zero)", async function () {
    const { gibaCoin, owner, otherAccount } = await loadFixture(deployFixture);
    await expect(gibaCoin.mint()).to.be.revertedWith("Minting isn't enabled.");
  });

});
