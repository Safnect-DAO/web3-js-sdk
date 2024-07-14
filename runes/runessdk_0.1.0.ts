import {
    Transaction,
    script,
    Psbt,
    address as Address,
    initEccLib,
    networks,
    Signer as BTCSigner,
    crypto,
    payments
} from "bitcoinjs-lib";
import { ECPairFactory, ECPairAPI } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";
import axios, { AxiosResponse } from "axios";
import { Rune, RuneId, Runestone, EtchInscription, none, some, Terms, Range, Etching, Edict, applySpacers } from "runelib";


initEccLib(ecc as any);
declare const window: any;
const ECPair: ECPairAPI = ECPairFactory(ecc);
var network = networks.testnet;

const mainnet = 'mainnet';

const rpc_url = 'https://blockstream.info/';

const blockstream = new axios.Axios({
    baseURL: rpc_url
});

const serverstream = new axios.Axios({
    baseURL: `http://35.240.161.157/runes/`
});


export async function buildTx(networkStr, runeId, senderAddr, btcSendAddr, amount, receiverAddr, feePerB, callback) {
    
    if (networkStr == 'mainnet') {
      network = networks.bitcoin;
    }
    
    // 临时私钥用来预估网络费
    const keyPair = ECPair.fromWIF(
        'cSaZkAQNnnm1PpqF6WJqyk2fxuN8ciZ483g5GED1G3bCbFnnyUfW',
        network
    );
    
    const tweakedSigner = tweakSigner(keyPair, { network });
    // Generate an address from the tweaked public key
    const p2pktr = payments.p2tr({
        pubkey: toXOnly(tweakedSigner.publicKey),
        network
    });
    
    
    
    const p2wpkh = payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const address = p2wpkh.address ?? "";
    console.log(`Waiting till UTXO is detected at this Address: ${senderAddr}`);
    
    const psbt = new Psbt({ network });
    var inputArr1 = [];
    var inputArr2 = [];
    var outputArr = [];
    
    const btcUtxos = await getBtcUtxo(networkStr as string, btcSendAddr as string);
    for (var i=0; i<btcUtxos.length; i++) {
      const utxo = btcUtxos[i];
      if (utxo.value > 546) {
        var obj = {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { value: utxo.value, script: p2pktr.output! },
            tapInternalKey: toXOnly(keyPair.publicKey)
        };
        psbt.addInput(obj);
        inputArr1.push(obj);
      }
    }
    
    //const utxos = await waitUntilUTXO(networkStr as string, senderAddr as string, runeId as string);
    const utxos = await getBtcUtxo(networkStr as string, senderAddr as string);
    for (var i=0; i<utxos.length; i++) {
      const utxo = utxos[i];
      if (utxo.value == 546) {
        var objIn2 = {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { value: utxo.value, script: p2wpkh.output! }
        };
        psbt.addInput(objIn2);
        inputArr2.push(objIn2);
      }
    }

    const edicts: Array<Edict> = [];
    
    var runeIdArr = runeId.split(':');
    const edict: Edict = new Edict(new RuneId(parseInt(runeIdArr[0]), parseInt(runeIdArr[1])), BigInt(amount), 1);
    edicts.push(edict);

    const mintstone = new Runestone(edicts, none(), none(), some(2));
    
    var obj1 = {
        script: mintstone.encipher(),
        value: 0
    };
    psbt.addOutput(obj1);
    outputArr.push(obj1);

    var obj2 = {
        address:  receiverAddr, // receiver ord address
        value: 546
    };
    psbt.addOutput(obj2);
    outputArr.push(obj2);

    var obj3 = {
        address:  senderAddr, // change(sender) ord address
        value: 546
    };
    psbt.addOutput(obj3);
    outputArr.push(obj3);

    const fee = 6200;

    const change = btcUtxos.reduce((acc, utxo) => {
        return acc + utxo.value
    }, 0) - fee - 546*2;
    
    // 可用余额不足
    if (change < 2000) {
      callback(3, null, null, null, null, null);
    }
    
    var obj4 = {
        address: btcSendAddr, // change address
        value: change
    };
    psbt.addOutput(obj4);
    outputArr.push(obj4);
    
    
    for (let i = 0; i < inputArr1.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    
    for (let i = inputArr1.length; i < psbt.inputCount; i++) {
        psbt.signInput(i, keyPair);
    }
    
    psbt.finalizeAllInputs();
    

    const tx = psbt.extractTransaction();
    const virtualSize = tx.virtualSize();
    console.log(`txSize is ${virtualSize}`);
    const gasFee = Math.ceil(virtualSize * feePerB);
    console.log(`gasFee -> ${gasFee}`);
    const totalFee = gasFee + 546*2;
    const change2 = btcUtxos.reduce((acc, utxo) => {
        return acc + utxo.value
    }, 0) - totalFee;
    console.log(`change2 -> ${change2}`);
    outputArr[3].value = change2;
    
    callback(0, gasFee, totalFee, inputArr1, inputArr2, outputArr);
}

export async function getBtcUtxo(networkStr: string, address: string) {
    var prefix = '';
    if (networkStr == 'testnet') {
      prefix = 'testnet/';
    }
    const response: AxiosResponse<string> = await blockstream.get(prefix + `api/address/${address}/utxo`);
    const data: IUTXO[] = response.data ? JSON.parse(response.data) : undefined;
    return data;
}


export async function waitUntilUTXO(networkStr: string, address: string, runeId: string) {
    const response: AxiosResponse<string> = await serverstream.get(`rune-utxo/v2/get?network=${networkStr}&address=${address}&runeId=${runeId}`);
    console.log(response.data);
    const data: IUTXO[] = response.data ? JSON.parse(response.data).data : undefined;
    return data;
}


export async function sendTx(networkStr, inputArr1, inputArr2, outputArr, wif, callback) {

    const keyPair = ECPair.fromWIF(
        wif,
        network
    );
    
    const tweakedSigner = tweakSigner(keyPair, { network });
    const p2pktr = payments.p2tr({ pubkey: toXOnly(tweakedSigner.publicKey), network });
    const p2wpkh = payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    
    const psbt2 = new Psbt({ network });
    for (var i=0; i<inputArr1.length; i++) {
      var inputObj = inputArr1[i];
      inputObj.witnessUtxo = { value: inputObj.witnessUtxo.value, script: p2pktr.output! };
      inputObj.tapInternalKey = toXOnly(keyPair.publicKey);
      psbt2.addInput(inputObj);
    }
    for (var i=0; i<inputArr2.length; i++) {
      var inputObj = inputArr2[i];
      inputObj.witnessUtxo = { value: inputObj.witnessUtxo.value, script: p2wpkh.output! };
      psbt2.addInput(inputObj);
    }
    for (var i=0; i<outputArr.length; i++) {
      var outputObj = outputArr[i];
      psbt2.addOutput(outputObj);
    }
    
    
    for (let i = 0; i < inputArr1.length; i++) {
        psbt2.signInput(i, tweakedSigner);
    }
    
    for (let i = inputArr1.length; i < psbt2.inputCount; i++) {
        psbt2.signInput(i, keyPair);
    }
    
    psbt2.finalizeAllInputs();
    

    const tx = psbt2.extractTransaction();
    const virtualSize = tx.virtualSize();
    
    console.log(`psbt2 txSize is ${virtualSize}`);
    console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
    const txid = await broadcast(networkStr, tx.toHex());
    callback(txid);
}


export async function broadcast(networkStr: string, txHex: string) {
    var prefix = '';
    if (networkStr == 'testnet') {
      prefix = 'testnet/';
    }
    const response: AxiosResponse<string> = await blockstream.post(prefix + 'api/tx', txHex);
    return response.data;
}


function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return crypto.taggedHash(
        "TapTweak",
        Buffer.concat(h ? [pubKey, h] : [pubKey])
    );
}

