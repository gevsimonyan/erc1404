module.exports = async ({
	run,
	config: {
		networks: {
			hardhat: { forking }
		}
	}
}) => {
	if (forking.enabled) {
		return;
	}
	await run("deploy:erc1404", {});
};
module.exports.tags = ["erc1404", "Hardhat"];
