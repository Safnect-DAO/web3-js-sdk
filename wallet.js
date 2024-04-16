import {mvc, FtManager, API_TARGET, apiHost, Wallet, BN} from 'meta-contract';

const testnetPath = 'https://testnet.mvcapi.com/';
const mainnetPath = 'https://mainnet.mvcapi.com/';

// 获取钱包地址
export function getAddr(network, publicKeyX, publicKeyY) {
  var bgx = BigInt(publicKeyX);
  var bgy = BigInt(publicKeyY);
  var point = new mvc.crypto.Point(bgx.toString(16), bgy.toString(16), true);
  var pub = mvc.PublicKey.fromPoint(point, true);
  var addr = pub.toAddress(network).toString();
  return addr;
  
  /*通过私钥生成钱包地址
  const privateKey = mvc.PrivateKey.fromHex(privateKeyHex);
  const wif = privateKey.toWIF();
  const address = privateKey.toAddress(network).toString()
  console.log({network, wif, address})
  return address;
  */
}

// 获取余额
export async function getAssetsList(network, address, callback) {
  var url;
  var suffix = 'contract/ft/address/' + address + '/balance';
  if (network == 'testnet') {
    url = testnetPath + suffix;
  } else if (network == 'mainnet') {
    url = mainnetPath + suffix;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

function getPrivateKeyWIF(network, privateKeyStr) {
  const networkSymbol = 0xef;
  const bigIntBuf = new BN(privateKeyStr).toBuffer();
  const pkBuf = Buffer.concat([Buffer.alloc(1, networkSymbol), bigIntBuf, Buffer.alloc(1, 1)]);
  const privateKey = mvc.PrivateKey.fromBuffer(pkBuf, network);
  const address = privateKey.toAddress(network).toString();
  console.log(address);
  return privateKey.toWIF();
}

// 转账
export async function trans(network, privateKeyStr, codehash, genesis, receiveAddress, amount, callback) {
  
  const wif = getPrivateKeyWIF(network, privateKeyStr);
  
  const ft = new FtManager({
    network: network,
    apiTarget: API_TARGET.MVC,
    purse: wif, //the wif of a mvc address to offer transaction fees
    feeb: 1,
    apiHost
  });
  var arr = [{address: receiveAddress, amount: amount}];
  try {
    var obj = await ft.transfer({
      codehash: codehash,
      genesis: genesis,
      receivers: arr,
      senderWif: wif
    });
    callback(true, obj);
  } catch (err) {
    console.log(err);
    callback(false, err.message);
  }
  
}

// 资产记录
export async function getAssetsRecords(network, address, codehash, genesis, callback) {
  var url;
  var suffix = 'contract/ft/address/' + address + '/' + codehash + '/' + genesis + '/tx';
  if (network == 'testnet') {
    url = testnetPath + suffix;
  } else if (network == 'mainnet') {
    url = mainnetPath + suffix;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

// 获取Space余额
export async function getSpaceBalnace(network, address, callback) {
  var url;
  var suffix = 'address/' + address + '/balance';
  if (network == 'testnet') {
    url = testnetPath + suffix;
  } else if (network == 'mainnet') {
    url = mainnetPath + suffix;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

// 获取Space交易明细
export async function getSpaceRecords(network, address, callback, confirmed) {
  var url;
  var suffix = 'address/' + address + '/tx?confirmed=' + confirmed;
  if (network == 'testnet') {
    url = testnetPath + suffix;
  } else if (network == 'mainnet') {
    url = mainnetPath + suffix;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

// 获取代币价格（USD）
export async function getAssetsPrice(callback) {
  var url = 'https://www.metalet.space/wallet-api/v3/coin/contract/ft/price';
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

// 获取Space币价格（USD）
export async function getSpacePrice(callback) {
  var url = 'https://api.mvcscan.com/browser/v1/chain/summary';
  
  const response = await fetch(url);
  if (!response.ok) {
    callback(false, response.statusText);
  }
  const data = await response.json();
  callback(true, data);
}

// 转账（SPACE）
export async function send(network, privateKeyStr, receiverAddress, amount, callback) {
  try {
    const wif = getPrivateKeyWIF(network, privateKeyStr);
    const feeb = 1;
    var wallet = new Wallet(wif, network, feeb, API_TARGET.MVC);
    
    let utxos = await wallet.getUnspents();
    console.log('utxos.length -> ' + utxos.length);
    if (utxos.length >= 3) {
      const { txId } = await wallet.merge()
      console.log(txId);
    }
    
    const data = await wallet.send(receiverAddress, amount);
    callback(true, data);
  } catch (err) {
    console.log(err);
    callback(false, err.message);
  }
}
