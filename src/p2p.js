import WebSocket, { WebSocketServer } from 'ws';

class P2P {
    constructor(chain, { p2pPort, peers }) {
        this.chain = chain;
        this.p2pPort = p2pPort;
        this.peers = peers;
        this.sockets = [];

        this.initServer();
        this.connectToPeers();
    }

    initServer() {
        const server = new WebSocketServer({ port: this.p2pPort });
        server.on('connection', (ws) => {
            this.initMessageHandler(ws);
            this.sockets.push(ws);
        });
        console.log('P2P server listening on :' + this.p2pPort);
    }

    initMessageHandler(ws) {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log('Received message:', message);
        });
    }

    connectToPeers() {
        this.peers.forEach((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => {
                this.sockets.push(ws);
                this.initMessageHandler(ws);
            });
            ws.on('error', () => console.log('Connection failed'));
        });
    }

    broadcast(message) {
        this.sockets.forEach((socket) => socket.send(JSON.stringify(message)));
    }

    responseLatest() {
        return { type: 'CHAIN', data: this.chain.chain };
    }
}

export { P2P };
