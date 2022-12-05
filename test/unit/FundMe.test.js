const { assert, expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

//使用yarn hardhat test 来测试（如果加上 --gerp "XXX" 就是只测试in里面带有XXX文字的项目），一般测试只用于本地测试。
//使用yarn hardhat test --network goerli来测试，但是会用很多时间，会timeout ，所以可能后面需要在hardhat.config.js加上mochi？还没接触到

//这里的"FundMe"可以随便改名字的
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("0.001"); //=0.001ETH

          beforeEach(async function () {
              //deploy our fundMe contract
              //using Hradhat-deploy

              //const accounts = await ehters.getSigners();
              //const accountZero =accounts[0];
              deployer = (await getNamedAccounts()).deployer;
              //console.log(`"deployer :" ${deployer}`);

              //fixture的意思大概是部署全部合约吧..？
              await deployments.fixture(["all"]);

              //猜测后面加了deployer意思是用deployer这个地址去连接，如果不加上的话就可能用默认hardhat默认第一个。
              //因为上面有了getNamedAccounts(),所以如果带--network goerli的话会自动用goerli私钥
              fundMe = await ethers.getContract("FundMe", deployer);
              //如果用--network goerli来测试 下面这个MockV3Aggregator会部署不到，可能因为MockV3Aggregator.sol文件在是在contracts下面的test文件中
              //   mockV3Aggregator = await ethers.getContract(
              //       "MockV3Aggregator",
              //       deployer
              //   );
          });

          //因为有构造函数，所以要在嵌套一个describe
          //yarn hardhat test --grep "correctly" 后面加这个的意思是只test it中带有correctly的代码

          //这里的"constructor"可以随便改名字的，但为了更加直观这个测试什么类别，最好命名相接近测试的行为
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const resposne = await fundMe.getPriceFeed();
                  assert.equal(resposne, mockV3Aggregator.address);
              });
          });

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  //to.be.revertedWith这个是waffle官方的测试交易是否被恢复
                  //fund这里没有传递eth的数额不满足最低的额度，交易就会回滚，这里用to.be.revertedWith测试确实回滚那就通过了
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });

              //下面的structure0 1 2, 0是原版正常用于本地网测试
              //1 2是两种不同的wait写法，2是确定可以通过，1不知道语法有没有问题还是timeout
              //如果是本地网测试1 2采用wait(1)都会通过，证明1的语法应该是可以的，如果用wait(2)以上就会timeout，本地网的问题
              //如果是goerli网络测，wait(1)时间完全不够 还没反应过来获取不到数据，起码要用wait(2)或者更多，但更多会timeout，可能需要在+上mochi
              it("updated the amount funded data structure0", async function () {
                  await fundMe.fund({ value: sendValue });
                  const resposne = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  //下面那个s_addressToAmountFunded开头的是FunMe合约中最开始声明的mapping，如果合约是public那么就可以用下面的
                  //但后面教程把public改成了private，所以就不能直接用s_addressToAmountFunded来得到数值，
                  //只能在合约后面新增一个getAddressToAmountFunded的function来获取数值。
                  //const resposne = await fundMe.s_addressToAmountFunded(deployer);
                  assert.equal(resposne.toString(), sendValue.toString());
              });

              /*
        it("updated the amount funded data structure1", async function () {
            await (await fundMe.fund({ value: sendValue })).wait(1);
            const resposne = await fundMe.getAddressToAmountFunded(deployer);
            //下面那个s_addressToAmountFunded开头的是FunMe合约中最开始声明的mapping，如果合约是public那么就可以用下面的
            //但后面教程把public改成了private，所以就不能直接用s_addressToAmountFunded来得到数值，
            //只能在合约后面新增一个getAddressToAmountFunded的function来获取数值。
            //const resposne = await fundMe.s_addressToAmountFunded(deployer);
            assert.equal(resposne.toString(), sendValue.toString());
        });

        it("updated the amount funded data structure*2", async function () {
            const sendvalue = await fundMe.fund({ value: sendValue });
            await sendvalue.wait(1);
            const resposne = await fundMe.getAddressToAmountFunded(deployer);
            //下面那个s_addressToAmountFunded开头的是FunMe合约中最开始声明的mapping，如果合约是public那么就可以用下面的
            //但后面教程把public改成了private，所以就不能直接用s_addressToAmountFunded来得到数值，
            //只能在合约后面新增一个getAddressToAmountFunded的function来获取数值。
            //const resposne = await fundMe.s_addressToAmountFunded(deployer);
            assert.equal(resposne.toString(), sendValue.toString());
        });
        */

              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  //这里用了0可以理解为第一个调用fund的地址映射是0，但是我想不到如果我想测试的是第二个才调用fund的地址应该是用1
                  //但是填进去1进去的话 是显示错误，不知道如何解决了。
                  const funder = await fundMe.getFunder(0);
                  //数字就要用toString(),地址就不需要了
                  //我觉得是因为数字可能是超出范围的超大的数字和小的数字，solidity也会识别一样
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", function () {
              //在开始withdraw之前，先要让合约里面有eth，所以先要beforeEach先fund一下
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  //不一定要用fundMe.provider，可以直接ethers.provider
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Assert
                  // Maybe clean up to understand the testing
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("is allows us to withdraw with multiple funders ", async function () {
                  /*下面这个没什么用，只是自己做测试，ctrl+点击getsigner能进入页面看到详细参数
            const account1 = await ethers.getSigner(
                "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
            );
            console.log(account1);
            */
                  const accounts = await ethers.getSigners();
                  //console.log(accounts[1]);
                  // Arrange
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
                  console.log(`"GasCost : " ${withdrawGasCost}`);
                  console.log(`"GasUsed : " ${gasUsed}`);
                  console.log(`"GasPrice : " ${effectiveGasPrice}`);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  );

                  // Make a getter for storage variables
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              //revertedWith已经是复制教程了，但还是出错，没想明白了
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });

              it("Only allows the owner to withdraw2", async function () {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
      });
