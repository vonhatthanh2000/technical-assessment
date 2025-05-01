# DeFiForge API Server

## Overview

The DeFiForge API server provides backend services for the DeFiForge platform, handling user authentication, KYC verification, transaction management, and blockchain interactions.

## Requirements

- **Node.js**: Version 23.4.0 or higher
- **MongoDB**: Running MongoDB instance
- **Ethereum Wallet**: For blockchain interactions

## Quick Start

1. Start MongoDB using Docker:

   ```bash
   docker-compose up -d
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the application:

   #### config/default.json

   Contains default configuration:

   ```json
   {
     "mongoURI": "mongodb://root:password@localhost:27017/app_db?authSource=admin",
     "jwtSecret": "secret-token"
   }
   ```

   #### .env File

   Create a `.env` file with:

   ```
   PORT=5800
   FRONTEND_URL=http://localhost:3000
   RPC_PROVIDER_URL=https://mainnet.base.org
   KYC_CONTRACT_ADDRESS=0x...
   CHAIN_ID=1
   KEYSTORE_NAME=your-keystore-name
   KEYSTORE_PASSWORD=your-secure-password
   ```

4. Generate a keystore:

   ```bash
   npm run generate-keystore
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- **Start server**: `npm start`
- **Development mode**: `npm run dev`
- **Seed database**: `npm run seed`
- **Seed transactions**: `npm run seed:transactions`
- **Reset data**: `npm run reset`
- **Generate keystore**: `npm run generate-keystore`

## API Endpoints

The API provides endpoints for:

- Authentication and user management
- Profile management
- Posts and comments
- Transaction management
- KYC verification
- Wallet information

For detailed endpoint documentation, see the API documentation or source code.

## Secure Wallet Management

This API uses ERC-2335 keystores to securely store private keys.

### Generating a Keystore

1. Set `KEYSTORE_PASSWORD` in your `.env` file
2. Run `npm run generate-keystore`
3. Follow the prompts
4. Update `KEYSTORE_NAME` in your `.env` file

## Database Models

- **User**: Basic user information
- **Profile**: Extended user profile data
- **Post**: Social posts with comments and likes
- **Transaction**: Blockchain transaction records

## Docker Support

MongoDB configuration in docker-compose.yml:

- Username: root
- Password: password
- Database: app_db
- Port: 27017

## Authentication

The API uses JWT authentication. Include the token in the `x-auth-token` header for protected routes.
