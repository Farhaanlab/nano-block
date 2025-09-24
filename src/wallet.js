import { generateKeypair, keyFromPrivate, Transaction } from './transaction.js';


export function createWallet() {
return generateKeypair();
}


export function signPayment(privateKeyHex, toAddress, amount) {
const key = keyFromPrivate(privateKeyHex);
const fromAddress = key.getPublic('hex');
const tx = new Transaction(fromAddress, toAddress, amount);
tx.signTransaction(key);
return tx;
}
