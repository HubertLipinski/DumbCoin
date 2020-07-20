# DumbCoin

![npm](https://img.shields.io/npm/v/dumbcoin)
![snyk](https://img.shields.io/snyk/vulnerabilities/npm/dumbcoin)

![DumbCoin](https://i.imgur.com/XSJzxCN.png)

- [What is DumbCoin](#what-is-dumbcoin)
- [How to start](#how-to-start)
- [P2P and Data Exchange](#p2p-and-data-exchange)
- [Documentation](#documentation)
- [API](#api)

## What is DumbCoin

It's a simple package that you can use to create your primitive blockchain or anything based on peer-to-peer connection and gossip protocol for data exchange. 
What's more, you can use the modules separately, or create your own Blockchain using them.

### Features
* Peer to peer comunication using own implementation of gossip protocol
* Signaling server
* Rewards by mining blocks (Proof of concept algorithm)
* Secure transactions signed by crypto keys
* Wallets
* API for Blockchain

## How to start
  ### Instalation
  1. Install DumbCoin via packet manager npm/yarn
  ```
  npm i dumbcoin
  ```
  2. Copy .env.example .env and complete it according to your needs <br/>
   Windows: `copy .env.example .env`<br/>
   Linux: `cp .env.example .env`
  
   ### Usage
   
   You can import modules from DumbCoin package as shown below:
   
   ```javascript 
   const { Blockchain, Networker, Signal } = require('dumbcoin');
   const signal = Signal().start(); // Start signaling server
   const blockchain = Blockchain(); // Create Blockchain
   const networker = Networker(
      blockchain, // Networker requires Blockchain instance, see documentation for more info
      //other params
   );
   
   //have fun with modules
   
   ```
   If you want ready to use blockchain just import Cluster
   ```javascript 
   const { Cluster } = require('dumbcoin');
   const cluster = Cluster(); // now blockchain is ready to use
   ```
## P2P and Data Exchange
  ### How it works
  Dumbcoin is built in [peer-to-peer](https://en.wikipedia.org/wiki/Peer-to-peer) topology and data exchange/synchronization is handled by [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol).
   Each peer is both a client and a server at the same time. The information about active nodes are transmited via Signaling server, that way all users have current list and can gossip with random Peer to keep blockchain well synchronized
  
  Whole process can be ilustrated as following:
  ![Imgur](https://i.imgur.com/slKvSxq.png)
  1. Synchronize (SYN) packet - Peer A sends his current data to peer B.
  2. Acknowledge (ACK) packet - Peer B compares the received data's timestamps with it's own. For each documents, if it's timestamp is older, just place it in the ACK payload, if it's newer place it along with it's data. And if timestamps are the same, do nothing.
  3. Acknowledge 2 (ACK2) packet - Peer A updates it's document if ACK data is provided, then sends back the latest data to Peer B for those where no ACK data was provided.
  #### More info
  For more information how this works check [Cassandra training video](https://academy.datastax.com/units/distributed-architecture-gossip?resource=ds201-foundations-apache-cassandra) or [Scylla explanation](https://docs.scylladb.com/kb/gossip/)
  
## Documentation
  https://hubertlipinski.github.io/DumbCoin/
 
## API
  DubmbCoin provides an API for blockchain if you want to use it. You can download Postman collection [here](https://www.getpostman.com/collections/91b80ec4246ab266794e)
  #### Variables
  **{{address}}** - Your address on which API server is running i.e localhost <br/>
  **{{port}}** - Port on which API server is running i.e 6010
  
  
