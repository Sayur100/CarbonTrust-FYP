# CarbonTrust: Web3 B2B Carbon Middleware
**Author:** Connor Hugo Mansul  
**Degree:** B.Sc. (Hons) Information Technology (FinTech) - Asia Pacific University

## System Overview
CarbonTrust is a decentralized application (DApp) functioning as B2B middleware. It connects simulated off-chain IoT telemetry to the Polygon Amoy Testnet to automate the minting and cryptographic retirement of carbon credit NFTs, mathematically eliminating double-counting.

## Prerequisites
To execute this local environment, the following must be installed:
1. **Node.js** (v18.0 or higher)
2. **MetaMask Browser Extension** (Configured to the Polygon Amoy Testnet)
3. **Testnet POL Tokens** (Required for executing state mutations)

## Execution Instructions
1. Open the project directory in your terminal.
2. Install the necessary dependencies:
   ```bash
   npm install
3. Initialize the Vite development server:
   ```bash
   npm run dev
4. Open the provided localhost link (typically http://localhost:5173) in a Web3-enabled browser.

## Architectural Notes for Evaluators
Gas Override: The client application injects a forced 100 gwei priority fee into all transactions to bypass public RPC estimation failures during network congestion.
Audit Ledger: Due to strict RPC historical throttling on testnets, the Audit Ledger utilizes a client-side localized cache synchronized with live Ethers.js block events.
