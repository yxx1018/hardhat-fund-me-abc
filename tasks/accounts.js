const { task } = require("hardhat/config");

//列出hardhat假账户
task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

//列出当前区块，后面加入--network goerli 则显示goerli的区块
// task("blocknumber", "Prints the current block number", async () => {
//     const blockNumber = await ethers.provider.getBlockNumber();
//     console.log(`Current Block Number : ${blockNumber}`);
// });

//教程是这样写的 多了个setAction
task("blocknumber", "Prints the current block number").setAction(
    //cosnt blockTask =async function() =>{}
    //async function blockTask() {}
    async () => {
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log(`Current Block Number : ${blockNumber}`);
    }
);
