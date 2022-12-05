const { network } = require("hardhat");

//const { networkConfig } = require("../helper-hardhat-config");
//= const helperConfig = require("../helper-hardhat-config");
//= const networkConfig = helperConfig.networkConfig;
const {
    //developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

//第二种方法
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //(developmentChain.includes(network.name)
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks deployed!");
        log("---------------------------------------------");
        log(deployer);
    }
};

module.exports.tags = ["all", "mocks"];
