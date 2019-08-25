# DumbCoin

![npm](https://img.shields.io/npm/v/dumbcoin)
![snyk](https://img.shields.io/snyk/vulnerabilities/npm/dumbcoin)

- [What is DumbCoin](#what-is-dumbcoin)
- [How to start](#how-to-start)
- [P2P Data Exchange](#p2p-data-exchange)
- [Modules](#modules)
  - Cluster
  - Networker
  - Blockchain
  - Signal
  - ~~Wallet~~
- [Documentation](#documentation)

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
  ```
  npm i dumbcoin
  ```
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
