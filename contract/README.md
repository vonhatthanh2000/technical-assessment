# DeFiForge Smart Contracts

## Overview

This package contains the smart contracts for the DeFiForge platform, including KYC verification, token management, and lending pool functionality.

## Requirements

- **Node.js**: Version 23.4.0 or higher
- **Hardhat**: For contract compilation and deployment
- **Ethereum Wallet**: For blockchain interactions

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:
   Create a `.env` file with:

   ```
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

3. Compile contracts:

   ```bash
   npm run compile
   ```

4. Run tests:

   ```bash
   npm run test:contracts
   ```

5. Deploy contracts:
   ```bash
   npm run deploy
   ```
   By default, this deploys to the Polygon network. To deploy to a different network, modify the `deploy` script in `package.json`.

## Available Scripts

- **Compile contracts**: `npm run compile`
- **Run tests**: `npm run test:contracts`
- **Deploy contracts**: `npm run deploy`

## Contract Architecture

### KYCVerification.sol

Manages on-chain verification of users:

- Allows admin to verify users
- Provides a public function to check verification status
- Includes admin management functionality

### Other Contracts

The platform includes additional contracts for token management, lending pools, and other DeFi functionality.

## Supported Networks

The contracts can be deployed to multiple networks as configured in `hardhat.config.ts`:

- Ethereum Mainnet
- Polygon (Matic)
- Binance Smart Chain
- Arbitrum
- Avalanche
- Sepolia
- Mumbai
- And more

## Security Considerations

- Admin-only functions are protected with modifiers
- Events are emitted for important state changes
- OpenZeppelin contracts are used for standard functionality
- Comprehensive test suite validates contract behavior

## Development

### Adding a New Contract

1. Create the contract in the `contracts/` directory
2. Add tests in the `tests/` directory
3. Update deployment scripts as needed
