const fs = require('fs');
const path = require('path');
const { Wallet, providers } = require('ethers');

/**
 * Get wallet information from the keystore
 * @returns {Promise<Object>} Wallet information
 */
async function getWalletInfo() {
  try {
    // Get keystore details from environment variables
    const keystoreName = process.env.KEYSTORE_NAME;
    const keystorePassword = process.env.KEYSTORE_PASSWORD;

    if (!keystoreName) {
      throw new Error('KEYSTORE_NAME not found in environment variables');
    }

    if (!keystorePassword) {
      throw new Error('KEYSTORE_PASSWORD not found in environment variables');
    }

    // Construct path to keystore file
    const keystorePath = path.join(
      __dirname,
      '../keystores',
      `${keystoreName}.json`
    );

    if (!fs.existsSync(keystorePath)) {
      throw new Error(`Keystore file not found: ${keystorePath}`);
    }

    // Read and decrypt the keystore
    const keystore = fs.readFileSync(keystorePath, 'utf8');
    const wallet = await Wallet.fromEncryptedJson(keystore, keystorePassword);

    // Connect to provider to get network information
    const provider = new providers.JsonRpcProvider(
      process.env.RPC_PROVIDER_URL
    );

    // Get network information
    const network = await provider.getNetwork();

    return {
      address: wallet.address,
      network: {
        name: network.name,
        chainId: network.chainId
      }
    };
  } catch (error) {
    throw new Error(`Failed to get wallet info: ${error.message}`);
  }
}

/**
 * API endpoint to get wallet information
 */
exports.getWalletInfoEndpoint = async (req, res) => {
  try {
    const walletInfo = await getWalletInfo();
    return res.status(200).json(walletInfo);
  } catch (error) {
    console.error('Wallet info error:', error);
    return res.status(500).json({
      message: error.message
    });
  }
};

// Export the function for use in other services
exports.getWalletInfo = getWalletInfo;
