module.exports = async function ({ msg }, { deployments: { deploy }, ethers: { getNamedSigners } }) {
	const { deployer } = await getNamedSigners();

	await deploy("ERC1404", {
		from: deployer.address,
		contract: "ERC1404",
		args: [],
		log: true
	});

	console.log(`deployer is: ${deployer.address}`);
};
