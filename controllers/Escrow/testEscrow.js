//This module help to listen request
var express = require("express");
var router = express.Router();
var axios = require("axios");
const Web3 = require("web3");

const web3 = new Web3();


const Tx = require('ethereumjs-tx').Transaction;
const InputDataDecoder = require('ethereum-input-data-decoder');






web3.setProvider(
    new web3.providers.HttpProvider(
       // "https://rinkeby.infura.io/t2utzUdkSyp5DgSxasQX"
       "https://speedy-nodes-nyc.moralis.io/d67ea2c319957b719814f79a/eth/rinkeby"
    )
);

var abi = [{"inputs":[],"name":"buyer","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"confirmDelivery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currState","outputs":[{"internalType":"enum Escrow.State","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"address payable","name":"_buyer","type":"address"},{"internalType":"address","name":"_seller","type":"address"}],"name":"getSeller_Buyer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"seller","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"trading_data","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"address payable","name":"buyer","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"stateMutability":"view","type":"function"}];
const decoder = new InputDataDecoder(abi)



var contractAddress = "0xB5ce52394fE6B275bF77F0bd421dc85a39C1B9b6";


//let sellerAddress ;
//let privateKey = request.body.from_private_key;
//let buyerAddress ;



 

//-------------------------------------------------------------- Set users ---------------------------------------------------------------------


