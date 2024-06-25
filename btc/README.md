# BTC-js-sdk
  封装了接入Bitcoin链的SDK和API，含获取钱包地址、余额查询、交易记录、价格行情查询、近期燃气费、预估燃气费、构建交易、广播等函数。

## 参考资料

  Example文件  [btc_demo.html](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/btc/btc_demo.html)

  测试网钱包地址、交易浏览器 [https://mempool.space/testnet/address/tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7](https://mempool.space/testnet/address/tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7)

  比特币插件钱包（用于调试和参考）
  
  OneKey [https://app.onekey.so/onboarding/welcome?disableAnimation=true](https://chromewebstore.google.com/detail/onekey/jnmbobjmhlngoefaiojfljckilhhlhcj)
  
  uniSat https://unisat.io/


## 引入
  使用js-sdk前，需引入最新版本的sdk js库文件。
  
  当前最新版本为 btcsdk.min_0.2.2.js
  
  network参数可选值：testnet | mainnet

## 功能函数

### 1、获取钱包地址

  通过公钥坐标字符串获取Bitcoin链测试网或主网的钱包地址，地址类型有四种，当前产品阶段先获取segwit_taproot类型的地址。
 
  `const address = Btc.getAddr(network, publicKeyX, publicKeyY, addressType)`
  

  参数：
  
  network 网络，取值mainnet|testnet
  
  publicKeyX 公钥X轴十进制数字字符串
  
  publicKeyY 公钥y轴十进制数字字符串
  
  地址类型，取值Legacy | segwit_native | segwit_nested | segwit_taproot

  
  响应：
  
  钱包地址
  
  
  
  
### 2、获取地址余额

  通过钱包地址获取地址余额，单位是Satoshi，转换成BTC需要除以1亿

  ```
  Btc.getBalance(network, address, callback(success, data)){
    if (success === true) {
      // 获取成功
      console.log(data);
    }
  });
  
 data:
  {
  	"address": "tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7",
  	"chain_stats": {
  		"funded_txo_count": 38,
  		"funded_txo_sum": 1414413,
  		"spent_txo_count": 30,
  		"spent_txo_sum": 1403601,
  		"tx_count": 33
  	}
  }
  ```

  参数：
  
  network 网络，取值mainnet|testnet
  
  address  钱包地址
  
  callback(success, data)  回调，余额=（data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum）/ 100000000
    
    
### 3、获取交易记录

  获取钱包地址的交易记录

  ```
  Btc.getBillList(network, address, function(success, data) {
    if (success === true) {
      // 获取成功
      const recordArr = data;
    }
  });

  recordArr = [
    {
      txid: 'a92ae491ba9906f9296746731b72af9064037e060bcf07bc5a945607972b5c19', // 交易id 唯一值
      gasFee: 12322,  // gas费，单位：satoshi
      amount: -140000, // 数额，单位：satoshi
      receiverAddress: 'tb1qd6fq2j6g0zqpa3myepqhw9ag3s2f9hwejv7ysx', // 接收钱包地址
      senderAddress: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7', // 发送的钱包地址
      totalAmount: -152322, // 总交易数额（含gas)，单位：satoshi
      direction: 0,  // 值为0表示转出，1表示转入
      confirmed: true, // 是否已确认
      time: 1713833866 // 时间
    },
    {
      txid: '8d97579dbf11a3c938376e39a9a16641891807e91bf9f1a245924e60edc7cb48',
      gasFee: 6816,
      amount: -50000,
      receiverAddress: 'tb1qd6fq2j6g0zqpa3myepqhw9ag3s2f9hwejv7ysx',
      senderAddress: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7',
      totalAmount: -56816,
      direction: 0,
      confirmed: true,
      time: 1713833669
    },
    {
      txid: '21f5dd493d30d2bf9ae7bbfa9b9962742cab69e5218bef7925aa9ee03d5c8ebe',
      gasFee: 32712,
      amount: 200000,
      senderAddress: 'tb1qd6fq2j6g0zqpa3myepqhw9ag3s2f9hwejv7ysx',
      receiverAddress: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7',
      totalAmount: 200000,
      direction: 1,
      confirmed: true,
      time: 1713786044
    }
  ]
  
  ```
  
  参数：
  
  network 网络，取值mainnet|testnet
  
  address  钱包地址
  
  callback(success, data)  回调
  
  
### 4、获取近期Gas列表（供用户选择Gas方案）

  Gas费为近期交易手续费，手续费设置过低可能导致交易无法确认，手续费高会加快确认速度，但也会浪费账户资金。title三个值代表快、平均、慢，feeRate作为参数传给构建交易时的参数。

  ```
  Btc.getGasFeeList(network, callback(success, data) {
    if (success === true) {
      // 成功
    
    } 
  });
  ```

  响应参数：

  ```
  {
    "code": 0,
    "message": "success",
    "processingTime": 0,
    "data": {
      "list": [
        {
          "title": "Fast",
          "desc": "About 10 minutes",
          "feeRate": 18
        },
        {
          "title": "Avg",
          "desc": "About 30 minutes",
          "feeRate": 17
        },
        {
          "title": "Slow",
          "desc": "About 1 hours",
          "feeRate": 17
        }
      ]
    }
  }
  ```

### 5、构建交易参数

  BTC交易（转账）流程
  
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
