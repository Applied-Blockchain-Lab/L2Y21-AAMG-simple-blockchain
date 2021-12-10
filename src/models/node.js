
const EventEmitter = require('events');


class Node extends EventEmitter {

    constructor(address, name) {
        this.address = address; // unique identifier
        this.name = name;
        this.peers = [];
    }


    addPeers(peersToAdd) {
        peersToAdd.forEach(peerAddress => {
            if (this.peers.find(node => node.address === peerAddress)) {
                this.peers.push({
                    url: peerAddress,
                    addedAt: Date.now()
                });
            }
        });

        this.emit('AddPeers', peersToAdd);
    }


    getPoolInfo() {
        return {
            address: this.address,
            name: this.name,
            peers: this.peers
        }
    }

    getPeers() {
        return this.peers;
    }
}