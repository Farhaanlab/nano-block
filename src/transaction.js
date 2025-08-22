import SHA256 from 'crypto-js/sha256.js';
import elliptic from 'elliptic';
const EC = elliptic.ec;
const ec = new EC('secp256k1');


export class Transaction {
constructor(fromAddress, toAddress, amount, timestamp = Date.now()) {
this.fromAddress = fromAddress; // null for mining reward
this.toAddress = toAddress;
this.amount = amount;
this.timestamp = timestamp;
this.signature = null;
}


calculateHash() {
return SHA256(
String(this.fromAddress) + String(this.toAddress) + this.amount + this.timestamp
).toString();
}


signTransaction(signingKey) {
if (!signingKey || typeof signingKey !== 'object' || !signingKey.getPublic) {
throw new Error('signTransaction requires an elliptic KeyPair');
}
if (signingKey.getPublic('hex') !== this.fromAddress) {
throw new Error('You cannot sign transactions for other wallets!');
}
const hash = this.calculateHash();
const sig = signingKey.sign(hash, 'base64');
this.signature = sig.toDER('hex');
return this;
}


isValid() {
// Mining reward (coinbase) has no fromAddress and no signature
if (this.fromAddress === null) return true;
if (!this.signature) return false;
try {
const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
return publicKey.verify(this.calculateHash(), this.signature);
} catch (e) {
return false;
}
}
}


export function generateKeypair() {
const key = ec.genKeyPair();
return {
privateKey: key.getPrivate('hex'),
publicKey: key.getPublic('hex')
};
}


export function keyFromPrivate(priv) {
return ec.keyFromPrivate(priv);
}