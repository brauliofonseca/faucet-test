const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {

    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();
    await faucet.deployed();

    // Contracts are deployed using the first signer/account by default
    const [owner, anotherAddress] = await ethers.getSigners();

    let withDrawAmount = ethers.utils.parseUnits("1", "ether");
    console.log('Signer 1 address: ', owner.address);
    return { faucet, owner, withDrawAmount, anotherAddress };
  }

  describe("Test Contract", function () {
    it("Should deploy and set owner correctly", async function () {
      const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

      expect(await faucet.owner()).to.equal(owner.address);
    });

    it("Should not allow withdrawal if greater than .1 ETH", async function() {
      const { faucet, owner, withDrawAmount } = await loadFixture(deployContractAndSetVariables);
      await expect(faucet.withdraw(withDrawAmount)).to.be.reverted;
    });
    
    it("Should only allow contract owner to call destroyFaucet()", async function() {
      const { faucet, anotherAddress } = await loadFixture(deployContractAndSetVariables);
      await expect(faucet.connect(anotherAddress).destroyFaucet()).to.be.reverted
    });

    it("Should return ether to owner of the contract", async function() {
      const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
      const currentContractBalance = await faucet.balance
      const transaction = await faucet.withdrawAll()
      await expect(owner.balance).to.equal(currentContractBalance);
    })
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
    // });
  // });
});
