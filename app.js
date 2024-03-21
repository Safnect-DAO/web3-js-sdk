const { FtManager, API_TARGET, apiHost } = require('meta-contract')

//引入express模块
var express = require('express');
//创建一个app对象，类似一个web 应用（网站）
var app = express();

var bodyParser = require('body-parser');
app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
extended: true
}));



// publish
// 参数network/key/feeb/tokenName/tokenSymbol/decimalNum/address/tokenAmount/allowIncreaseMints
// 返回{ txHex, txid, tx, genesis, codehash, sensibleId }
app.post('/publish', function (req, res){

  const ft = new FtManager({
    network: req.body.network,
    apiTarget: API_TARGET.MVC,
    purse: req.body.key, //the wif of a mvc address to offer transaction fees
    feeb: parseFloat(req.body.feeb),
    apiHost,
  });
  
  var obj = genesis(ft, req.body, res, mint);
});

// 创世
// 参数network/key/feeb/tokenName/tokenSymbol/decimalNum
// 返回{ txHex, txid, tx, genesis, codehash, sensibleId }
app.post('/genesis', function (req, res){

  const ft = new FtManager({
    network: req.body.network,
    apiTarget: API_TARGET.MVC,
    purse: req.body.key, //the wif of a mvc address to offer transaction fees
    feeb: req.body.feeb,
    apiHost,
  });
  
  var obj = genesis(ft, req.body, res);
});

// 铸币
// 参数network/key/feeb/sensibleId/address/tokenAmount/allowIncreaseMints
// 返回{ txid, txHex, tx }
app.post('/mint', function (req, res){

  const ft = new FtManager({
    network: req.body.network,
    apiTarget: API_TARGET.MVC,
    purse: req.body.key, //the wif of a mvc address to offer transaction fees
    feeb: req.body.feeb,
    apiHost,
  });
  
  var obj = mint(ft, req.body, res);
});

// 转账
// 参数network/key/feeb/codehash/genesis/arr
// 返回{ txid, txHex, tx }
app.post('/trans', function (req, res){

  const ft = new FtManager({
    network: req.body.network,
    apiTarget: API_TARGET.MVC,
    purse: req.body.key, //the wif of a mvc address to offer transaction fees
    feeb: req.body.feeb,
    apiHost,
  });
  var arr = [];
  var obj = trans(ft, req.body, res);
});


//创建一个web服务器，可以认为就是web服务器对象
//监听8081端口，当监听成功时回调
var server = app.listen(8081, function () {
   var host = server.address().address;  //地址
   var port = server.address().port;  //端口
    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});

async function genesis(ft, obj, res, fun) {
  console.log('request:');
  console.log(obj);
  try {
    let re = await ft.genesis({
      version: 2,
      tokenName: obj.tokenName,
      tokenSymbol: obj.tokenSymbol,
      decimalNum: parseInt(obj.decimalNum),
      genesisWif: obj.key,
    });
    console.log('genesis');
    console.log(re);
    if (fun) {
      var req = obj;
      req['sensibleId'] = re.sensibleId;
      req['codehash'] = re.codehash;
      req['genesis'] = re.genesis;
      fun(ft, req, res, trans);
    } else {
      res.send(re);
    }
  } catch(err) {
    res.send(err);
  }
}

async function mint(ft, obj, res, fun) {

  try {
    let mintObj = await ft.mint({
      version: 2,
      sensibleId: obj.sensibleId,
      genesisWif: obj.key,
      receiverAddress: obj.address,
      tokenAmount: parseInt(obj.tokenAmount),
      allowIncreaseMints: JSON.parse(obj.allowIncreaseMints), //if true then you can mint again
    });
    console.log('mint');
    console.log(mintObj);
    if (fun && obj.recaddress1) {
      var arr = [];
      arr.push({address: obj.recaddress1, amount: obj.recamount1});
      if (obj.recaddress2) {
        arr.push({address: obj.recaddress2, amount: obj.recamount2});
      }
      obj['arr'] = arr;
      fun(ft, obj, res)
    } else {
      res.send(mintObj);
    }
  } catch(err) {
    res.send(err);
  }
} 

async function trans(ft, obj, res) {

  try {
      /**
      var arr = [
        {
          address: 'mjzpZeb14NDCgqb5iDCGVpEJ2vTy9AFNXQ',
          amount: '6000',
        },
        {
          address: 'mmFkNUZAQQZitChd3BnFyyuiAfJojc4MYG',
          amount: '20000',
        }];
        */
        console.log('trans');
        console.log('obj');
      let transObj = await ft.transfer({
        codehash: obj.codehash,
        genesis: obj.genesis,
        receivers: obj.arr,
        senderWif: obj.key
        // ftUtxos: ParamFtUtxo[],
        // ftChangeAddress: string | mvc.Address,

        // utxos: ParamUtxo[],
        // changeAddress: string | mvc.Address

      });
      console.log('trans');
    console.log(transObj);
    res.send(transObj);
  } catch(err) {
    res.send(err);
  }
} 
