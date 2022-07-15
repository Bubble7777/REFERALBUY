const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DexooStorage", function () {
  let StorageFactory;
  let storageContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    StorageFactory = await ethers.getContractFactory("DexooStorage");
    storageContract = await StorageFactory.deploy();
    await storageContract.deployed();
  });

  it("Should be deployed DexooStorage", async function () {
    expect(storageContract.address).to.be.properAddress;
  });

  it("Should add New Referral Reward", async function () {
    const options = { value: ethers.utils.parseUnits("10") };

    let tx = await storageContract
      .connect(addr1)
      .addReferralReward(addr1.address, options);

    await expect(() => tx).to.changeEtherBalance(
      storageContract,
      10000000000000000000n
    );
    await expect(() => tx).to.changeEtherBalance(addr1, -10000000000000000000n);

    await expect(() =>
      storageContract.connect(addr2).addReferralReward(addr2.address, options)
    ).to.changeEtherBalance(addr2, -10000000000000000000n);
  });

  it("Should get Referral Rewards", async function () {
    const options = ethers.utils.parseUnits("5");
    const sumOwner = ethers.utils.parseUnits("10");

    expect(await storageContract.getReferralRewards(addr1.address)).to.equal(
      options
    );
    expect(await storageContract.getReferralRewards(owner.address)).to.equal(
      sumOwner
    );
  });

  it("Should add System Comission", async function () {
    const options = { value: ethers.utils.parseUnits("10") };
    const sumOwner = ethers.utils.parseUnits("30");

    let tx = await storageContract.connect(addr1).addSystemComission(options);

    await expect(() => tx).to.changeEtherBalance(
      storageContract,
      10000000000000000000n
    );
    await expect(() => tx).to.changeEtherBalance(addr1, -10000000000000000000n);

    await expect(() =>
      storageContract.connect(addr2).addSystemComission(options)
    ).to.changeEtherBalance(addr2, -10000000000000000000n);

    expect(await storageContract.getReferralRewards(owner.address)).to.equal(
      sumOwner
    );
  });

  it("withdraw Referral Reward", async function () {
    const sumOwner = ethers.utils.parseUnits("5");

    let tx = await storageContract
      .connect(addr1)
      .withdrawReferralReward(sumOwner);

    await expect(() => tx).to.changeEtherBalance(
      storageContract,
      -5000000000000000000n
    );
    await expect(() => tx).to.changeEtherBalance(addr1, 5000000000000000000n);

    await expect(() =>
      storageContract.connect(addr2).withdrawReferralReward(sumOwner)
    ).to.changeEtherBalance(addr2, sumOwner);

    expect(await storageContract.getReferralRewards(addr1.address)).to.equal(0);

    expect(await storageContract.getReferralRewards(addr2.address)).to.equal(0);
  });

  it("withdraw for Owner contract", async function () {
    const sumOwner = ethers.utils.parseUnits("30");

    let tx = await storageContract.connect(owner).withdraw();

    await expect(() => tx).to.changeEtherBalance(
      storageContract,
      -30000000000000000000n
    );

    await expect(() => tx).to.changeEtherBalance(owner, sumOwner);

    expect(await storageContract.getReferralRewards(owner.address)).to.equal(0);
  });
});
