import { expect } from "chai";
import { ethers } from "hardhat";
import { KYCVerification } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("KYCVerification", function () {
  let kycContract: KYCVerification;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const KYCFactory = await ethers.getContractFactory("KYCVerification");
    kycContract = await KYCFactory.deploy();
    await kycContract.deployed();
  });

  it("Should set the right owner", async function () {
    expect(await kycContract.admin()).to.equal(owner.address);
  });

  it("Should verify a user", async function () {
    await kycContract.verifyUser(user.address, true);
    expect(await kycContract.checkKYC(user.address)).to.equal(true);
  });

  it("Should fail when non-admin tries to verify", async function () {
    await expect(
      kycContract.connect(user).verifyUser(user.address, true)
    ).to.be.revertedWith("Only admin can call this function");
  });
});
