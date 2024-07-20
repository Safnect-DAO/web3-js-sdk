# Runes-js-sdk
  
  这是比特币符文的js sdk，提供了符文名称解析和符文转账功能。
  
  符文是基于Bitcoin链实现，符文的蚀刻与交易信息都是以Btc交易为载体，通过Btc交易发送而发送。

  符文可以理解为是运行在Bitcoin链上的一个Token，符文的地址就是Btc地址，即符文地址=Btc地址。
  
  在Safnect中，使用了一个私钥派生多个链的钱包地址，为了隔离Btc和符文资产，Btc使用了taproot格式作为Btc的钱包地址，使用SegWit_Native作为符文的钱包地址。符文转账时，需要传入BTC地址和符文地址，取BTC地址余额作为GasFee，符文地址的余额作为符文余额来转账。

  符文交易是一种特殊的Btc交易，交易原理和底层还是BTC交易流程，所以获取钱包地址、获取近期Gas费列表、获取WIF格式私钥等功能函数可以复用BTC-js-sdk。
  
  符文接入一部分为调用服务端的API，另一部分调用js sdk的功能函数组合完成。

  API Endpoint http://35.240.161.157/  API接入参考https://github.com/Safnect-DAO/wallet-mpc-server 中的协议方式。
  
  
## 参考资料

  Example文件  [runes_demo.html](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/runes/runes_demo.html)

  sCrypt符文API  [https://docs.scrypt.io/open-api/btc-token/get-runes-info](https://docs.scrypt.io/open-api/btc-token/get-runes-info)
  
  uniSat插件钱包 https://unisat.io/ （支持符文，可以用来配合调试、测试）

  Btc在线区块浏览器 [https://mempool.space/testnet/tx/53fb7540f569ea2d9a9ab866021c9130cbfdde9dee776083b50b5d421b988658] (https://mempool.space/testnet/tx/53fb7540f569ea2d9a9ab866021c9130cbfdde9dee776083b50b5d421b988658)
  （用于查看交易信息、钱包地址信息、链上的区块信息）

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 runessdk.min_0.1.0.js
  
  network参数可选值：testnet | mainnet

## 功能函数与API

### 1、获取符文钱包地址

  复用Btc-js-sdk的获取钱包地址`const address = Btc.getAddr(network, publicKeyX, publicKeyY, addressType);`
  
  addressType 取值segwit_native（为了区分与BTC地址不同）


### 2、获取符文资产余额（API）

  `Path: /runes/balance-list?network={network}&address={address}`
  
  参数：
  
  network 网络，取值mainnet|testnet
  
  address 符文钱包地址

  响应：
  
  ```
    [
        {
            "rune": "SAFNECTWALLETTEST", // 名称
            "runeid": "2866450:73",  // 符文id
            "spacedRune": "SAFNECT•WALLET•TEST", // 美化后的名称
            "amount": "27", // 余额
            "symbol": "¤", // 符号
            "divisibility": 0, // 最小单位精度
            "image": "https://xxx.xx.xx/xxx/xx.png"  // 符文图片
        }
    ]
  
  ```


### 3、获取符文信息（API）

  `Path：/runes/runes-info?network={network}&runeId={runeId}`

  参数：
  
  network 网络，取值mainnet|testnet
  
  runeId 符文Id

  响应：
  ```
    {
        "runeid": "2866450:73", // 符文id
        "rune": "SAFNECTWALLETTEST",  // 符文名称
        "spacedRune": "SAFNECT•WALLET•TEST", // 美化后的名称
        "number": 6134,  // 块中的交易数
        "height": 2866450,  // 块的高度
        "txidx": 73, 
        "timestamp": 1720244891,
        "divisibility": 0, // 最小单元精度
        "symbol": "¤",  // 符号
        "etching": "e53363a07303ad036de6dadb41342aba77acf3ea94e21ff02e9137aea1257f4d",  // etch txid 
        "premine": "1000",  // 预造数量
        "terms": null,
        "mints": "0",
        "burned": "0",
        "holders": 3,  // 持有地址数
        "transactions": 11, // 交易总数
        "supply": "1000", // 总供应量
        "start": null,
        "end": null,
        "mintable": false, // 是否可铸造
        "remaining": "0",
        "image": "https://xxx.xx.xx/xxx/xx.png"  // 符文图片
    }
  ```

  该接口的数据可以缓存在本地，无需每次重复调用，符文蚀刻之后，基本信息不会再改变。
  

### 4、转换符文名称

  通过API获取符文资产后，使用该函数转换符文名称，如符文名称为：SAFNECTWALLETTEST，解析后为SAFNECT•WALLET•TEST
 
  `let runeName = Runes.convertRuneName(rune_name, spacers);`
  

  参数：
  
  rune_name 符文原始名称
  
  spacers 间隔规则

  
### 5、获取符文历史交易记录（API）

  `Path：/runes/bill-list/get?network={network}&address={address}`

  参数：
  
  network 网络，取值mainnet|testnet
  
  address 符文钱包地址

  响应：
  ```
  [
    {
        "receiverAddress": "tb1q4tw7rs0ytw0elk8vcfflpkvaa8uk5x2jfs9ryy", // 接收地址
        "symbol": "¤",  // 符号
        "totalAmount": 6, // 总数量
        "gasFee": 5280,  // GasFee（单位是Satoshi，1BTC=1亿Satoshi）
        "amount": 6,  // 数量
        "senderAddress": "tb1qtmalqgc3g39rw5vue3zm6vppqspdg9xze9anlp",  // 发送地址
        "txid": "98e6d2e542d41bb9ffbc1c8b2e06e1b43358f29fb5b13ef0f3a716976fcf3ac1", // 交易id
        "runeId": "2866450:73",  // 符文id
        "time": 1720875445,  // 时间
        "runeName": "SAFNECT•WALLET•TEST", // 符文名称
        "confirmed": true,  // 确认的
        "direction": 0  // 进出方向，1：进，0：出
    },
    {
        "receiverAddress": "tb1qtmalqgc3g39rw5vue3zm6vppqspdg9xze9anlp",
        "symbol": "¤",
        "totalAmount": 35,
        "gasFee": 4716,
        "amount": 35,
        "senderAddress": "tb1q4tw7rs0ytw0elk8vcfflpkvaa8uk5x2jfs9ryy",
        "txid": "7787c71328b02356cdcbcdcb510c56dd8176b9c1bf1314fac0b3414d0cd07590",
        "runeId": "2866450:73",
        "time": 1720848654,
        "runeName": "SAFNECT•WALLET•TEST",
        "confirmed": true,
        "direction": 1
    }
  ]
  ```
  

### 6、构建交易参数

  
  符文交易（转账）流程
  
  1、Btc.getGasFeeList 获取近期Gas费率列表（使用Btc-js-sdk）
  
  2、Runes.buildTx 构造完交易参数得到网络费和待签名的交易数据
  
  3、Btc.getPrivateKeyWIF(network, privateKeyStr) 通过10进制私钥获取WIF格式私钥（使用Btc-js-sdk）
  
  4、Runes.sendTx(network, inputArr, outputArr, wif, callback);


  ```
  Runes.buildTx(network, runeId, senderAddr, btcSendAddr, amount, receiverAddr, feePerB, callback(gasFee, totalFee, inputArr1, inputArr2, outputArr) {})
  ```
  参数：
  
  network 网络，取值mainnet|testnet
  
  senderAddr 发送者符文地址

  btcSendAddr 发送者BTC地址
  
  amount 最小单位数额（受API 3、获取符文信息返回的divisibility的值影响，如：divisibility值为2，表示当前符文的最小单元为0.01，此时如果amount填写的120，则实际转账为1.2；divisibility值为1，表示当前符文的最小单元为0.1，此时如果amount的值填写为153，则实际转账为15.3)，可使用js函数Math.pow(10, divisibility)对最小单元的数值进行转换。
  
  receiverAddr  接收者地址
  
  feePerB 费率，在getGasFeeList函数中获取，选固定的avg值。
  
  callback(code, gasFee, totalFee, inputArr1, inputArr2, outputArr) 构建结果回调，回调参数依次为code状态码（0是成功，3表示余额不足）、Gas费、交易总费用、交易入参1、交易入参2、交易出参，交易入参、交易出参在下一步发送交易时用到
  

### 7、发送交易

  将交易数据生成数字签名并广播到节点确认。

  ```
  Runes.sendTx(network, inputArr1, inputArr2, outputArr, wif, callback(re) {
    let txid = re;
  });
  ```
  参数：
  
  network 网络，取值mainnet|testnet
  
  inputArr1 交易入参1

  inputArr2 交易入参2

  outputArr  交易出参

  wif  使用Btc-js-sdk Btc.getPrivateKeyWIF(network, privateKeyStr) 获取WIF格式私钥
  
  callback(re) 交易结果回调
    
