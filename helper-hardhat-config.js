const networkConfig = {
    1: {
        name: "main",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    56: {
        name: "bsc",
        ethUsdPriceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    },
    31337: {
        name: "localhost",
        ethUsdPriceFeed: "0x123456",
    },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

//好像要加这个 不然文件没有导出 无法识别
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
