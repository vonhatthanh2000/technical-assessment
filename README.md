# DeFiForge Platform Documentation

## Overview

DeFiForge is a comprehensive blockchain-based platform that integrates smart contracts with a modern web application. The platform features KYC verification, token management, and lending pool functionality across multiple blockchain networks.

## Requirements

- **Node.js**: Version 23.4.0 or higher
- **MongoDB**: Running MongoDB instance
- **Ethereum Wallet**: For blockchain interactions

## Setup

### 1. Install dependencies

```
npm install
cd api && npm install
cd ../contract && npm install
```

### 2. Set up environment variables as described in the API and Contract sections.

### 3. Compile and deploy the smart contracts

```
cd contract && npm run compile && npm run deploy
```

### 4. Generate the keystore

```
cd api && npm run generate-keystore
```

### 5. Start the API server and the Next.js application

```
npm run dev
```

## Architecture

- Frontend: Next.js React application
- Backend: Express.js API server
- Blockchain: Solidity smart contracts
- Database: MongoDB for user data and transaction history

## Security Considerations

1. **Private Key Management:** Use ERC-2335 keystores instead of plain text private keys
2. **Input Validation:** Validate all inputs before sending blockchain transactions
3. **Error Handling:** Proper error handling for both API and blockchain interactions
4. **Authentication:** JWT-based authentication for API access
