const { task } = require("hardhat/config");

task(
	"deploy:erc1404",
	"Deploy ERC1404 contract",
	require("./erc1404.deploy")
);
