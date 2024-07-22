# Eth js sdk

  以太坊JS-SDK，测试网使用的是Sepolia（雪波丽）。

  以太坊钱包地址是EVM格式的地址，测试网及主网地址相同，包括其他的EVM公链钱包地址都与ETH地址相同。

  接入以太链也需要sdk结合API完成，API查询实时数据，sdk封装常用的函数库。
  
  
## 参考资料

  Sepolia区块链浏览器地址：[https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)

  Example文件  [eth_demo.html](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/eth/eth_demo.html)

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 ethsdk.min_0.0.1.js
  
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
              "directory": "OUT"  // OUT转出，IN为转入
          },
          {
              "amount": "0.0035 ETH",
              "gasFee": "0.00029253",  
              "receiveAddress": "0xb555120ea4deA26917aAE68c8EFF198CCA17323E",
              "txid": "0x8d4db20d619526e7877da660f965dcbae7ae89c56f6e8c62c95e939d5bb0821b ",
              "fromAddress": "0x6bD35dfE65497920afC55AcE688c39f6f970ff52",
              "time": "2024-07-20 14:55:48",
              "directory": "OUT"
          }
      ]
  }
  ```

### 6、获取实时行情（Server API）

  path: /fetch-data/price

  当前支持这些ethereum,bitcoin,solana,litecoin,dogecoin,conflux,arbitrum,Filecoin币的市场实时价格返回，该接口缓存5秒数据。

  参数：
    
    chainNames 可选，token名称，多个使用“,”（英文逗号）拼接，示例值：bitcoin,solana,litecoin

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
## 示例代码
```
  // 获取钱包地址
  const addr = Eth.getAddr('68274785307114342739009070531363005661093007227002666619093312887277039497826', '57074332750356523974697938118298959263773902561076999589016829257321074546695');
  console.log(`Eth address is ${addr}`);
  
  // 构建交易 and 发送交易
  
  Eth.buildTx('testnet', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', '0xb555120ea4dea26917aae68c8eff198cca17323e', 0.0035).then(redata => {
    console.log(redata);
    const tx = redata.tx;
    const gasFee = redata.gasFee;
    console.log(`gasFee is ${gasFee}`);
    Eth.sendTx('testnet', tx, '92344248619262638988884847660942631348652793639982218536482004342116811874981').then(receipt => {
      console.log(`tx id is ${receipt.transactionHash}`);
    });
  });
```

    