router.post("/setuser", async function (request, response) {
var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;
	
	try {
		if(request.body) {
			var ValidationCheck = true;
			if (!request.body.trading_id) {
				ResponseMessage = "Trading id is missing \n";
				ValidationCheck = false;
			}
			if (!request.body.seller_address) {
				ResponseMessage = "seller address is missing \n";
				ValidationCheck = false;
			}
			if (!request.body.buyer_address) {
				ResponseMessage += "buyer address is missing \n";
				ValidationCheck = false;
			}

			if (!request.body.from_private_key) {
				ResponseMessage += "private key is missing \n";
				ValidationCheck = false;
			}
			if (!request.body.from_address) {
				ResponseMessage += "from address is missing \n";
				ValidationCheck = false;
			} else if (!request.body.value === parseInt(request.body.value)) {
				ResponseMessage += "value must be a number \n";
				ValidationCheck = false;
			}
			
			if(ValidationCheck == true) {
				let tradingId = request.body.trading_id;
				let sellerAddress = request.body.seller_address;
				let privateKey = request.body.from_private_key;
				let  buyerAddress = request.body.buyer_address;
				 let fromAddress = request.body.from_address;


				if (sellerAddress.length < 42) {
					ResponseMessage = "Invalid seller Address";
					ResponseCode = 400;
					return;
				} else if (buyerAddress.length < 42) {
					ResponseMessage = "Invalid buyer Address";
					ResponseCode = 400;
					return;
				}else if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}


    
				web3.eth.defaultAccount = fromAddress;
				//tokenValue = tokenValue * (10 ** 6);
			//	tokenValue = tokenValue;

				let contract = new web3.eth.Contract( abi , contractAddress );
				//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
			let count = await web3.eth.getTransactionCount(fromAddress , 'latest');
				let data = contract.methods.getSeller_Buyer(tradingId, buyerAddress, sellerAddress).encodeABI();
				//console.log(data);
				
				let gasPrice = web3.eth.gasPrice ;
				let gasLimit =  2000000;
				//let gasLimit = web3.utils.toHex(6721975) ;
                var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open( "GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					contractAddress +
					"&address=" +
					fromAddress +
					"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous request
				xmlHttp.send();
				var transactions = JSON.parse(xmlHttp.responseText);
				//let balance = transactions.result;

				//let balance = 1000000000000000000000000000000;
				//console.log(balance);
				//if(balance >= tokenValue + gasLimit) {
					let rawTransaction = {
						"from": fromAddress,
						"nonce": web3.utils.toHex(count + 1),
						"gasPrice": web3.utils.toHex(20000000000),
						"gasLimit": web3.utils.toHex(gasLimit),
						
						"to": contractAddress,
						//"to": toAddress,
						"data": data,
						"chainId": 0x04
					};
					privateKey = Buffer.from(privateKey, 'hex');
					let tx = new Tx(rawTransaction , {'chain':'rinkeby'}) ;
					console.log("ye hai tx", tx);

					tx.sign(privateKey);
					let serializedTx = tx.serialize();
					let hashObj = await sendrawtransaction(serializedTx);
					console.log("ye hai hashobj" , hashObj);
				
					if (hashObj.response == '') {
						let hash = hashObj.hash;
						ResponseData = await getTransactionn(hash);
						ResponseMessage = "Transaction successfully completed";
						ResponseCode = 200;
					} else {
						ResponseMessage = hashObj.response;
						ResponseCode = 400;
						return;
					}
			//	}
				//  else {
				// 	ResponseMessage = "Balance is insufficent";
				// 	ResponseCode = 400;
				// 	return;
				// }
				
		 	} 
			 //else {
		// 		ResponseCode = 206
		// 	}
		// } else {
		// 	ResponseMessage = "Transaction cannot proceeds as request body is empty";
		// 	ResponseCode = 204
		// }
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error  ${error}`;
		ResponseCode = 400
	} finally {
		return response.status(200).json({
			code : ResponseCode,
			data : ResponseData,
			msg : ResponseMessage
		});
	}
});

// ================== Deposit==================================

router.post("/depositeth", async function (request, response) {
	var ResponseCode = 200;
		var ResponseMessage = ``;
		var ResponseData = null;
		
		try {
			if(request.body) {
				var ValidationCheck = true;
				if (!request.body.value) {
					ResponseMessage = "value is missing \n";
					ValidationCheck = false;
				}
				if (!request.body.trading_id) {
					ResponseMessage = "Trading id is missing \n";
					ValidationCheck = false;
				}
				if (!request.body.from_private_key) {
					ResponseMessage += "private key is missing \n";
					ValidationCheck = false;
				}
				if (!request.body.from_address) {
					ResponseMessage += "from address is missing \n";
					ValidationCheck = false;
				}
				 else if (!request.body.value === parseInt(request.body.value)) {
					ResponseMessage += "value must be a number \n";
					ValidationCheck = false;
				}
				
				if(ValidationCheck == true) {
					let tradingId = request.body.trading_id;
					let Value = request.body.value;
					let privateKey = request.body.from_private_key;
				
				  let fromAddress = request.body.from_address;


				  if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}
	
	
					// if (sellerAddress.length < 42) {
					// 	ResponseMessage = "Invalid seller Address";
					// 	ResponseCode = 400;
					// 	return;
					// } else if (buyerAddress.length < 42) {
					// 	ResponseMessage = "Invalid buyer Address";
					// 	ResponseCode = 400;
					// 	return;
					// }else if (fromAddress.length < 42) {
					// 	ResponseMessage = "Invalid from Address";
					// 	ResponseCode = 400;
					// 	return;
					// }
	
	
		
					web3.eth.defaultAccount = fromAddress;
					//tokenValue = tokenValue * (10 ** 6);
				//	tokenValue = tokenValue;
				//Value = web3.utils.toWei(Value, "ether"); 
	
					let contract = new web3.eth.Contract( abi , contractAddress );
					//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress , 'latest');
					let data = contract.methods.deposit(tradingId).encodeABI();
					//console.log(data);
					
					let gasPrice = web3.eth.gasPrice ;
					let gasLimit =  200000;
					//let gasLimit = web3.utils.toHex(6721975) ;
					var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	
					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open( "GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
						contractAddress +
						"&address=" +
						fromAddress +
						"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous request
					xmlHttp.send();
					var transactions = JSON.parse(xmlHttp.responseText);
					//let balance = transactions.result;
	
					//let balance = 1000000000000000000000000000000;
					//console.log(balance);
					//if(balance >= tokenValue + gasLimit) {
						let rawTransaction = {
							"from": fromAddress,
							"nonce": web3.utils.toHex(count),
							"gasPrice": web3.utils.toHex(2000000000000),
							"gasLimit": web3.utils.toHex(gasLimit),
							"value": web3.utils.toHex(web3.utils.toWei(Value, "ether")),
							
							"to": contractAddress,
							//"to": toAddress,
							"data": data,
							//"chainId": 0x04
						};
						privateKey = Buffer.from(privateKey, 'hex');
						let tx = new Tx(rawTransaction , {'chain':'rinkeby'}) ;
						console.log("ye hai tx", tx);
	
						tx.sign(privateKey);
						let serializedTx = tx.serialize();
						let hashObj = await sendrawtransaction(serializedTx);
						console.log("ye hai hashobj" , hashObj);
					
						if (hashObj.response == '') {
							let hash = hashObj.hash;
							ResponseData = await getTransaction(hash);
							ResponseMessage = "Transaction successfully completed";
							ResponseCode = 200;
						} else {
							ResponseMessage = hashObj.response;
							ResponseCode = 400;
							return;
						}
				//	}
					//  else {
					// 	ResponseMessage = "Balance is insufficent";
					// 	ResponseCode = 400;
					// 	return;
					// }
					
				 } 
				 //else {
			// 		ResponseCode = 206
			// 	}
			// } else {
			// 	ResponseMessage = "Transaction cannot proceeds as request body is empty";
			// 	ResponseCode = 204
			// }
			}
		} catch (error) {
			ResponseMessage = `Transaction signing stops with the error  ${error}`;
			ResponseCode = 400
		} finally {
			return response.status(200).json({
				code : ResponseCode,
				data : ResponseData,
				msg : ResponseMessage
			});
		}
	});
 //================= Deposit end====================================



// ================== Delivery==================================

router.get("/deliveryeth", async function (request, response) {
	var ResponseCode = 200;
		var ResponseMessage = ``;
		var ResponseData = null;
		
		try {
			if(request.body) {
				var ValidationCheck = true;
			
				if (!request.body.from_private_key) {
					ResponseMessage += "private key is missing \n";
					ValidationCheck = false;
				}
				if (!request.body.from_address) {
					ResponseMessage += "from address is missing \n";
					ValidationCheck = false;
				}
				 else if (!request.body.value === parseInt(request.body.value)) {
					ResponseMessage += "value must be a number \n";
					ValidationCheck = false;
				}
				
				if(ValidationCheck == true) {
					let Value = request.body.value;
					let privateKey = request.body.from_private_key;
				
				  let fromAddress = request.body.from_address;


				  if (fromAddress.length < 42) {
					ResponseMessage = "Invalid from Address";
					ResponseCode = 400;
					return;
				}
	
	
					// if (sellerAddress.length < 42) {
					// 	ResponseMessage = "Invalid seller Address";
					// 	ResponseCode = 400;
					// 	return;
					// } else if (buyerAddress.length < 42) {
					// 	ResponseMessage = "Invalid buyer Address";
					// 	ResponseCode = 400;
					// 	return;
					// }else if (fromAddress.length < 42) {
					// 	ResponseMessage = "Invalid from Address";
					// 	ResponseCode = 400;
					// 	return;
					// }
	
	
		
					web3.eth.defaultAccount = fromAddress;
					//tokenValue = tokenValue * (10 ** 6);
				//	tokenValue = tokenValue;
				//Value = web3.utils.toWei(Value, "ether"); 
	
					let contract = new web3.eth.Contract( abi , contractAddress );
					//let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				let count = await web3.eth.getTransactionCount(fromAddress , 'latest');
					let data = contract.methods.confirmDelivery().encodeABI();
					//console.log(data);
					
					let gasPrice = web3.eth.gasPrice ;
					let gasLimit =  200000;
					//let gasLimit = web3.utils.toHex(6721975) ;
					var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	
					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open( "GET", "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
						contractAddress +
						"&address=" +
						fromAddress +
						"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous request
					xmlHttp.send();
					var transactions = JSON.parse(xmlHttp.responseText);
					//let balance = transactions.result;
	
					//let balance = 1000000000000000000000000000000;
					//console.log(balance);
					//if(balance >= tokenValue + gasLimit) {
						let rawTransaction = {
							"from": fromAddress,
							"nonce": web3.utils.toHex(count),
							"gasPrice": web3.utils.toHex(200000000000),
							"gasLimit": web3.utils.toHex(gasLimit),
						//	"value": web3.utils.toHex(web3.utils.toWei(Value, "ether")),
							
							"to": contractAddress,
							//"to": toAddress,
							"data": data,
							"chainId": 0x04
						};
						privateKey = Buffer.from(privateKey, 'hex');
						let tx = new Tx(rawTransaction , {'chain':'rinkeby'}) ;
						console.log("ye hai tx", tx);
	
						tx.sign(privateKey);
						let serializedTx = tx.serialize();
						let hashObj = await sendrawtransaction(serializedTx);
						console.log("ye hai hashobj" , hashObj);
					
						if (hashObj.response == '') {
							let hash = hashObj.hash;
							ResponseData = await getTransaction(hash);
							ResponseMessage = "Transaction successfully completed";
							ResponseCode = 200;
						} else {
							ResponseMessage = hashObj.response;
							ResponseCode = 400;
							return;
						}
				//	}
					//  else {
					// 	ResponseMessage = "Balance is insufficent";
					// 	ResponseCode = 400;
					// 	return;
					// }
					
				 } 
				 //else {
			// 		ResponseCode = 206
			// 	}
			// } else {
			// 	ResponseMessage = "Transaction cannot proceeds as request body is empty";
			// 	ResponseCode = 204
			// }
			}
		} catch (error) {
			ResponseMessage = `Transaction signing stops with the error  ${error}`;
			ResponseCode = 400
		} finally {
			return response.status(200).json({
				code : ResponseCode,
				data : ResponseData,
				msg : ResponseMessage
			});
		}
	});
 //================= delivery end====================================

// ===============================================================================================================================================

router.get("/getBalance/:walletAddress", (req, response) => {
	var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;
	try {
		if(req.params) {
			if (!req.params.walletAddress) {
				ResponseMessage = "wallet address is missing \n";
				ResponseCode = 206;
			} else {
				let walletAddress = req.params.walletAddress;
				var date = new Date();
				var timestamp = date.getTime();
                var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open( "GET",  "https://api-rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=" +
					contractAddress +
					"&address=" +
					walletAddress +
					"&tag=latest&apikey=YourApiKeyToken", false ); // false for synchronous request
				xmlHttp.send();
				var transactions = JSON.parse(xmlHttp.responseText);
				let balance = transactions.result;
				//balance = balance / 10 ** 6;
				balance = balance;
				ResponseData = {
					wallet: {
						balance: balance
					},
					message: "",
					timestamp: timestamp,
					status: 200,
					success: true
				};
				ResponseMessage = "Completed";
				ResponseCode = 200;
			}
		} else {
				ResponseMessage = "Transaction cannot proceeds as request params is empty";
				ResponseCode = 204;
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		return response.status(200).json({
			code : ResponseCode,
			data : ResponseData,
			msg : ResponseMessage
		});
	}
    
});
// ===========================================================================================================================================================

router.get("/track/:walletAddress", async function(req, response) {
	var ResponseCode = 200;
	var ResponseMessage = ``;
	var ResponseData = null;
	try {
		if(req.params) {
			if (!req.params.walletAddress) {
				ResponseMessage = "hash / wallet address is missing \n";
				ResponseCode = 206;
			} else {
				let hash = req.params.walletAddress;
				
				if (hash.length == 66) {
					ResponseData = await getTransaction(hash);
					ResponseMessage = "Completed";
					ResponseCode = 200;

				} else if (hash.length == 42) {
					var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
					var xmlHttp = new XMLHttpRequest();
					xmlHttp.open( "GET", "http://api-rinkeby.etherscan.io/api?module=account&action=tokentx&address=" + hash + "&startblock=0&endblock=99999999&sort=asc&limit=100", false ); // false for synchronous request
					xmlHttp.send();
					var transactions = JSON.parse(xmlHttp.responseText);
					let _data = [];
					for (let i = 0; i < transactions.result.length; i++) {
						if (String(transactions.result[i].contractAddress).toUpperCase().localeCompare(String(contractAddress).toUpperCase()) == 0) {
							transactions.result[i].value = transactions.result[i].value ;
							_data.push(transactions.result[i]);
						}
						//99993988790  99993988791
						//6011100  6011099
					}
					ResponseData = {
						transaction: _data
					};
					ResponseMessage = "Completed";
					ResponseCode = 200;
				} else {
					ResponseMessage = "Invalid Hash or Wallet Address"
					ResponseCode = 400;
				}
			}
		} else {
			ResponseMessage = "Transaction cannot proceeds as request params is empty";
			ResponseCode = 204;
		}
	} catch (error) {
		ResponseMessage = `Transaction signing stops with the error ${error}`;
		ResponseCode = 400;
	} finally {
		return response.status(200).json({
			code : ResponseCode,
			data : ResponseData,
			msg : ResponseMessage
		});
	}
});




function getTransaction(hash) {
	var data;
	return new Promise(function(resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			console.log("ye hai transaction" , transaction);
			console.log("ye hai transaction error " , err);
			var date = new Date();
			var timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input);
			console.log("ye hai input " ,inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					// buyer: inputdecode.inputs[0],
					// seller: inputdecode.inputs[1],
				//	amount: parseInt(inputdecode.inputs[1]) ,
				//	amount: parseInt(inputdecode.inputs[0]),
					//currency: "USDT",
					fee: transaction.gasPrice,
					n_confirmation: transaction.transactionIndex,
					link: `https://rinkeby.etherscan.io/tx/${hash}`
				},
				message: "",
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		})
	});
}

