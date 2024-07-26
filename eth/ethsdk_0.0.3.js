import { Address } from "ethereumjs-util";
import pkg from 'mvc-lib';
const { crypto, PublicKey } = pkg;
import {abi, base, BigNumber} from "@okxweb3/crypto-lib";
import { Web3, ETH_DATA_FORMAT, DEFAULT_RETURN_FORMAT } from "web3";
import axios from 'axios';

const provider = "https://sepolia.infura.io/v3/026d50719de84fc6b2b221056dc73d7d";
const web3Provider = new Web3.providers.HttpProvider(provider);
export const web3 = new Web3(web3Provider);

const mainprovider = "https://mainnet.infura.io/v3/026d50719de84fc6b2b221056dc73d7d";
const mainweb3Provider = new Web3.providers.HttpProvider(mainprovider);
const mainweb3 = new Web3(mainweb3Provider);

const TOKEN_TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';
const headers = { 'Content-Type': 'application/json' };
const server = new axios.Axios({ baseURL: 'http://35.240.161.157' });

// 0x6bd35dfe65497920afc55ace688c39f6f970ff52
export function getAddr(publicKeyX, publicKeyY) {
  
  const bgx = BigInt(publicKeyX);
  const bgy = BigInt(publicKeyY);
  const point = new crypto.Point(bgx.toString(16), bgy.toString(16), true);
  
  const pub = PublicKey.fromPoint(point, false);
  const addr = Address.fromPublicKey(pub.toBuffer().slice(1));
  // const addr = Address.fromPublicKey(pub.toBuffer().slice(1));
  return addr.toString();
}

function getWeb3(network) {
  if (network == 'mainnet') {
    return mainweb3;
  }
  return web3;
}

export function getBalance(network, address, callback) {
  
  getWeb3(network).eth.getBalance(address).then((balance) => {
    let amount = Number(balance);
    let num = getWeb3(network).utils.fromWei(amount, "ether");
    callback(num);
  });
}


export async function buildTx(network, from, to, amount) {
  
  let limit;
  await getWeb3(network).eth.estimateGas(
      {
        from: from,
        to: to,
        value: getWeb3(network).utils.toWei(amount, "ether"),
      },
      "latest",
      ETH_DATA_FORMAT,
    ).then((value) => { limit = value; });
  
  let gasPrice;
  await getWeb3(network).eth.getGasPrice().then(gas => {
    gasPrice = Number(gas).toString();
  });
  
  let chainId = 1;
  if (network == 'testnet') {
    chainId = 11155111;
  }
  // Creating the transaction object
  const tx = {
    from: from,
    to: to,
    value: getWeb3(network).utils.toWei(amount, "ether"),
    gas: limit,
    nonce: await getWeb3(network).eth.getTransactionCount(from),
    maxPriorityFeePerGas: gasPrice,
    maxFeePerGas: gasPrice,
    chainId: chainId,
    type: 0x2,
  };
  const gasFeeNum = BigInt(limit) * (BigInt(gasPrice))
  const gasFee = getWeb3(network).utils.fromWei(gasFeeNum, "ether");
  return {tx, gasFee};
}

export async function buildTokenTx(network, from, to, amount, tokenContractAddress) {
  
  let chainId = 1;
  if (network == 'testnet') {
    chainId = 11155111;
  }
  
  let contractABI;
  await server.get('/fetch-data/abi-get?network=' + network + '&contractAddress=' + tokenContractAddress).then(rsp => {
    contractABI = JSON.parse(rsp.data).data;
  });
  const tokenContract = new web3.eth.Contract(contractABI, tokenContractAddress);
  
  let gasLimit;
  const gasEstimate = await tokenContract.methods.transfer(to, amount).estimateGas({from: from}).then(gas => {
    console.log(`gas is ${gas}`);
    gasLimit = gas;
  });
  
  let gasPrice;
  await getWeb3(network).eth.getGasPrice().then(gas => {
    gasPrice = Number(gas).toString();
  });
  
  let data = TOKEN_TRANSFER_FUNCTION_SIGNATURE + Array.prototype.map
          .call(abi.RawEncode(['address', 'uint256'], [to, amount],),
              (x) => `00${x.toString(16)}`.slice(-2),
          ).join('');
  amount = 0;
  to = tokenContractAddress;
  
  // Creating the transaction object
  const tx = {
    from: from,
    to: to,
    value: getWeb3(network).utils.toWei(amount, "ether"),
    gas: gasLimit,
    nonce: await getWeb3(network).eth.getTransactionCount(from),
    maxPriorityFeePerGas: gasPrice,
    maxFeePerGas: gasPrice,
    chainId: chainId,
    type: 0x2,
    data: data
  };
  const gasFeeNum = BigInt(gasLimit) * (BigInt(gasPrice))
  const gasFee = getWeb3(network).utils.fromWei(gasFeeNum, "ether");
  return {tx, gasFee};
}

export async function getTokenBalance(network, contractAddress, address, callback) {

  // ERC-20代币的ABI（Application Binary Interface）
  const tokenABI = [
      {
          constant: true,
          inputs: [{name: '_owner', type: 'address'}],
          name: 'balanceOf',
          outputs: [{name: 'balance', type: 'uint256'}],
          payable: false,
          stateMutability: 'view',
          type: 'function'
      }
  ];

  // 创建合约实例
  const tokenContract = new web3.eth.Contract(tokenABI, contractAddress);

  // 调用balanceOf函数查询余额
  tokenContract.methods.balanceOf(address).call().then(balance => {
         callback(balance);
      }).catch(error => {
          console.error('Error fetching balance:', error);
      });
}


export async function sendTx(network, tx, privateKeyStr) {
  const privateKey = '0x' + BigInt(privateKeyStr).toString(16);
  const signer = getWeb3(network).eth.accounts.privateKeyToAccount(privateKey);
  getWeb3(network).eth.accounts.wallet.add(signer);
  
  let signedTx = await getWeb3(network).eth.accounts.signTransaction(tx, signer.privateKey);
  return await getWeb3(network).eth.sendSignedTransaction(signedTx.rawTransaction);
}

/*
buildTx('testnet', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', '0xb555120ea4dea26917aae68c8eff198cca17323e', 0.003).then(redata => {
  console.log(redata);
  const tx = redata.tx;
  const gasFee = redata.gasFee;
  console.log(`gasFee is ${gasFee}`);
  sendTx('testnet', tx, '92344248619262638988884847660942631348652793639982218536482004342116811874981').then(receipt => {
    console.log(`tx id is ${receipt.transactionHash}`);
  });
});

buildTokenTx('testnet', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', '0xb555120ea4dea26917aae68c8eff198cca17323e', 1600000000000000, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14').then(redata => {
  console.log(redata);
  const tx = redata.tx;
  const gasFee = redata.gasFee;
  console.log(`gasFee is ${gasFee}`);
  sendTx('testnet', tx, '92344248619262638988884847660942631348652793639982218536482004342116811874981').then(receipt => {
    console.log(`tx id is ${receipt.transactionHash}`);
  });
});
*/



//console.log(getAddr('68274785307114342739009070531363005661093007227002666619093312887277039497826', '57074332750356523974697938118298959263773902561076999589016829257321074546695'));

//getTokenBalance('testnet', '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', '0x6bd35dfe65497920afc55ace688c39f6f970ff52', function(balance) { console.log(balance); });