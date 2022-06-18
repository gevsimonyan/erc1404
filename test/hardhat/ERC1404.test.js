const { expect } = require("chai");
const {
	deployments: { fixture },
	network,
	ethers: {
		getContract,
		getNamedSigners,
		BigNumber,
		constants: { AddressZero }
	},
} = require("hardhat");

describe("ERC1404 contract: ", function () {
	let accounts, deployer, caller, holder, snapshotStart;
	let erc1404;

	before("Before All: ", async function () {
		accounts = await getNamedSigners();
		({ deployer, caller, holder } = accounts);
		await fixture("Hardhat");
		erc1404 = await getContract("ERC1404", deployer);
	});

	describe("Initialization: ", function () {
		before("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		after("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should init with correct values", async function () {
			expect(await erc1404.name()).to.equal("ERC1404");
			expect(await erc1404.symbol()).to.equal("WLT");
			expect(await erc1404._isInWhitelist(deployer.address)).to.equal(true);
		});
	});

	describe("Mint function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"Ownable: caller is not the owner\"", async function () {
			await expect(erc1404.connect(caller).mint(caller.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("Ownable: caller is not the owner");
		});

		it("Should revert with \"ERC1404: _account isn't in whitelist\"", async function () {
			await expect(erc1404.mint(caller.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: _account isn't in whitelist");
		});

		it("Should mint ERC1404 token with correct values: ", async function () {
			await expect(() => erc1404.mint(deployer.address, 100))
				.to
				.changeTokenBalance(erc1404, deployer, 100);
		});
	});

	describe("Burn function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should burn ERC1404 token with correct values: ", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.mint(caller.address, BigNumber.from("100"));
			await expect(() => erc1404.burn(caller.address, 100))
				.to
				.changeTokenBalance(erc1404, caller, -100);
		});
	});

	describe("addToWhiteList function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"Ownable: caller is not the owner\"", async function () {
			await expect(erc1404.connect(caller).addToWhitelist(holder.address))
				.to
				.be
				.revertedWith("Ownable: caller is not the owner");
		});

		it("Should revert with \"ERC1404: you can't add zero address\"", async function () {
			await expect(erc1404.addToWhitelist(AddressZero))
				.to
				.be
				.revertedWith("ERC1404: you can't add zero address");
		});

		it("Should revert with \"ERC1404: caller is already in whitelist\"", async function () {
			await erc1404.addToWhitelist(caller.address);
			await expect(erc1404.addToWhitelist(caller.address))
				.to
				.be
				.revertedWith("ERC1404: caller is already in whitelist");
		});

		it("Should add user to whitelist: ", async function () {
			await erc1404.addToWhitelist(caller.address);

			expect(await erc1404._isInWhitelist(caller.address)).to.equal(true);
		});
	});

	describe("removeFromWhitelist function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"Ownable: caller is not the owner\"", async function () {
			await expect(erc1404.connect(caller).removeFromWhitelist(holder.address))
				.to
				.be
				.revertedWith("Ownable: caller is not the owner");
		});

		it("Should revert with \"ERC1404: you can't add zero address\"", async function () {
			await expect(erc1404.removeFromWhitelist(AddressZero))
				.to
				.be
				.revertedWith("ERC1404: you can't add zero address");
		});

		it("Should revert with \"ERC1404: user is not in whitelist\"", async function () {
			await expect(erc1404.removeFromWhitelist(caller.address))
				.to
				.be
				.revertedWith("ERC1404: user is not in whitelist");
		});

		it("Should remove user from whitelist: ", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.removeFromWhitelist(caller.address);

			expect(await erc1404._isInWhitelist(caller.address)).to.equal(false);
		});
	});

	describe("transfer function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"ERC1404: recepient isn't in whitelist\"", async function () {
			await expect(erc1404.transfer(caller.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: recepient isn't in whitelist");
		});

		it("Should revert with \"ERC1404: caller is not in the whitelist\"", async function () {
			await expect(erc1404.connect(caller).transfer(holder.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: caller is not in the whitelist");
		});

		it("Should transfer correct amount: ", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.mint(deployer.address, BigNumber.from("1000"));

			await expect(() => erc1404.transfer(caller.address, BigNumber.from("100")))
				.to
				.changeTokenBalances(
					erc1404,
					[deployer, caller],
					[-100, 100]);
		});

		it("Shoult emit Transfer event with correct args", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.mint(deployer.address, BigNumber.from("1000"));

			await expect(erc1404.transfer(caller.address, BigNumber.from("100")))
				.to
				.emit(erc1404, "Transfer")
				.withArgs(deployer.address, caller.address, BigNumber.from("100"));
		});
	});

	describe("approve function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"ERC1404: caller is not in the whitelist\"", async function () {
			await expect(erc1404.connect(caller).approve(holder.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: caller is not in the whitelist");
		});

		it("Should revert with \"ERC1404: recepient isn't in whitelist\"", async function () {
			await expect(erc1404.approve(caller.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: recepient isn't in whitelist");
		});

		it("Should approve correct amount: ", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.mint(deployer.address, BigNumber.from("1000"));

			await erc1404.approve(caller.address, BigNumber.from("100"));

			expect(await erc1404.allowance(deployer.address, caller.address))
				.to
				.equal(BigNumber.from("100"));
		});

		it("Shoult emit Approval event with correct args", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.mint(deployer.address, BigNumber.from("1000"));

			await expect(erc1404.transfer(caller.address, BigNumber.from("100")))
				.to
				.emit(erc1404, "Transfer")
				.withArgs(deployer.address, caller.address, BigNumber.from("100"));
		});
	});

	describe("transferFrom function: ", function () {
		beforeEach("Before: ", async function () {
			snapshotStart = await network.provider.request({
				method: "evm_snapshot",
				params: []
			});
		});

		afterEach("After tests: ", async function () {
			await network.provider.request({
				method: "evm_revert",
				params: [snapshotStart]
			});
		});

		it("Should revert with \"ERC1404: caller is not in the whitelist\"", async function () {
			await expect(erc1404.connect(caller).transferFrom(deployer.address, holder.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: caller is not in the whitelist");
		});

		it("Should revert with \"ERC1404: sender isn't in whitelist\"", async function () {
			await expect(erc1404.transferFrom(caller.address, holder.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: sender isn't in whitelist");
		});

		it("Should revert with \"ERC1404: recepient isn't in whitelist\"", async function () {
			await expect(erc1404.transferFrom(deployer.address, caller.address, BigNumber.from("100")))
				.to
				.be
				.revertedWith("ERC1404: recepient isn't in whitelist");
		});

		it("Shoult emit Transfer event with correct args", async function () {
			await erc1404.addToWhitelist(caller.address);
			await erc1404.addToWhitelist(holder.address);
			await erc1404.mint(caller.address, BigNumber.from("1000"));
			await erc1404.connect(caller).approve(deployer.address, BigNumber.from("100"));


			await expect(() => erc1404.transferFrom(caller.address, holder.address, BigNumber.from("100")))
				.to
				.changeTokenBalances(
					erc1404,
					[caller, holder],
					[-100, 100]);
		});
	});
});