function getTransactionn(hash) {
	var data;
	return new Promise(function(resolve, reject) {
		web3.eth.getTransaction(hash, function (err, transaction) {
			var date = new Date();
			var timestamp = date.getTime();
			let inputdecode = decoder.decodeData(transaction.input)
			//web3.utils.toAscii(transaction.input);
			//decoder.decodeData(transaction.input);
			console.log("ye hai input " ,inputdecode);
			data = {
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					id :  parseInt(inputdecode.inputs[0]._hex, 16),
					 //parseInt(hexString, 16)

					 buyer: inputdecode.inputs[1],
					 seller: inputdecode.inputs[2],
					// yourNumber = parseInt(hexString, 16);
				//	amount: parseInt(inputdecode.inputs[1]) ,
				//	amount: parseInt(inputdecode.inputs[0]),
					//currency: "USDT",
					fee: transaction.gasPrice,
					n_confirmation: transaction.transactionIndex,
					link: `https://rinkeby.etherscan.io/tx/${hash}`
				},
				message: "",
				timestamp: timestamp,
				status: 200,
				success: true
			};
			resolve(data);
		})
	});
}

function sendrawtransaction(serializedTx) {
	var hash;
	var response = "";
	return new Promise(function(resolve, reject) {
		web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"), function ( err, hsh ) {
			if (err) {
				response = `send Bad Request ${err}`;
			} else {
				hash = hsh;
			} 
			var obj = {
				response:  response,
				hash: hash
			};
			resolve(obj);
		});
	});
}

module.exports = router;