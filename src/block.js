import SHA256 from 'crypto-js/sha256.js';


export class Block {
constructor(timestamp, transactions, previousHash = '') {
this.timestamp = timestamp;
this.transactions = transactions; // array of Transaction
this.previousHash = previousHash;
this.nonce = 0;
this.hash = this.calculateHash();
}


calculateHash() {
return SHA256(
this.previousHash +
this.timestamp +
JSON.stringify(this.transactions) +
this.nonce
).toString();
}


mineBlock(difficulty) {
const target = '0'.repeat(difficulty);
while (this.hash.substring(0, difficulty) !== target) {
this.nonce++;
this.hash = this.calculateHash();
}
}
}