function toXOnly(pubkey: Buffer): Buffer {
    return pubkey.subarray(1, 33);
}

function tweakSigner(signer: BTCSigner, opts: any = {}): BTCSigner {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }

    const tweakedPrivateKey = ecc.privateAdd(
        privateKey,
        tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
    );
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }

    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}


interface IUTXO {
    txid: string;
    vout: number;
    value: number;
}

// 转换符文名称 convertRuneName('DOGGOTOTHEMOON', 596)
export function convertRuneName(name: string, spacers: number) {
  return applySpacers(name, spacers);
}

/* 
buildTx('testnet', '2866450:73', 'tb1qtmalqgc3g39rw5vue3zm6vppqspdg9xze9anlp', 'tb1px8vatydhg6e6lrs6yz7rcpqx4r4k335vskkmjrd85kz4s9l5547syauxnx', 6,
'tb1q4tw7rs0ytw0elk8vcfflpkvaa8uk5x2jfs9ryy', 18, function(code, gasFee, totalFee, inputArr1, inputArr2, outputArr) {
  console.log(`code is ${code}`);
  sendTx('testnet', inputArr1, inputArr2, outputArr, 'cURZZfA1u7y4FZ2mcfXUoqCPWovx4UBQgwscBcswiCRA8JDr2KRi', function(re) {
    console.log(re);
  });
 
});
*/