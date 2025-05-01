const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ethers } = require('ethers');
require('dotenv').config();

// Create keystores directory if it doesn't exist
const keystoreDir = path.join(__dirname, '../keystores');
if (!fs.existsSync(keystoreDir)) {
  fs.mkdirSync(keystoreDir);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the keystore password from .env or prompt for it
const keystorePassword = process.env.KEYSTORE_PASSWORD;
if (!keystorePassword) {
  console.error('Error: KEYSTORE_PASSWORD not found in .env file');
  console.error('Please add KEYSTORE_PASSWORD to your .env file');
  process.exit(1);
}

// Prompt for keystore name and private key
rl.question('Enter a name for your keystore: ', (keystoreName) => {
  if (!keystoreName) {
    console.error('Error: Keystore name is required');
    rl.close();
    process.exit(1);
  }

  rl.question('Enter your private key (without 0x prefix): ', (privateKey) => {
    if (!privateKey) {
      console.error('Error: Private key is required');
      rl.close();
      process.exit(1);
    }

    try {
      // Validate the private key
      const wallet = new ethers.Wallet(`0x${privateKey}`);

      console.log(`\nValidating private key...`);
      console.log(`Address: ${wallet.address}`);

      // Generate keystore (ERC-2335 format)
      console.log(`\nGenerating keystore...`);

      wallet.encrypt(keystorePassword).then((keystore) => {
        const keystorePath = path.join(keystoreDir, `${keystoreName}.json`);

        // Save the keystore file
        fs.writeFileSync(keystorePath, keystore);

        console.log(`\nKeystore created successfully!`);
        console.log(`Public address: ${wallet.address}`);
        console.log(`Keystore saved to: ${keystorePath}`);
        console.log(`\nUpdate your .env file with:`);
        console.log(`KEYSTORE_NAME=${keystoreName}`);

        rl.close();
      });
    } catch (error) {
      console.error(`\nError: Invalid private key - ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
});

rl.on('close', () => {
  process.exit(0);
});
