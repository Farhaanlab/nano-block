// p2p.js
import WebSocket, { WebSocketServer } from 'ws';

export class P2P {
  constructor(blockchain, options = {}) {
    this.blockchain = blockchain;
    this.p2pPort = options.p2pPort || 6001;
    this.peers = options.peers || [];
    this.sockets = [];
    this.server = null;
  }

  listen() {
    this.server = new WebSocketServer({ port: this.p2pPort });
    this.server.on('connection', ws => this.initConnection(ws));
    // connect to initial peers
    (this.peers || []).forEach(peer => {
      try {
        this.connectToPeer(peer);
      } catch (e) {
        console.warn('Failed to connect to peer', peer, e.message);
      }
    });
    console.log(`🔗 P2P listening on ws://localhost:${this.p2pPort}`);
  }

  initConnection(ws) {
    this.sockets.push(ws);
    ws.on('message', message => this.messageHandler(ws, message));
    ws.on('close', () => this.closeConnection(ws));
    // send latest chain on connect
    this.send(ws, this.responseLatest());
  }

  closeConnection(ws) {
    this.sockets = this.sockets.filter(s => s !== ws);
  }

  connectToPeer(peer) {
    const ws = new WebSocket(peer);
    ws.on('open', () => this.initConnection(ws));
    ws.on('error', (err) => console.warn('WS error', err.message));
    return ws;
  }

  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data) {
    this.sockets.forEach(s => {
      try { this.send(s, data); } catch (e) { /* ignore */ }
    });
  }

  responseLatest() {
    // return the whole chain (simple approach)
    return { type: 'CHAIN', data: this.blockchain.chain };
  }

  messageHandler(ws, message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      return;
    }

    if (!msg || !msg.type) return;

    if (msg.type === 'CHAIN' && Array.isArray(msg.data)) {
      // naive sync: if incoming chain is longer and valid, replace
      const incoming = msg.data;
      if (incoming.length > this.blockchain.chain.length && this.isValidIncomingChain(incoming)) {
        this.blockchain.chain = incoming;
        console.log('Chain replaced with incoming chain from peer.');
      }
    }
  }

  isValidIncomingChain(chainArr) {
    // Basic validation check: use blockchain's own isChainValid if available,
    // or do a simple structural check
    try {
      // Attempt to call chain.isChainValid if present
      if (typeof this.blockchain.isChainValid === 'function') {
        // Temporarily set and validate - make a copy to avoid mutation
        const original = this.blockchain.chain;
        this.blockchain.chain = chainArr;
        const valid = this.blockchain.isChainValid();
        this.blockchain.chain = original;
        return valid;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
