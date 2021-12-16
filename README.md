# Instructions

## Clone branch ('main')

## 1. Install dependencies

```bash
npm install
```

## 2. Generate public-private keypair

```bash
npm run generateKeyPair
```
## 3. Setup your .env file 

```bash
PUBLIC_KEY = 'YOUR_PUBLIC_KEY'
PRIVATE_KEY = 'YOUR_PRIVATE_KEY'
MINER_ADDRESS = 'YOUR_MINER_ADDRESS'
INITIAL_PEER_URL = 'http://192.168.0.213:3001' # <- dont change this
MY_NODE_URL = 'YOUR_LOCAL_IP_ADDRESS' # eg: 192.168.0.219
MY_NODE_PORT = 3001 # default port is 3001
```

## 4. Start the node

```bash
npm start
```

## After the last step node will connect to peers and will automatically synchronise
