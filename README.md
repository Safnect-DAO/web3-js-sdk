# web3-js-sdk
  封装了接入MVC链的SDK和API，含获取钱包地址、代币查询、代币交易记录、代币转账、SPACE余额查询、SPACE交易记录、SPACE转账、SPACE价格查询、代币价格查询等函数。

  SPACE是MVC链的公链币。

  在接入前需准备钱包账号，安装Metalet的chrome插件钱包，创建钱包并在水龙头领取space测试币。

## 参考资料

  MVC链官方网址：[https://www.mvcscan.com/](https://www.mvcscan.com/)

  Metalet钱包：[https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao](https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao)

  Metalet源码：[https://github.com/mvc-labs/metalet-extension](https://github.com/mvc-labs/metalet-extension)

  MVC JSSDK源码：[https://github.com/mvc-labs/meta-contract](https://github.com/mvc-labs/meta-contract)

  MVC链浏览器：[https://www.mvcscan.com/](https://www.mvcscan.com/)

  测试网水龙头：[https://witnessonchain.com/faucet/tspace](https://witnessonchain.com/faucet/tspace) 可领取测试网的space币

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 mvcsdk_0.1.12.js
  
  network参数可选值：testnet | mainnet

## 功能函数

### 1、获取钱包地址
  `var address = Mvc.getAddr(network, publicKeyX, publicKeyY);`
  
  通过公钥字符串获取MVC链测试网或主网的钱包地址。

### 2、获取代币资产
  ```
  Mvc.getAssetsList(network, address, function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```
  通过钱包地址获取代币资产列表（不含SPACE币）。

### 3、获取某一种代币的交易记录
  ```
  Mvc.getAssetsRecords(network, address, codehash, genesis, function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```
  codehash和genesis参数的值在[2、获取代币资产]返回的结果中取得，代币种类由codehash和genesis两个参数确定。

### 4、代币转账
  ```
  Mvc.trans((network, privateKeyStr, codehash, genesis, receiveAddress, amount, callback);
  ```
  privateKeyStr是发送者的私钥，codehash和genesis参数的值在[2、获取代币资产]返回的结果中取得。

  receiveAddress是接收者的钱包地址；amount是转账的数额。

### 5、获取SPACE余额

  ```
  Mvc.getSpaceBalnace(network, address, function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```
  通过钱包地址获取SPACE币余额，SPACE余额的精度值是8，取到余额后需/100000000才能显示正确的余额（可参考Metalet钱包）。

### 6、获取SPACE交易记录

  ```
  Mvc.getSpaceRecords(network, address, function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```
  通过钱包地址查询SPACE币的交易记录。

### 7、SPACE转账

  ```
  Mvc.send(network, privateKeyStr, receiverAddress, amount, function(data) {
    // 转账请求结果
    console.log(data);
  });
  ```
  参数privateKeyStr是发送者的私钥。

  参数receiverAddress是接收者的钱包地址。

  参数amount是转账的数额。

### 8、获取最新的代币价格（USD）

  ```
  Mvc.getAssetsPrice(function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```

  获取主网链上所有代币（SPACE除外）的实时价格（建议定时查询缓存在本地）。价格单位为USD，可根据最新的价格再计算钱包中各代币的USD价值。

### 9、获取SPACE价格

  ```
  Mvc.getSpacePrice(function(success, data) {
    if (success) {
      // 获取成功
    }
  });
  ```
  
  获取主网链上SPACE的实时价格（建议定时查询缓存在本地）。价格单位为USD，可根据最新的价格再计算钱包中SPACE币的USD价值。
