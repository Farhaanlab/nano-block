NanoCoin is an educational blockchain simulation built with Node.js and JavaScript.
It provides a hands-on, interactive way to understand the core concepts of blockchain such as transactions, mining, proof-of-work, and peer-to-peer networking.

This project includes:

A backend API

A peer-to-peer (P2P) network

A simple frontend UI built with Tailwind CSS

Features

Wallet Management: Generate wallets with public/private key pairs.

Transaction System: Create and sign transactions, stored in a pending pool.

Proof-of-Work Mining: Mine blocks to confirm pending transactions. Difficulty is adjustable.

Live Balances: Check real-time balances of blockchain addresses.

Peer-to-Peer Network: Connect multiple nodes to sync the blockchain and broadcast new blocks/transactions.

Intuitive UI: A clean, single-page interface for interacting with the blockchain.

Getting Started
Prerequisites

Node.js
 (v18 or higher)

npm or yarn

Installation
git clone https://github.com/your-username/nanocoin.git
cd nanocoin
npm install

Running the Application

You can run a single node or spin up multiple nodes to see the P2P network in action.

Single Node
npm start


HTTP API → http://localhost:3001

P2P Server → ws://localhost:6001

Multiple Nodes (Simulated Network)

Node 1:

PORT=3001 P2P_PORT=6001 npm start


Node 2:

PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start


Node 3:

PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001,ws://localhost:6002 npm start


➡️ Open any node in your browser:

http://localhost:3001

http://localhost:3002

http://localhost:3003

Transactions and new blocks will be broadcast and synchronized across the network.

Project Structure

app.js – Main application file (Express server + API endpoints).

blockchain.js – Blockchain + Transaction classes (core logic).

block.js – Block structure and properties.

transaction.js – Transaction creation, signing, and validation (using secp256k1).

p2p.js – Manages peer-to-peer communication between nodes.

wallet.js – Wallet generation and key management.

webpage.html – Frontend user interface.

API Endpoints
Method	Endpoint	Description
GET	/chain	Returns the full blockchain
GET	/valid	Checks if the blockchain is valid
GET	/wallet	Generates a new wallet (public/private key pair)
GET	/balance/:address	Returns balance for a given address
POST	/transaction	Creates & signs a new transaction
POST	/mine	Mines a new block with pending transactions
GET	/peers	Lists connected peers
POST	/peers	Connects to a new peer
Demo UI

The project includes a Tailwind-powered web UI for:

Generating wallets

Sending transactions

Mining blocks

Checking balances

Purpose

NanoCoin is a learning tool, not a production-ready cryptocurrency.
It is meant for students, developers, and blockchain enthusiasts who want to explore blockchain fundamentals with a working demo.

License

MIT License. Free to use and modify.
