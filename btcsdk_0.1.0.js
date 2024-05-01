import { BtcWallet, TBtcWallet } from "@okxweb3/coin-bitcoin";
import pkg from 'meta-contract';
const {mvc, FtManager, API_TARGET, apiHost, Wallet, BN } = pkg;

const mainnet = 'mainnet';

// 注意输入输出参数中的数值单位，分别有btc和satoshi。
// 100000000 satoshi = 1 BTC
// 1 BTC = 100000000 satoshi


/* 获取随机私钥
async function getKey(callback) {  
  let wallet = new TBtcWallet();
  let key = await wallet.getRandomPrivateKey()
  callback(key);
}

//getKey();
*/

/* 获取钱包地址
  参数：
    network 网络，取值mainnet|testnet
    publicKeyX 公钥X轴十进制数字字符串
    publicKeyY 公钥y轴十进制数字字符串
  响应：
    钱包地址
   
key:  cN87zkQrTVqu8rRvMW16vs5KZ2d93LfrkzPZo1mGzckDM6wbGbSm
segwit_native address:  {
  address: 'tb1ptard2ya5fyd7h3kxcyrv0u5f6czqxy28n5s98zm5nyfay2jmaltqjfsj9k',
  publicKey: 'a9b9ae4255e2330e6d25c264beb0f56a2e6c2d8032f6cdd4298aac5d6e9353c1',
  publicKey: '0269a4692e7496a63b2302e4b9f70539dba0332d0004cf7aa25f55f23fad21dcd5
  compressedPublicKey: '03a9b9ae4255e2330e6d25c264beb0f56a2e6c2d8032f6cdd4298aac5d6e9353c1'
  compressedPublicKey: '0269a4692e7496a63b2302e4b9f70539dba0332d0004cf7aa25f55f23fad21dcd5'
}
*/
async function getAddr(network, publicKeyX, publicKeyY) {
  
  const bgx = BigInt(publicKeyX);
  const bgy = BigInt(publicKeyY);
  const point = new mvc.crypto.Point(bgx.toString(16), bgy.toString(16), true);
  
  const pub = await mvc.PublicKey.fromPoint(point, true);
  var wallet;
  if (network == mainnet) {
    wallet = new BtcWallet(); // mainnet
  } else {
    wallet = new TBtcWallet(); // testnet
  }
  let param = {
      publicKey: pub.toHex(),
     //addressType: "segwit_native", // bc1q0cr4sf5a738eh70x6xg7hurvkrtem9krz6tp75
     //addressType: "segwit_nested", // 36d6UTZ8iNLebt4nMi9eEyKAYTEpvAEWfb
     addressType: "segwit_taproot", // bc1pfr4jgtqqdqufcz6g2atg9adurthzn6tq73l4xqzng86tufyr02xsnh7znu
  }
  let addr = await wallet.getAddressByPublicKey(param);
  console.log('addr: ', addr);
  return addr;
  
}

