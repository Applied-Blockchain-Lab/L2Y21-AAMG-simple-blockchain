
const EventEmitter = require('events');


class Node extends EventEmitter {

    constructor(address, name) {
        super();
        this.address = address; // unique identifier
        this.name = name;
        this.peers = [];
    }


    addPeers(peersToAdd) {

        peersToAdd.forEach(peerAddress => {
            
            if (!this.peers.find(peer => peer === peerAddress) && peerAddress !== this.address) {
                this.peers.push(peerAddress);
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

module.exports = Node;