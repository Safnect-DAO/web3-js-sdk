# Safnect 
  Safnect js库封装了base64、sha1加密函数，后续对接服务器端API时生成数字摘要时使用。提供了生成随机数、钱包ID、获取公钥、密钥签名等功能函数，这些函数在创建钱包，获取私钥分片时调用。
  
  ![创建钱包](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/create.jpg)

  ![获取私钥分片](https://github.com/Safnect-DAO/web3-js-sdk/blob/main/get-sharding.jpg)


## 引入

  `<script src="safnect.min.js"></script>`
  

## 功能函数

### 1、生成钱包ID

  生成一个随机的钱包Id，钱包Id是Safnect MPC钱包中的唯一标识，用于识别用户钱包身份。
 
  `const walletId = Safnect.generateWalletId();`
  
  
### 2、获取随机串

  生成一个32位长度的随机字符串，在获取服务器私钥分片时用于被签名，签名后将随机串和签名的数字摘要一起传至服务器端验签。

  `const randomStr = Safnect.getRandomStr();`
    
    
### 3、获取用户密码公钥

  创建钱包流程中，用户需要输入用户密码，将用户密码转换成公钥，并上传至服务器。（这里的公钥不是区块链中的公钥）

  `const publicKey = Safnect.getPublicKey(password);`
  
  参数：
  
  password 用户密码
  
  
### 4、签名消息

  在需要获取服务器的私钥分片时，为了保障私钥分片安全，用户需要使用密码签名一个随机字符串，签名函数返回一个16进制的数字摘要，将数字摘要、随机字符串、钱包Id三个参数传至服务器验证签名，服务器通过功用函数3中的公钥来验证数字摘要是否正确，验证通过后返回私钥分片。

  `const signatureHex = Safnect.signMsg(password, randomStr)`

  参数：

  password 用户密码

  randomStr 随机字符串（这个参数可以是任意字符串，为了安全建议每次随机生成，通过功能函数2获取） 
  

### 5、Base64加密（生成服务端Token参数时使用）

  将文本字符串转换成Base64编码
  
  `const base64Text = Safnect.base64Encode(text);`
  

### 6、Sha1加密（生成服务端Token参数时使用）

  Sha1加密，为了保障和服务端通讯安全（防数据篡改），将所有参数值使用Sha1（不可逆）加密，生成一个数字Token，服务器根据相同的规则验证Token。

  `const token = Safnect.sha1(base64Text);`

  