/* 获取钱包余额
  参数：
    network 网络，取值mainnet|testnet
    address  钱包地址
    callback(success, data)  回调
    
 data:
{
  "code": 0,
  "message": "success",
  "processingTime": 2,
  "data": {
    "balance": 0.00061067, // 当前余额，单位为BTC
    "block": {
      "incomeFee": 0.00106836,
      "spendFee": 0.00058545
    },
    "mempool": {
      "incomeFee": 0.00012776,
      "spendFee": 0
    }
  }
}
*/
async function getBalance(network, address, callback) {
  const url = 'https://www.metalet.space/wallet-api/v3/address/btc-balance?net=' + network + '&address=' + address;
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

/* 获取交易记录
  参数：
    network 网络，取值mainnet|testnet
    address  钱包地址
    callback(success, data)  回调
[
  {
    txid: 'a92ae491ba9906f9296746731b72af9064037e060bcf07bc5a945607972b5c19', // 交易id 唯一值
    gasFee: 12322,  // gas费，单位：satoshi
    amount: -140000, // 数额，单位：satoshi
    receiverAddress: 'tb1qd6fq2j6g0zqpa3myepqhw9ag3s2f9hwejv7ysx', // 接收钱包地址
    senderAddress: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7', // 发送的钱包地址
    totalAmount: -152322, // 总交易数额（含gas)，单位：satoshi
    direction: 0,  // 值为表示转出，1表示转入
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
*/
async function getBillList(network, address, callback) {
  var url;
  if (network == mainnet) {
    url = 'https://mempool.space/api/address/' + address + '/txs'; // mainnet
  } else {
    url = 'https://mempool.space/testnet/api/address/' + address + '/txs' // testnet
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  (function() {
    var arr = [];
    data.forEach((item) => {
      var obj = {};
      obj.txid = item.txid;
      obj.gasFee = item.fee;
      var direction = 1;
      if (item.vin[0].prevout.scriptpubkey_address == address) {
        direction = 0;
      }
      if (direction == 1) {
        item.vout.forEach((da) => {
          if (da.scriptpubkey_address == address) {
            obj.amount = da.value;
          }
        });
        obj.senderAddress = item.vin[0].prevout.scriptpubkey_address;
        obj.receiverAddress = address;
        obj.totalAmount = obj.amount;
      } else {
        item.vout.forEach((da) => {
          if (da.scriptpubkey_address != address) {
            obj.amount = -da.value;
            obj.receiverAddress = da.scriptpubkey_address;
          }
        });
        obj.senderAddress = address;
        obj.totalAmount = obj.amount - obj.gasFee;
      }
      obj.direction = direction;
      obj.confirmed = item.status.confirmed;
      obj.time = item.status.block_time;
      arr.push(obj);
    });
    callback(true, arr);
  }) ();
  
}

/* 
获取近期燃气费列表
Gas费为近期交易手续费，手续费设置过低可能导致交易无法确认，手续费高会加快确认速度，但也有可能浪费账户额度
title三个值代表快、平均、慢，feeRate作为参数传给构建交易时的参数。
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
*/
async function getGasFeeList(network, callback) {
  const url = 'https://www.metalet.space/wallet-api/v3/btc/fee/summary?net=' + network;
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}


// 获取UTXO，交易时需要，APP端无需调用
async function getUtxos(network, address, callback) {
  const url = 'https://www.metalet.space/wallet-api/v3/address/btc-utxo?net=' + network + '&address=' + address + '&unconfirmed=1';
  
  const response = await fetch(url);
  if (!response.ok) {
    //return response.statusText;
    callback(false, response.statusText);
  }
  const data = await response.json();
  //return data;
  callback(true, data);
  
}

// 转换私钥格式，交易时需要，APP端无需调用
function getPrivateKeyWIF(network, privateKeyStr) {
  const networkSymbol = 0xef;
  const bigIntBuf = new BN(privateKeyStr).toBuffer();
  const pkBuf = Buffer.concat([Buffer.alloc(1, networkSymbol), bigIntBuf, Buffer.alloc(1, 1)]);
  const privateKey = mvc.PrivateKey.fromBuffer(pkBuf, network);
  return privateKey.toWIF();
}

// 构建交易参数，返回signParams
/*
  BTC交易流程
  1、getGasFeeList
  2、buildTx
  3、estimateGasFee
  4、sendTx
  
  1和3非必须步骤，正常交易步骤为用户填写转账表单，查出近期gas(getGasFeeList)，让用户选择一种gas种类，点击确认（buildTx），(3、estimateGasFee)弹出预估的网络费提示，再次点击确认发送交易(4、sendTx)。

  参数：
    network 网络，取值mainnet|testnet
    senderAddr 发送者地址
    amount 数额，单位satoshi
    privateKeyStr  私钥10进制数据字符串
    receiverAddr  接收者地址
    feePerB 费率，在getGasFeeList函数中获取，MVP版本选固定的avg值。
    callback(signParams) 构建结果回调，回调参数为交易参数，传入sendTx函数中签名并广播
{
  privateKey: 'cVeGiub1Q7LxH3MxREiwo1AxjHqz8deqb9ao3JJJoQM1MBbPCgW9',
  data: {
    inputs: [ [Object] ],
    outputs: [ [Object] ],
    address: 'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7',
    feePerB: 47
  }
}
*/
async function buildTx(network, senderAddr, amount, privateKeyStr, receiverAddr, feePerB, callback) {
  getUtxos(network, senderAddr, function(success, re) {
    re.data.sort((a, b) => b.satoshis - a.satoshis);
    var arr = [];
    var totalSt = 0;
    re.data.forEach((utxo) => {
      if (totalSt - amount < 10000) {
        arr.push({ txId: utxo.txId, vOut: utxo.vout, amount: utxo.satoshi });
        totalSt += utxo.satoshi;
      }
    });
    
    let btcTxParams = {
        inputs: arr,
        outputs: [
            {
                address: receiverAddr,
                amount: amount
            }
        ],
        address: senderAddr,
        feePerB: feePerB
    };
    
    console.log('tx inputs: ', btcTxParams.inputs);
    console.log('tx outputs: ', btcTxParams.outputs);
    
    var wif = getPrivateKeyWIF(network, privateKeyStr);
    let signParams = {
        privateKey: wif,
        data: btcTxParams
    };
    
    callback(signParams);
  });
}

/*
 估算燃气费
  参数：
    network 网络，取值mainnet|testnet
    signParams buildTx函数回调的数据
    callback(estGasFee) estGasFee是预估的网络费
*/
async function estimateGasFee(network, signParams, callback) {
  var wallet;
  if (network == mainnet) {
    wallet = new BtcWallet(); // mainnet
  } else {
    wallet = new TBtcWallet(); // testnet
  }
  let estFee = await wallet.estimateFee(signParams);
  console.log('Estimate gas fee: ', estFee);
  callback(estFee);
}

// 发送交易
/*
  network 网络，取值mainnet|testnet
  signParams buildTx函数回调的数据
  callback(success, data) 交易发送结果
  
{
  tx: {
    block_height: -1,
    block_index: -1,
    hash: 'a92ae491ba9906f9296746731b72af9064037e060bcf07bc5a945607972b5c19',
    addresses: [
      'tb1ptmy54n9tlxu0erj76n95u6t8xc4qra90z9vyf70tzzlkcv0qwmeqyvzmd7',
      'tb1qd6fq2j6g0zqpa3myepqhw9ag3s2f9hwejv7ysx'
    ],
    total: 140000,
    fees: 12322,
    size: 364,
    vsize: 214,
    preference: 'low',
    relayed_by: '183.240.191.162',
    received: '2024-04-23T00:57:42.467259088Z',
    ver: 2,
    double_spend: false,
    vin_sz: 3,
    vout_sz: 1,
    confirmations: 0,
    inputs: [ [Object], [Object], [Object] ],
    outputs: [ [Object] ]
  }
}
*/
async function sendTx(network, signParams, callback) {

  var wallet;
  var broadcastUrl;
  if (network == mainnet) {
    wallet = new BtcWallet(); // mainnet
    broadcastUrl = 'https://api.blockcypher.com/v1/btc/main/txs/push' // mainnet
  } else {
    wallet = new TBtcWallet(); // testnet
    broadcastUrl = 'https://api.blockcypher.com/v1/btc/test3/txs/push'; // testnet
  }
  
  let rawTransactionHex = await wallet.signTransaction(signParams);
  
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tx: rawTransactionHex })
  };

  fetch(broadcastUrl, options)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.tx) {
        callback(true, data);
      } else {
        callback(false, data);
      }
    }).catch(error => {
      console.error('Error during transaction broadcast:', error);
      callback(false, error);
    }); 
}

/*
获取比特币实时价格（USD）
  参数：
    callback 请求结果回调
  响应：
  success true | false 请求状态
  data: 59602
*/
async function getBTCPrice(callback) {
  const url = 'https://www.metalet.space/wallet-api/v3/coin/price';
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data.data.priceInfo.btc);
}
