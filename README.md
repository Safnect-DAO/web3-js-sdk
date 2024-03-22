# web3-js-sdk
  封装了接入MVC链的SDK和API，含获取钱包地址、代币查询、代币交易记录、代币转账、SPACE余额查询、SPACE交易记录、SPACE转账、SPACE价格查询、代币价格查询等函数。

  SPACE是MVC链的公链币。

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 mvcsdk.0.1.12.js
  
  network参数可选值：testnet | mainnet

## 功能函数

### 1、获取钱包地址
  `var address = Mvc.getAddr(network, privateKeyHex);`
  
  通过私钥的16进制字符串获取MVC链测试网或主网的钱包地址。

### 2、获取代币资产
  ```
  Mvc.getAssetsList(network, address, function(success, data) {}
    if (success) {
      // 获取成功
    }
  );
  ```
  通过钱包地址获取代币资产列表（不含SPACE币）

### 3、获取某一种代币的交易记录
  ```
  Mvc.getAssetsRecords(network, address, codehash, genesis, function(success, data) {}
    if (success) {
      // 获取成功
    }
  );
  ```
  codehash和genesis参数在2、获取代币资产返回的结果中取得。

### 4、代币转账
  ```
  Mvc.trans((network, privateKeyHex, codehash, genesis, receiveAddress, amount, callback);
  ```
  privateKeyHex是发送者16进制的私钥，codehash和genesis参数在2、获取代币资产返回的结果中取得。

  receiveAddress是接收者的钱包地址；amount是转账的数额。

### 5、获取SPACE余额

  ```
  Mvc.getSpaceBalnace
  ```
