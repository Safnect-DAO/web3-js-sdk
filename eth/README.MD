# Eth js sdk

  以太坊JS-SDK，测试网使用的是Sepolia（雪波丽）。

  以太坊钱包地址是EVM格式的地址，测试网及主网地址相同，包括其他的EVM公链钱包地址都与ETH地址相同。

  接入以太链也需要sdk结合API完成，API查询实时数据，sdk封装常用的函数库。
  
  
## 参考资料

  Sepolia区块链浏览器地址：[https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)

  Example文件  [eth_demo.html](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/eth/eth_demo.html)

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 ethsdk.min_0.0.3.js
  
  network参数可选值：testnet | mainnet

## 功能函数与API

### 1、获取钱包地址

  `const address = Eth.getAddr(publicKeyX, publicKeyY);`
  
  根据公钥X、Y值获取钱包地址，测试网和主网钱包地址相同，无需传入network参数。


### 2、获取ETH余额

  Eth.getBalance(network, address, callback)

  获取网络中ETH余额，余额单位为ETH（无需转换）。

  参数：
  
  network 网络，取值mainnet|testnet
  
  address 钱包地址

  callback(balance)  余额回调函数，参数balance为余额值。

### 3、构建交易

  const {tx, gasFee} = `Eth.buildTx(network, from, to, amount);`

  构建一笔交易（转账）

  参数：
  
    network 网络，取值mainnet|testnet

    from 发送地址

    to 接收地址

    amount 转账数额（单位ETH）

  返回值：

    tx: Object  构建好的交易参数，发送交易时的入参

    gasFee 交易费（单位ETH）

### 4、发送交易

  const result<Promise> = `Eth.sendTx(network, tx, privateKeyStr);`

  发送构建好的交易数据至链上网络，发送成功后返回交易成功数据。该函数为异步函数可使用then(result => {})获取执行结果。

  参数：

    network 网络，取值mainnet|testnet

    tx: Object  构建好的交易参数，函数3返回的值

    privateKeyStr 十进制私钥字符串

    
### 5、获取交易记录（Server API）

  `Path：/fetch-data/eth-tx-record?network={network}&address={address}`

参数：

  network 网络，取值mainnet|testnet

  address 钱包地址

响应：

  ```
    {
      "code": 200,
      "msg": null,
      "data": [
            {
                "amount": "0.5 ETH",
                "gasFee": "0.00006499",  // 单位也是ETH
                "receiveAddress": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
                "txid": "0x9328c6760ea610d77ff72a87778c96b526395c628dcdae6e8543ac82ace25513 ",
                "fromAddress": "0x6bD35dfE65497920afC55AcE688c39f6f970ff52",
                "time": "2024-07-21 14:44:24",
                "directory": "OUT",  // OUT转出，IN为转入
                "type": 0 // 类型，0表示ETH转账，1表示代币转账，2：表示转存
            }, {
              "amount": "0 ETH",
              "gasFee": "0.00092096",
              "receiveAddress": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
              "txid": "0x494bb2a1a43410ed1eb1f0939280de853c4b3f2c19b653d694e86a7c7c36ad7e ",
              "fromAddress": "0x6bD35dfE65497920afC55AcE688c39f6f970ff52",
              "time": "2024-07-26 6:09:36",
              "type": 1, 
              "directory": "OUT",
              "tokenInfo": { // type 为1时才有该结构数据
                  "tokenSymbol": "WETH", // 代币符文
                  "tokenAmount": "0.0016", // 代币转账额
                  "tokenReceiveAddress": "0x6bd35dfe65497920afc55ace688c39f6f970ff52" // 代币合约地址
              }
          }
      ]
  }
  ```

### 6、获取实时行情（Server API）

  path: /fetch-data/price

  当前支持这些ethereum,bitcoin,solana,litecoin,dogecoin,conflux,arbitrum,Filecoin币的市场实时价格返回，该接口缓存5秒数据。

  参数：
    
    chainNames 可选，额外要增加查询行情的token名称，多个使用“,”（英文逗号）拼接，示例值：bitcoin,solana,litecoin，取值可参考https://api.coingecko.com/api/v3/coins/list接口的返回值

  响应值：
  ```
    {
        "code": 200,
        "msg": null,
        "data": {
            "arbitrum": {  // ARB
                "usd": 0.789265,
                "usd_24h_change": 1.5101157941386123
            },
            "bitcoin": { // 比特币
                "usd": 68064,
                "usd_24h_change": 2.150894883462686
            },
            "dogecoin": { // 狗狗币
                "usd": 0.140385,
                "usd_24h_change": 7.084696337373682
            },
            "ethereum": {  // 这是以太的实时价格
                "usd": 3500.92,
                "usd_24h_change": 0.28830383613273364
            },
            "filecoin": { // FIL
                "usd": 4.66,
                "usd_24h_change": 1.2911342229613854
            }, 
            "litecoin": { // 莱特
                "usd": 73.46,
                "usd_24h_change": 0.39121018732592916
            },
            "solana": { // 索拉娜
                "usd": 181.67,
                "usd_24h_change": 5.627780654708391
            }
        }
    }
  ```

