const { Contract, providers, Wallet, ethers } = require('ethers');
const { KYCverifyABI } = require('../constants/KYCverificationABI.js');
const path = require('path');
const fs = require('fs');
const {
  validateKYCVerifyRequest,
  validateChangeAdminRequest,
  isValidEthereumAddress
} = require('../utils/validation');

let walletInstance = null;
let providerInstance = null;

async function getProvider() {
  if (!providerInstance) {
    providerInstance = new providers.JsonRpcProvider(
      process.env.RPC_PROVIDER_URL
    );
  }
  return providerInstance;
}

// METHOD 1: read private_key directly from .env
// async function getWallet() {
//   if (!walletInstance) {
//     try {
//       const provider = await getProvider();
//       walletInstance = new Wallet(process.env.WALLET_PRIVATE_KEY, provider);
//       console.log(`Wallet initialized: ${walletInstance.address}`);
//     } catch (error) {
//       console.error('Failed to initialize wallet:', error.message);
//       throw new Error(`Failed to initialize wallet: ${error.message}`);
//     }
//   }
//   return walletInstance;
// }

// METHOD 2: read keystore file from keystores directory
async function getWallet() {
  if (!walletInstance) {
    try {
      const provider = await getProvider();

      // Use keystore file instead of direct private key
      const keystoreName = process.env.KEYSTORE_NAME;
      const keystorePassword = process.env.KEYSTORE_PASSWORD;

      if (!keystoreName) {
        throw new Error('KEYSTORE_NAME not found in environment variables');
      }

      if (!keystorePassword) {
        throw new Error('KEYSTORE_PASSWORD not found in environment variables');
      }

      const keystorePath = path.join(
        __dirname,
        '../keystores',
        `${keystoreName}.json`
      );

      if (!fs.existsSync(keystorePath)) {
        throw new Error(`Keystore file not found: ${keystorePath}`);
      }

      const keystore = fs.readFileSync(keystorePath, 'utf8');

      // Decrypt the keystore with the password
      walletInstance = await Wallet.fromEncryptedJson(
        keystore,
        keystorePassword
      );
      walletInstance = walletInstance.connect(provider);

      console.log(`Wallet initialized: ${walletInstance.address}`);
    } catch (error) {
      console.error('Failed to initialize wallet:', error.message);
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }
  }
  return walletInstance;
}

async function getContract(needSigner = false) {
  const KYCAddress = process.env.KYC_CONTRACT_ADDRESS;

  if (needSigner) {
    const wallet = await getWallet();
    return new Contract(KYCAddress, KYCverifyABI, wallet);
  } else {
    const provider = await getProvider();
    return new Contract(KYCAddress, KYCverifyABI, provider);
  }
}

exports.verify = async (request, res) => {
  try {
    const validation = validateKYCVerifyRequest(request.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const userAddress = request.body.address;
    const KYCAddress = process.env.KYC_CONTRACT_ADDRESS;
    console.log(`Verifying user ${userAddress} with contract at ${KYCAddress}`);

    const contract = await getContract(true);
    const wallet = await getWallet();

    // Check if the wallet is the admin before attempting verification
    const currentAdmin = await contract.admin();
    if (currentAdmin.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error(
        `Unauthorized: Wallet ${wallet.address} is not the admin ${currentAdmin}`
      );
      return res.status(403).json({
        message: 'Unauthorized: Only the current admin can verify users',
        currentAdmin: currentAdmin,
        walletAddress: wallet.address
      });
    }

    const isVerified = await contract.checkKYC(userAddress);
    if (isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    console.log(`Sending verification transaction for ${userAddress}`);
    const tx = await contract.verifyUser(userAddress, true, {
      maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('50', 'gwei')
    });
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return res.status(200).json({
      status: 'verified',
      address: userAddress,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error) {
    console.error('Verification error:', error);

    if (error.message.includes('already verified')) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (error.message.includes('Only admin can call this function')) {
      return res.status(403).json({
        message: 'Unauthorized: Only the current admin can verify users'
      });
    }

    if (error.message.includes('insufficient funds')) {
      return res
        .status(500)
        .json({ message: 'Wallet has insufficient funds for transaction' });
    }

    return res.status(500).json({
      message: error.message,
      code: error.code
    });
  }
};

exports.check = async (request, res) => {
  try {
    const userAddress = request.body.address;
    if (!isValidEthereumAddress(userAddress)) {
      return res
        .status(400)
        .json({ message: 'Invalid Ethereum address format' });
    }

    const KYCAddress = process.env.KYC_CONTRACT_ADDRESS;
    console.log(
      `Checking KYC status for ${userAddress} using contract at ${KYCAddress}`
    );

    const contract = await getContract(false);

    const isVerified = await contract.checkKYC(userAddress);
    console.log(`KYC status for ${userAddress}: ${isVerified}`);

    return res.status(200).json({
      address: userAddress,
      verified: isVerified
    });
  } catch (error) {
    console.error('KYC check error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.changeAdmin = async (request, res) => {
  try {
    const validation = validateChangeAdminRequest(request.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const newAdminAddress = request.body.newAdmin;
    const KYCAddress = process.env.KYC_CONTRACT_ADDRESS;
    console.log(
      `Changing admin to ${newAdminAddress} for contract at ${KYCAddress}`
    );

    const contract = await getContract(true);
    const wallet = await getWallet();

    const currentAdmin = await contract.admin();
    if (currentAdmin.toLowerCase() !== wallet.address.toLowerCase()) {
      return res.status(403).json({
        message: 'Unauthorized: Only the current admin can change admin',
        currentAdmin: currentAdmin,
        walletAddress: wallet.address
      });
    }

    console.log(`Sending changeAdmin transaction for ${newAdminAddress}`);
    const tx = await contract.changeAdmin(newAdminAddress, {
      maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('50', 'gwei')
    });
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return res.status(200).json({
      status: 'admin-changed',
      newAdmin: newAdminAddress,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error) {
    console.error('Change admin error:', error);

    if (error.message.includes('Only admin can call this function')) {
      return res
        .status(403)
        .json({ message: 'Only the current admin can change admin' });
    }

    if (error.message.includes('insufficient funds')) {
      return res
        .status(500)
        .json({ message: 'Wallet has insufficient funds for transaction' });
    }

    return res.status(500).json({
      message: error.message,
      code: error.code
    });
  }
};

exports.getCurrentAdmin = async (request, res) => {
  try {
    const KYCAddress = process.env.KYC_CONTRACT_ADDRESS;
    console.log(`Getting current admin for contract at ${KYCAddress}`);

    const contract = await getContract(false);
    const currentAdmin = await contract.admin();

    return res.status(200).json({
      admin: currentAdmin
    });
  } catch (error) {
    console.error('Get admin error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.initializeWallet = getWallet;
