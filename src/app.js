// app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Blockchain } from './blockchain.js';
import { Transaction, keyFromPrivate } from './transaction.js'; // <-- added keyFromPrivate
import { P2P } from './p2p.js';
import { createWallet } from './wallet.js';

// ----------------------------
// Config
// ----------------------------
const HTTP_PORT = process.env.PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;
const PEERS = (process.env.PEERS || '').split(',').filter(Boolean); // e.g. ws://localhost:6002

// ----------------------------
// Node state
// ----------------------------
const chain = new Blockchain({ difficulty: 3, miningReward: 50 });
const p2p = new P2P(chain, { p2pPort: P2P_PORT, peers: PEERS });

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// ----------------------------
// Health
// ----------------------------
app.get('/', (req, res) =>
  res.json({ name: 'NanoCoin', network: 'local', height: chain.chain.length })
);

// ----------------------------
// Blockchain Endpoints
// ----------------------------
app.get('/chain', (req, res) => res.json(chain.chain));
app.get('/valid', (req, res) => res.json({ valid: chain.isChainValid() }));

// ----------------------------
// Wallet Endpoints
// ----------------------------
app.get('/wallet', (req, res) => {
  const wallet = createWallet();
  res.json(wallet);
});

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = chain.getBalanceOfAddress(address);
  res.json({ address, balance });
});

// ----------------------------
// Transaction Endpoints
// ----------------------------
app.post('/transaction', (req, res) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;

    if (!fromAddress || !toAddress || (amount === undefined) || !privateKey) {
      throw new Error('fromAddress, toAddress, amount, and privateKey are required.');
    }

    // Check sender balance
    const senderBalance = chain.getBalanceOfAddress(fromAddress);
    if (senderBalance < amount) {
      return res.status(400).json({ ok: false, error: 'Insufficient funds.' });
    }

    const tx = new Transaction(fromAddress, toAddress, amount);

    // IMPORTANT: convert provided privateKey (hex) -> elliptic KeyPair before signing
    const signingKey = keyFromPrivate(privateKey);
    tx.signTransaction(signingKey);

    if (!tx.isValid()) {
      throw new Error('Invalid or unsigned transaction.');
    }

    // Add transaction to pending txs
    chain.createTransaction(tx);
    // Broadcast the new transaction to the network
    p2p.broadcast(p2p.responseLatest());

    res.json({ ok: true, message: 'Transaction added successfully.', tx });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// ----------------------------
// Mining Endpoint
// ----------------------------
app.post('/mine', (req, res) => {
  const { minerAddress } = req.body;
  if (!minerAddress) {
    return res.status(400).json({ error: 'minerAddress is required.' });
  }

  // Mine the pending transactions
  const block = chain.minePendingTransactions(minerAddress);
  // Broadcast the new block to all peers
  p2p.broadcast(p2p.responseLatest());

  res.json({ ok: true, message: 'Block mined successfully.', block });
});

// ----------------------------
// P2P Peer Management
// ----------------------------
app.get('/peers', (req, res) =>
  res.json({ peers: p2p.sockets.map(s => s.url || 'local-conn') })
);

app.post('/peers', (req, res) => {
  const { peer } = req.body;
  if (!peer) {
    return res.status(400).json({ ok: false, error: 'Peer address is required.' });
  }
  try {
    p2p.connectToPeer(peer);
    res.json({ ok: true, message: `Connected to peer: ${peer}` });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(HTTP_PORT, () =>
  console.log(`✅ HTTP API running on http://localhost:${HTTP_PORT}`)
);

// start P2P server
p2p.listen();
