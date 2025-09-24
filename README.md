# NanoCoin: An Interactive Blockchain Playground

**NanoCoin** is an educational project that simulates a simple blockchain, built with Node.js and JavaScript. It provides a hands-on, interactive way to understand core blockchain concepts like transactions, mining, proof-of-work, and peer-to-peer networking. This project includes a backend API, a P2P network, and a frontend user interface for a complete, working demonstration.

## Features

  - **Wallet Management**: Generate new wallets, each with a public and private key.
  - **Transaction System**: Create and sign transactions, adding them to a pool of pending transactions.
  - **Proof-of-Work Mining**: Mine new blocks to confirm pending transactions. The difficulty of mining can be adjusted.
  - **Live Balances**: Check the balance of any address on the blockchain, with real-time updates.
  - **Peer-to-Peer Network**: The system can connect to other NanoCoin nodes to synchronize the blockchain and broadcast new transactions and blocks.
  - **Intuitive UI**: A clean, single-page web interface built with Tailwind CSS makes it easy to interact with the blockchain.

## Getting Started

### Prerequisites

  - Node.js (v18 or higher)
  - npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/nanocoin.git
    cd nanocoin
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

You can run a single node or multiple nodes to see the P2P network in action.

#### Single Node

To start a single node, run the following command:

```bash
npm start
```

This will start the HTTP API on `http://localhost:3001` and the P2P server on `ws://localhost:6001`.

#### Multiple Nodes (P2P Network)

To simulate a decentralized network, start multiple instances of the application on different ports and connect them to each other.

1.  **Node 1**:
    ```bash
    PORT=3001 P2P_PORT=6001 npm start
    ```
2.  **Node 2**:
    ```bash
    PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
    ```
3.  **Node 3**:
    ```bash
    PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001,ws://localhost:6002 npm start
    ```

You can now interact with any of the nodes by opening your browser to `http://localhost:3001`, `http://localhost:3002`, or `http://localhost:3003` and see how transactions and new blocks are broadcast and synchronized across the network.

## Project Structure

  - `app.js`: The main application file. It sets up the Express.js server and API endpoints.
  - `blockchain.js`: Contains the `Blockchain` and `Transaction` classes, defining the core logic of the blockchain.
  - `block.js`: Defines the `Block` class, which represents a single block in the chain.
  - `transaction.js`: Handles transaction creation, signing, and validation using elliptic curve cryptography (`secp256k1`).
  - `p2p.js`: Manages the peer-to-peer network, allowing nodes to connect and sync their chains.
  - `wallet.js`: A helper file for creating and managing wallets.
  - `webpage.html`: The frontend user interface for interacting with the blockchain.

## API Endpoints

The following are the main API endpoints provided by the application:

  - `GET /chain`: Returns the full blockchain.
  - `GET /valid`: Checks if the current blockchain is valid.
  - `GET /wallet`: Generates a new wallet (public and private key pair).
  - `GET /balance/:address`: Returns the balance for a specific address.
  - `POST /transaction`: Creates a new, signed transaction and adds it to the pending pool.
  - `POST /mine`: Mines a new block with the pending transactions and rewards the miner.
  - `GET /peers`: Lists the connected peers.
  - `POST /peers`: Connects to a new peer.
