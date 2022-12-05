require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();
require("hardhat-deploy");
require("./tasks/accounts");

const GOERLI_INFURA_PRIVATE_KEY = process.env.GOERLI_INFURA_PRIVATE_KEY;
const GOERLI_INFURA_RPC_URL = process.env.GOERLI_INFURA_RPC_URL;

const GANACHE_WSL_PRIVATE_KEY = process.env.GANACHE_WSL_PRIVATE_KEY;
const GANACHE_WSL_RPC_URL = process.env.GANACHE_WSL_RPC_URL;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_APT_KEY = process.env.COINMARKETCAP_APT_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //solidity: "0.8.17",
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
    },

    defaultNetwork: "hardhat", //这个是手动添加上去的，可以没有这个。
    //如果要用hardhat网来部署的话就要用yarn hardhat run scripts/deploy.js --network hardhat
    //当然也可以直接用yarn hardhat run scripts/deploy.js  他自动选择默认defaultNetwork的hardhat
    networks: {
        //必须是networks，不能是network
        goerli: {
            //要用geroli来部署的话要用yarn hardhat run scripts/deploy.js --network goerli
            url: GOERLI_INFURA_RPC_URL,
            accounts: [GOERLI_INFURA_PRIVATE_KEY], //注意这里是accounts 而不是account
            chainId: 5,
            //下面两个gas的东西貌似没用
            // gasLimit: 210000,
            // gasPrice: 8000000000,
            //blockConfirmations:6,
        },
        ganache_wsl: {
            url: GANACHE_WSL_RPC_URL,
            accounts: [GANACHE_WSL_PRIVATE_KEY], //注意这里是accounts 而不是account
            chainId: 1337,
        },
        localhost: {
            //加了localhost使用这个 可以在终端看到具体使用信息
            url: "http://127.0.0.1:8545",
            //accounts:Thank hardhat
            chainId: 31337,
        },
    },

    //原版是这样
    // etherscan: {
    //     apiKey: ETHERSCAN_API_KEY,
    // },

    //后面找一堆方法为了连上ethersan的端口，从hardhat文档和其他大神改成下面，最后还是连接不上，可能需要改终端代理
    //最终还是未能解决 但我估计是goerli这个api已经失效了，先不整活了
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
        customChains: [
            {
                network: "goerli",
                chainId: 5,
                urls: {
                    apiURL: "http://api-goerli.etherscan.io/api", // https => http
                    browserURL: "https://goerli.etherscan.io",
                },
            },
        ],
    },

    gasReporter: {
        enabled: false,
        //outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_APT_KEY,
        token: "ETH",
    },

    namedAccounts: {
        deployer: {
            default: 0,
            //0为hardhat第一个虚拟地址
            //"0x976EA74026E726554dB657fA54763abd0C3a0aa9"当然也可以自己定义一个地址 作为部署的地址
        },
        /*user: {
            default: 1,
        },*/
    },
};
