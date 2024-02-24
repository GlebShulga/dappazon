const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE =
  "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const PRICE = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("deployment", async () => {
    it("Sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  describe("listing", async () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, PRICE, RATING, STOCK);

      await transaction.wait();
    });

    it("Should returns items attributes", async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.price).to.equal(PRICE);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Should emit list event", async () => {
      expect(transaction).to.emit(dappazon, "List");
    });
  });

  describe("buying", async () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, PRICE, RATING, STOCK);

      await transaction.wait();

      transaction = await dappazon.connect(buyer).buy(ID, { value: PRICE });
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.target);
      expect(result).to.equal(PRICE);
    });

    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1);

      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("Emits buy event", async () => {
      expect(transaction).to.emit(dappazon, "Buy");
    });
  });

  describe("withdraw", async () => {
    let balanceBefore;

    beforeEach(async () => {
      let transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, PRICE, RATING, STOCK);
      await transaction.wait();

      transaction = await dappazon.connect(buyer).buy(ID, { value: PRICE });
      await transaction.wait();

      balanceBefore = await ethers.provider.getBalance(deployer.address);

      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(dappazon.target);
      expect(balance).to.equal(0);
    });
  });
});
