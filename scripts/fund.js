const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log(`Got contract FundMe at ${fundMe.address}`);
    console.log("Funding contract...");
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.001"),
    });
    //wait(1)是因为本地网络只会在实行一部后更新一个区块，改成2或者以上的话就会卡住不动
    //如果确实要改成2以上就要 在新建一个wsl终端来运行network localhost的其他能推进区块的脚本
    //这样就会推进原来的wait(2)的脚本继续运行下去
    await transactionResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
