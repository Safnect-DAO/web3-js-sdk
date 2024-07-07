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
const testnet_rpc_url_prefix = rpc_url + 'testnet/api/';
const mainnet_rpc_url_prefix = rpc_url + 'api/';

const blockstream = new axios.Axios({
    baseURL: rpc_url
});

const serverstream = new axios.Axios({
    baseURL: `http://35.240.161.157/runes/`
});


export async function buildTx(networkStr, runeId, senderAddr, amount, receiverAddr, feePerB, callback) {
    
    if (networkStr == 'mainnet') {
      network = networks.bitcoin;
    }
    
    // 临时私钥用来预估网络费
    const keyPair = ECPair.fromWIF(
        //'cSaZkAQNnnm1PpqF6WJqyk2fxuN8ciZ483g5GED1G3bCbFnnyUfW',
        'cVeGiub1Q7LxH3MxREiwo1AxjHqz8deqb9ao3JJJoQM1MBbPCgW9',
        network
    );
    
    
    
    /* taproot
    const tweakedSigner = tweakSigner(keyPair, { network });
    Generate an address from the tweaked public key
    const p2pktr = payments.p2tr({
        pubkey: toXOnly(tweakedSigner.publicKey),
        network
    });
    */
    
    
    
    const p2wpkh = payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const address = p2wpkh.address ?? "";
    console.log(`Waiting till UTXO is detected at this Address: ${address}`);

    
    const utxos = await waitUntilUTXO(networkStr as string, senderAddr as string, runeId as string);
    utxos.sort((a, b) => a.value - b.value);
    console.log(`Using UTXO len: ${utxos.length}`);
    const psbt = new Psbt({ network });

    var inputArr = [];
    var outputArr = [];
    for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i];
        var obj = {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { value: utxo.value, script: p2wpkh.output! }
        };
        psbt.addInput(obj);
        inputArr.push(obj);
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

    const change = utxos.reduce((acc, utxo) => {
        return acc + utxo.value
    }, 0) - fee - 546*2;
    
    var obj4 = {
        address: senderAddr, // change address
        value: change
    };
    psbt.addOutput(obj4);
    outputArr.push(obj4);
    
    /* taproot
    for (let i = 0; i < psbt.inputCount; i++) {
        psbt.signInput(i, keyPair);
    }
    
    psbt.finalizeAllInputs();
    */
    psbt.signAllInputs(keyPair).finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const virtualSize = tx.virtualSize();
    console.log(`txSize is ${virtualSize}`);
    const gasFee = Math.ceil(virtualSize * feePerB);
    console.log(`gasFee -> ${gasFee}`);
    const totalFee = gasFee + 546*2;
    const change2 = utxos.reduce((acc, utxo) => {
        return acc + utxo.value
    }, 0) - totalFee;
    console.log(`change2 -> ${change2}`);
    outputArr[3].value = change2;
    
    callback(gasFee, totalFee, inputArr, outputArr);
}


export async function waitUntilUTXO(networkStr: string, address: string, runeId: string) {
    const response: AxiosResponse<string> = await serverstream.get(`rune-utxo/get?network=${networkStr}&address=${address}&runeId=${runeId}`);
    const data: IUTXO[] = response.data ? JSON.parse(response.data).data : undefined;
    return data;
}


export async function sendTx(networkStr, inputArr, outputArr, wif, callback) {

    const keyPair = ECPair.fromWIF(
        wif,
        network
    );
    // taproot
    // const tweakedSigner = tweakSigner(keyPair, { network });
    const p2wpkh = payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    
    const psbt2 = new Psbt({ network });
    for (var i=0; i<inputArr.length; i++) {
      var inputObj = inputArr[i];
      inputObj.witnessUtxo = { value: inputObj.witnessUtxo.value, script: p2wpkh.output! };
      psbt2.addInput(inputObj);
    }
    for (var i=0; i<outputArr.length; i++) {
      var outputObj = outputArr[i];
      psbt2.addOutput(outputObj);
    }
    psbt2.signAllInputs(keyPair).finalizeAllInputs();

    const tx = psbt2.extractTransaction();
    const virtualSize = tx.virtualSize();
    
    console.log(`psbt2 txSize is ${virtualSize}`);
    console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
    const txid = await broadcast(networkStr, tx.toHex());
    callback(txid);
}


export async function broadcast(networkStr: string, txHex: string) {
    const response: AxiosResponse<string> = await blockstream.post(`${networkStr}/api/tx`, txHex);
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
buildTx('testnet', '2866450:73', 'tb1q4tw7rs0ytw0elk8vcfflpkvaa8uk5x2jfs9ryy', 13,
'tb1pkhnl26t77vrewdsfm2w7naz3jl8lhdwgl0mkkxesfeps5uzyy5qsq0ly0y', 102, function(gasFee, totalFee, inputArr, outputArr) {
  console.log(gasFee, totalFee, inputArr, outputArr);
  sendTx('testnet', inputArr, outputArr, 'cVeGiub1Q7LxH3MxREiwo1AxjHqz8deqb9ao3JJJoQM1MBbPCgW9', function(re) {
    console.log(re);
  });
});
*/