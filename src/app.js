import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Blockchain } from './blockchain.js';
import { Transaction } from './transaction.js';
import { P2P } from './p2p.js';
import { createWallet, signPayment } from './wallet.js';

// Config
const HTTP_PORT = process.env.PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;
const PEERS = (process.env.PEERS || '').split(',').filter(Boolean); // e.g. ws://localhost:6002

// Node state
const chain = new Blockchain({ difficulty: 3, miningReward: 50 });
const p2p = new P2P(chain, { p2pPort: P2P_PORT, peers: PEERS });

const app = express();
app.use(express.json());
app.use(cors());          // <-- enable CORS for browser
app.use(morgan('dev'));

// Health
app.get('/', (req, res) => res.json({ name: 'NanoCoin', network: 'local', height: chain.chain.length }));

// Chain endpoints
app.get('/chain', (req, res) => res.json(chain.chain));
app.get('/valid', (req, res) => res.json({ valid: chain.isChainValid() }));

// Wallet helpers
app.get('/wallet/new', (req, res) => res.json(createWallet()));

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  return res.json({ address, balance: chain.getBalanceOfAddress(address) });
});

// Create & broadcast transaction
app.post('/transactions', (req, res) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    let tx;
    if (privateKey) {
      tx = signPayment(privateKey, toAddress, amount);
    } else {
      // Expect a pre-signed tx object
      tx = Object.assign(new Transaction(), req.body);
    }

    if (!tx.isValid()) throw new Error('Invalid or unsigned transaction');
    chain.addTransaction(tx);
    p2p.broadcastTransaction(tx);
    res.json({ ok: true, pendingTxCount: chain.pendingTransactions.length });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Mine pending transactions
app.post('/mine', (req, res) => {
  const { minerAddress } = req.body;
  if (!minerAddress) return res.status(400).json({ error: 'minerAddress required' });
  const block = chain.minePendingTransactions(minerAddress);
  p2p.broadcast(p2p.responseLatest());
  res.json({ ok: true, block });
});

// P2P peer management
app.get('/peers', (req, res) => res.json({ peers: p2p.sockets.map(s => s.url || 'local-conn') }));
app.post('/peers', (req, res) => {
  const { peer } = req.body; // ws://host:port
  try {
    p2p.connectToPeer(peer);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.listen(HTTP_PORT, () => console.log(`HTTP API on :${HTTP_PORT}`));
