# Runes-js-sdk
  
  这是比特币符文的js sdk，提供了符文名称解析和符文转账功能。
  
  符文是基于Bitcoin链实现，符文的蚀刻与交易信息都是以Btc交易为载体，通过Btc交易发送而发送。

  符文可以理解为是运行在Btc公链的一个Token，符文的地址就是Btc地址，符文地址=Btc地址。
  
  在Safnect中，使用了一个私钥派生多个链的钱包地址，为了隔离Btc和符文资产，Btc使用了taproot格式作为Btc的钱包地址，使用SegWit_Native作为符文的钱包地址。

  符文交易是一种特殊的Btc交易，交易原理和底层还是BTC交易流程，所以获取钱包地址、获取近期Gas费列表、获取WIF格式私钥等功能函数可以复用BTC-js-sdk。
  
  符文接入一部分为调用服务端的API，另一部分调用js sdk的功能函数组合完成。

  API Endpoint http://35.240.161.157/ API接入参考https://github.com/Safnect-DAO/wallet-mpc-server中的协议方式。
  
  
## 参考资料

  Example文件  [runes_demo.html](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/runes/runes_demo.html)

  sCrypt符文API  [https://docs.scrypt.io/open-api/btc-token/get-runes-info](https://docs.scrypt.io/open-api/btc-token/get-runes-info)
  
  uniSat插件钱包 https://unisat.io/ （支持符文，可以用来配合调试、测试）

  Btc在线区块浏览器 [https://mempool.space/testnet/tx/53fb7540f569ea2d9a9ab866021c9130cbfdde9dee776083b50b5d421b988658] (https://mempool.space/testnet/tx/53fb7540f569ea2d9a9ab866021c9130cbfdde9dee776083b50b5d421b988658)（用于查看交易信息、钱包地址信息、链上的区块信息）

  API Endpoint http://35.240.161.157/

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 runessdk.min_0.0.1.js
  
  network参数可选值：testnet | mainnet

## 功能函数与API

### 1、获取符文钱包地址

  复用Btc-js-sdk的获取钱包地址`const address = Btc.getAddr(network, publicKeyX, publicKeyY, addressType);`
  
  addressType 取值segwit_native（为了区分BTC地址）


### 2、获取符文资产余额（API）

  Path: /runes/balance-list?network={network}&address={address}
  
  
  参数：
  
  network 网络，取值mainnet|testnet
  
  address 符文钱包地址


### 3、获取符文信息（API）

  Path：/

  通过API获取符文资产后，使用该函数转换符文名称，如符文名称为：SAFNECTWALLETTEST，解析后为SAFNECT•WALLET•TEST
 
  `let runeName = Runes.convertRuneName(rune_name, spacers);`
  

  参数：
  
  rune_name 符文原始名称
  
  spacers 间隔规则

  
### 5、构建交易参数

  符文交易（转账）流程
  
  1、getGasFeeList
  
  2、buildTx
  
  3、estimateGasFee
  
  4、sendTx
  
  1和3非必须步骤，正常交易步骤为用户填写转账表单，查出近期gas(getGasFeeList)，让用户选择一种gas种类，点击确认（buildTx），(3、estimateGasFee)弹出预估的网络费提示，再次点击确认发送交易(4、sendTx)。


  ```
  Btc.buildTx(network, senderAddr, amount, receiverAddr, feePerB, callback(signParams) {
    console.log(param);
  });
  ```
  参数：
  
  network 网络，取值mainnet|testnet
  
  senderAddr 发送者地址
  
  amount 数额，单位satoshi
  
  receiverAddr  接收者地址
  
  feePerB 费率，在getGasFeeList函数中获取，MVP版本选固定的avg值。
  
  callback(signParams) 构建结果回调，回调参数为交易参数，传入sendTx函数中签名并广播

  响应参数：
  ```
  {
    
      inputs: [ [Object] ],
      outputs: [ [Object] ],
      address: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7',
      feePerB: 47
  }
  ```
  

### 6、估算燃气费

  用户填写完转账的表单（接收地址、发送的币的数量），调用SDK构建交易，通过交易参数估算本次交易的Gas费用，并提示本次交易的Gas费用。

  ```
  Btc.estimateGasFee(network, signParams, function(estFee) {
    console.log(estFee);
  });
  ```
  参数：
  
  network 网络，取值mainnet|testnet
  
  signParams buildTx函数回调的数据
  
  callback(estGasFee) estGasFee是预估的网络费
    

### 7、发送交易（广播）

  将交易数据生成数字签名并广播到节点确认。

  ```
  Btc.sendTx(network, signParams, privateKeyStr, function(success, data) {
    if (success === true) {
      // 转账请求结果
      let txid = data;
    } else {
      // 失败
      const errMsg = data;
    }
  });
  ```
  参数：
  
  network 网络，取值mainnet|testnet
  
  signParams buildTx函数回调的数据

  privateKeyStr  私钥10进制数据字符串
  
  callback(success, data) 交易发送结果
    
  
### 8、获取比特币实时价格行情（USD）

  获取当前时间比特币的实时价格（币/USD），通过取得的实时币价计算用户的钱包资产价值。

  ```
  Btc.getBTCPrice(callback(success, data) {
    if (success === true) {
      console.log(data);
    }
  });
  ```
  参数：
  
  callback 请求结果回调

  响应参数：
  ```
    success true | false 请求状态
    data: 
      {"usd":69399,"usd_24h_change":-2.8389067324642947}
  ```
  usd 实时价格（USD），usd_24h_change 24小时涨跌幅（%），usd_24h_change可通过js的toFixed(2)转换，保留2位小数。
