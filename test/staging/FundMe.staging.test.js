const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer;
          let fundMe;
          const sendValue = ethers.utils.parseEther("0.001");
          //应该是教程很早的时候在测试网上部署过FundMe这个合约，所以test会自己找到之前对应名字的来测试
          //所以这样就不用await deployments.fixture(["all"])这个部署步骤
          //如果用了await deployments.fixture(["all"])，后面测试就会用新部署的合约来测试，
          //如果不用，应该就会用这个deployer最早部署名叫“FundMe”的合约来进行测试
          beforeEach(async () => {
              //await deployments.fixture(["all"]);
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue });
              await fundTxResponse.wait(1);
              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait(1);

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              );
              assert.equal(endingFundMeBalance.toString(), "0");
          });
      });