### 7、代币余额列表（Server API）

  `path: /fetch-data/token-list?network={network}&address={address}`

  `method: GET`

  查询当前网络钱包地址的所有代币余额清单（只有有余额的代币才会返回），取代币余额信息后拼接到钱包列表中展示（在BTC、ETH币之后）

  参数：
    
    chainNames 可选，额外要增加查询行情的token名称，多个使用“,”（英文逗号）拼接，示例值：bitcoin,solana,litecoin，取值可参考https://api.coingecko.com/api/v3/coins/list接口的返回值

  响应值：

  ```
    {
      "code": 200,
      "msg": null,
      "data": [
          {
              "contractAddress": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14", // 代币合约地址
              "fullName": "Wrapped Ether", // 代币全称
              "symbol": "WETH", //代币符号
              "img": "/token/images/weth_28.png", // 代币图片，前缀为服务器地址http://35.240.161.157（也可取https://github.com/Safnect-DAO/web3-js-sdk/tree/main/images图片放在本地，加快加载速度）
              "network": "testnet", // 网络
              "totalSupply": "51,312.419112809532", // 总供应量
              "decimals": 18, // 小数精度（最小单元，不可分割粒度）
              "sno": 1, 
              "chain": 11155111, // 链ID
              "invisable": false, 
              "amount": "0.474" // 余额（数值无需转换，可以直接展示）
          }, {
              "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
              "fullName": "Tether USD",
              "symbol": "USDT",
              "img": "/token/images/tethernew_32.png",
              "network": "testnet",
              "totalSupply": "51,312.419112809532",
              "decimals": 6,
              "sno": 2,
              "chain": 1,
              "invisable": false,
              "amount": "32741.53"
          }
      ]
  }
  ```

### 8、查询某一种代币余额

  `Eth.getTokenBalance(network, contractAddress, address, callback(balance))`;

  根据钱包地址、代币合约地址查询代币余额，余额为回调函数中的参数，但需要注意的是balance需要进行精度转换，比如返回的是USDT，由接口7得知USDT代币的精度为6，此时真实余额 = balance / Math.pow(10, 6);

  参数：
    
    network 网络

    contractAddress 代币合约地址

    address 钱包地址

    callback(balance) 余额


### 9、构建代币交易

  `Eth.buildTokenTx(network, from, to, amount, tokenContractAddress);`

  本功能函数与3、构建交易类似，但是实现方式不同，用于构建代币转账时的交易数据，构建完成后，两者都是用相同的4、发送交易（sendTx函数）发送交易。

  参数：
    
    network 网络

    from 发送钱包地址

    to 接收钱包地址

    amount 发送数额字符串（数额需要转换，如果当前的余额为33.56，用户填的发送额度是10.5，则参数值 = 10.5 * Math.pow(10, 6) = 10500000，参数值传'10500000'）

    tokenContractAddress 代币合约地址（代币余额列表接口中获取）


  返回值：

    tx: Object  构建好的交易参数，发送交易时的入参

    gasFee 交易费（单位ETH）
  


## 示例代码
```
  // 获取钱包地址
  const addr = Eth.getAddr('68274785307114342739009070531363005661093007227002666619093312887277039497826', '57074332750356523974697938118298959263773902561076999589016829257321074546695');
  console.log(`Eth address is ${addr}`);
  
  // 构建交易 and 发送交易 （ETH币）
  Eth.buildTx('testnet', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', '0xb555120ea4dea26917aae68c8eff198cca17323e', 0.0035).then(redata => {
    console.log(redata);
    const tx = redata.tx;
    const gasFee = redata.gasFee;
    console.log(`gasFee is ${gasFee}`);
    Eth.sendTx('testnet', tx, '92344248619262638988884847660942631348652793639982218536482004342116811874981').then(receipt => {
      console.log(`tx id is ${receipt.transactionHash}`);
    });
  });


  // 构建交易 and 发送交易 （代币）
  Eth.buildTokenTx('testnet', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', '0xb555120ea4dea26917aae68c8eff198cca17323e', '1600000000000000', '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14').then(redata => {
    console.log(redata);
    const tx = redata.tx;
    const gasFee = redata.gasFee;
    console.log(`gasFee is ${gasFee}`);
    Eth.sendTx('testnet', tx, '92344248619262638988884847660942631348652793639982218536482004342116811874981').then(receipt => {
      console.log(`tx id is ${receipt.transactionHash}`);
    });
  });
```

    
