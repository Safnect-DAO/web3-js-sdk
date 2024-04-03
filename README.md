# web3-js-sdk
  封装了接入MVC链的SDK和API，含获取钱包地址、代币查询、代币交易记录、代币转账、SPACE余额查询、SPACE交易记录、SPACE转账、SPACE价格查询、代币价格查询等函数。

  SPACE是MVC链的公链币。

  创建钱包地址后可在测试网水龙头领取space测试币。

## 参考资料

  MVC链官方网址：[https://www.mvcscan.com/](https://www.mvcscan.com/)

  Metalet钱包：[https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao](https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao)

  Metalet源码：[https://github.com/mvc-labs/metalet-extension](https://github.com/mvc-labs/metalet-extension)

  MVC JSSDK源码：[https://github.com/mvc-labs/meta-contract](https://github.com/mvc-labs/meta-contract)

  MVC链浏览器：[https://www.mvcscan.com/](https://www.mvcscan.com/)

  测试网水龙头：[https://witnessonchain.com/faucet/tspace](https://witnessonchain.com/faucet/tspace) 可领取测试网的space币

## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 mvcsdk_0.2.03.js
  
  network参数可选值：testnet | mainnet

## 功能函数

### 1、获取钱包地址
  `var address = Mvc.getAddr(network, publicKeyX, publicKeyY);`
  
  通过公钥字符串获取MVC链测试网或主网的钱包地址。

### 2、获取代币资产
  ```
  Mvc.getAssetsList(network, address, function(success, data) {
    if (success === true) {
      // 获取成功
      const assetArr = data;
    }
  });
  assetArr = [
    {
        "codeHash": "c9cc7bbd1010b44873959a8b1a2bcedeb62302b7",
        "genesis": "cf30c1e549f143abbd094bff65e87e8e75dce0d0",
        "name": "SYN COIN",
        "symbol": "SYN",
        "decimal": 3,
        "sensibleId": "e83f5efd2834b358f58796817468f41ef66a04e56ba0337c67363b16f46b198000000000",
        "utxoCount": 3,
        "confirmed": 673,
        "confirmedString": "673",
        "unconfirmed": 0,
        "unconfirmedString": "0"
    },
    {
        "codeHash": "c9cc7bbd1010b44873959a8b1a2bcedeb62302b7",
        "genesis": "0b1f73f615e144623e404718ffd832d498cf4120",
        "name": "RCB Money",
        "symbol": "RCB",
        "decimal": 0,
        "sensibleId": "83d319c994fb0c45268c0c5060e5296022e1fffdcbda5d6737c82fe2ed740d4600000000",
        "utxoCount": 1,
        "confirmed": 120,
        "confirmedString": "120",
        "unconfirmed": 0,
        "unconfirmedString": "0"
    }
  ];
  ```
  通过钱包地址获取代币资产列表（不含SPACE币）。

  响应参数解析：
  
    name: 代币名称
    symbol: 代币符号，如：BTC、ETH
    confirmed: 代币余额数量
    codeHash: 查询交易记录和转账时必须的参数
    genesis: 查询交易记录和转账时必须的参数
    decimal: 代币精度值（如代币余额为53200，decimal为3，则钱包余额数显示53.2）
    
### 3、获取某一种代币的交易记录
  ```
  Mvc.getAssetsRecords(network, address, codehash, genesis, function(success, data) {
    if (success === true) {
      // 获取成功
      const recordArr = data;
    }
  });

  recordArr = [
    {
        "flag": "81301_2",
        "address": "mmFkNUZAQQZitChd3BnFyyuiAfJojc4MYG",
        "codeHash": "c9cc7bbd1010b44873959a8b1a2bcedeb62302b7",
        "genesis": "138dcefad46cc7daf1363aa2bd19aea0f0c1f366",
        "time": 1710735807000,
        "height": 81301,
        "income": 7500,
        "outcome": 0,
        "txid": "935998d8b7e71096dc6b8b3d3b0436d5413ad3d1bdc8e5f83f01dff4bf0e052f"
    },
    {
        "flag": "78186_10",
        "address": "mmFkNUZAQQZitChd3BnFyyuiAfJojc4MYG",
        "codeHash": "c9cc7bbd1010b44873959a8b1a2bcedeb62302b7",
        "genesis": "138dcefad46cc7daf1363aa2bd19aea0f0c1f366",
        "time": 1709048678000,
        "height": 78186,
        "income": 20000,
        "outcome": 0,
        "txid": "6952a178b5d43236d40e2d7d7768b5b01affa296db784b7986d88a655e925a73"
    }
  ];
  
  ```
  codehash和genesis参数的值在[2、获取代币资产]返回的结果中取得，代币种类由codehash和genesis两个参数确定。
  
  响应参数解析：
    
    income: 接收数量
    time: 时间
    txid: 交易id
  
### 4、代币转账
  ```
  Mvc.trans(network, privateKeyStr, codehash, genesis, receiveAddress, amount, callback(success, data) {
    if (success === true) {
      // 成功
    } else {
      // 失败
      const errMsg = data;
    }
  });
  ```
  privateKeyStr是发送者的私钥，codehash和genesis参数的值在[2、获取代币资产]返回的结果中取得。

  receiveAddress是接收者的钱包地址；amount是转账的数额。

  响应参数：

  ```
    {
      "tx": {
          "hash": "bb78fa0d1d02d363255890c8c02a71d7d5fb731b705a6a38f2282f0f7b7de383",
          "version": 10,
          "inputs": [
              {
                  ...
              },
              {
                  ...
              },
              {
                  ...
              }
          ],
          "outputs": [
              ...
          ],
          "nLockTime": 0
      },
      "txHex": "0a000000033cb...",
      "routeCheckTx": {
          "hash": "2d0ebb3abf78be0aef6e94fc1ca76a440d560b34055c7c1e53c66dc2af89041b",
          "version": 10,
          "inputs": [
              ...
          ],
          "outputs": [
              ...
          ],
          "nLockTime": 0
      },
      "routeCheckTxHex": "0a00000001...",
      "txid": "bb78fa0d1d02d363255890c8c02a71d7d5fb731b705a6a38f2282f0f7b7de383"
  }
```

### 5、获取SPACE余额

  ```
  Mvc.getSpaceBalnace(network, address, function(success, data) {
    if (success === true) {
      // 获取成功
    }
  });
  ```
  通过钱包地址获取SPACE币余额，SPACE余额的精度值是8，取到余额后需/100000000才能显示正确的余额（可参考Metalet钱包）。

  响应参数：
  ```
  {
    "address": "mwFJC36HYDBekTXwUeHkok8ZQ2rQ3h52i9",
    "confirmed": 520000005,
    "unconfirmed": 0
  }
  ```
  confirmed表示当前的space币的余额
  unconfirmed表示未确认space币的余额

### 6、获取SPACE交易记录

  ```
  Mvc.getSpaceRecords(network, address, function(success, data) {
    if (success === true) {
      // 获取成功

    }
  });
  ```
  通过钱包地址查询SPACE币的交易记录。

  响应参数：
  ```
  [
    {
        "flag": "82942_49",
        "address": "mmVYvsxQLFZ4rG2Ep5Y7WjvduhjHd6UUXq",
        "time": 1711724157000,
        "height": 82942,
        "income": 200000000,
        "outcome": 0,
        "txid": "111afffe194a6ab1b2b96b0bf878f349aeb85ef08ece298f4cb376de5717e7b4"
    }
  ]
  ```
  income表示收到的space币数量
  time表示接收的时间
  txid表示交易id

### 7、SPACE转账

  ```
  Mvc.send(network, privateKeyStr, receiverAddress, amount, function(success, data) {
    if (success === true) {
      // 转账请求结果
      console.log(data);
    } else {
      // 失败
      const errMsg = data;
    }
    
  });
  ```
  参数privateKeyStr是发送者的私钥。

  参数receiverAddress是接收者的钱包地址。

  参数amount是转账的数额。

### 8、获取最新的代币价格（USD）

  ```
  Mvc.getAssetsPrice(function(success, data) {
    if (success === true) {
      // 获取成功
    }
  });
  ```
  获取主网链上所有代币（SPACE除外）的实时价格（建议定时查询缓存在本地）。价格单位为USD，可根据最新的价格再计算钱包中各代币的USD价值。

  响应参数：
  ```
    {
    "code": 0,
    "message": "success",
    "processingTime": 0,
    "data": {
        "priceInfo": {
            "MC": 0.011958,
            "MSP": 0.120628,
            "SHOW": 0.039468,
            "USDT": 1.003614,
            "VEMSP": 0,
            "星能": 0.001781
        }
    }
  }
  ```
  priceInfo节点中为各代币的价格（USD）

  

### 9、获取SPACE价格

  ```
  Mvc.getSpacePrice(function(success, data) {
    if (success === true) {
      // 获取成功
    }
  });
  ```
  获取主网链上SPACE的实时价格（建议定时查询缓存在本地）。价格单位为USD，可根据最新的价格再计算钱包中SPACE币的USD价值。

  响应参数：
  ```
  {
    "code": 0,
    "data": {
        "chain": "main",
        "blocks": 64325,
        "headers": 64325,
        "bestBlockHash": "000000000000000006456d75ccec8dcc4f31dbd1b398ee396ba59b9e345d3ab2",
        "nodeCount": 0,
        "hashRate": "738399067.240",
        "hashRateSymbol": "GH/s",
        "unconfirmedTxCount": 43838,
        "difficulty": "90440065826.77759",
        "circulatingSupply": 2713366,
        "estimatedBlockSize": "55.33 MB",
        "mempoolUsage": "128.01 MB",
        "price": "18.83",
        "marketCap": 51100821,
        "chainwork": "000000000000000000000000000000000000000000106a5f0a89b042ac1ee50d"
    }
  }
  ```
  price为space当前的价格（USD）
  
  
