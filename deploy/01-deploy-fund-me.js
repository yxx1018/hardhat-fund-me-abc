// async function deployFunc(hre) {
//     //上面的hre暂时是没有意义的，可以删除
//     console.log("Hi!");
// }
// module.exports.default = deployFunc;

// //直接可以用隐藏函数定义
// //第一种方法
// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre;
//     //= hre.getNamedAccounts
//     //= hre.deployments
// };

//因为hardhat会自动读取hardhat.config.js的文件，如果把hardhat.config.js改名成为别的，就算导入改成的那个名字 也是不行。
//其次{ network }这个名字其实写什么都可以运行，因为hardhat依赖比较强大 估计只要require("hardhat")正确就可以正确读取hardhat.config.js的内容。
//如果要自己写一些配置，那么命名一定要正确例如{ networks }，路径和配置文件名字也一定要正确require("../hardhat1");
const { network } = require("hardhat");
const { networks } = require("../hardhat1");

const { verify } = require("../utils/verify");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
//= const helperConfig = require("../helper-hardhat-config");
//= const networkConfig = helperConfig.networkConfig;

require("dotenv").config();

//第二种方法：
//第下面三行代码其实是hardhat-deploy这个社区插件官方的写法，具体是为什么这样写还是需要研究
//第一行getNamedAccounts, deployments就算不写都可以正确运行，
//应该是官方想表达一下这个函数包含什么内容所以才写上getNamedAccounts, deployments 这两个东西
//第二，三的deployments和await getNamedAccounts()应该是hardhat这个插件自带的内容，名字不能改
//同时在test测试文件夹中，教程也是吧deployments和getNamedAccounts这两个require("hardhat"),所以应该是hardhat里面的
//第二，三的{ deploy, log }{ deployer }也不能修改，如果修改名字就算下面的也跟着修改成相应名字，脚本也不能运行

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    //= const  deployer  = (await getNamedAccounts()).deployer;

    //network这个是直接读取了hardhat官方的定义
    //可以直接console.log(network)看官方在network下面有什么信息
    //按道理hardhat应该有官方文档能看除了network还能写什么内容可以读取其他信息
    //network这些信息并不需要自己在hardhat.config.js自己写入，官方自带内置有的
    const chainId = network.config.chainId;

    /*
    //下面三个console都是自己测试的，对脚本功能没任何作用
    console.log(chainId);
    //networks这个是自己加了一个hardhat1里面有networks输出而测试的
    //所以如果用networks.config是没有任何东西
    console.log(networks.a);
    console.log(networks.a.name);
    */

    let ethUsdPriceFeedAddress;
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress];
    //下面也是hardhat-deploy官方需要填写的，部署函数需要 2 个参数：一个用于部署函数名称，一个用于{}选项
    //{}选项中最少要包含from（部署者账号地址）和args（部署函数需要填写的构造函数内容），其他可选内容可以查阅
    //https://github.com/wighawag/hardhat-deploy/tree/master 中搜waitConfirmations 就能看到
    const funMe = await deploy("FundMe", {
        from: deployer,
        //from可以写hardhat自带的几个虚拟地址的私钥或者账户，例如"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        args: [ethUsdPriceFeedAddress],
        log: true,
        // gasLimit: 1200000,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("---------------------------------------------");
    //如果直接yarn hardhat deploy本地调用，那么就会调用getNamedAccounts()，这个函数会使用hardhat.config.js上面的namedAccounts
    //如果yanr hardhat deploy --network goerli就会调用hardhat.config.js上面的networks对应的goerli网络
    //所以deployer可以自己识别获取，不需要硬解码
    log(deployer);
    //console.log(deployer);
    console.log(
        "如果用部署文件中有console.log的话,会在test测试的时候显示出来,直接用log就不会显示"
    );
    log("看没显示这个吧！");

    // if (
    //     !developmentChains.includes(network.name) &&
    //     process.env.ETHERSCAN_API_KEY
    // ) {
    //     await verify(funMe.address, args);
    //     log("verifing!--------------------------------------");
    // }
};

module.exports.tags = ["all", "fundme"];
