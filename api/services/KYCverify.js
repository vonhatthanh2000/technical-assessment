const { Contract, providers } = require('ethers');
const { KYCverifyABI } = require('../constants/KYCverificationABI.js');
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

async function getWallet() {
  if (!walletInstance) {
    try {
      walletInstance = new Wallet(
        process.env.WALLET_PRIVATE_KEY,
        await getProvider()
      );
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

    const isVerified = await contract.checkKYC(userAddress);
    if (isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    console.log(`Sending verification transaction for ${userAddress}`);
    const tx = await contract.verifyUser(userAddress, true);
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
    const tx = await contract.changeAdmin(newAdminAddress);
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
