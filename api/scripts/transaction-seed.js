const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'), {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Sample transaction types
const transactionTypes = ['Stake', 'Borrow', 'Lend'];

// Sample tokens
const tokens = ['ETH', 'BTC', 'USDT', 'USDC', 'DAI', 'LINK', 'UNI', 'AAVE'];

// Sample network IDs
const networkIds = ['1', '56', '137', '42161', '10'];

// Generate a random transaction hash
const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

// Generate a random amount between min and max
const generateAmount = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(4);
};

// Generate a random date between start and end
const generateDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Create transactions for a user
const createTransactionsForUser = (userId, count) => {
  const transactions = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  for (let i = 0; i < count; i++) {
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const amount = generateAmount(0.1, 10);
    const networkId = networkIds[Math.floor(Math.random() * networkIds.length)];
    const txHash = generateTxHash();
    const date = generateDate(sixMonthsAgo, now);

    transactions.push({
      user: userId,
      transactionType,
      token,
      amount,
      networkId,
      txHash,
      date
    });
  }

  return transactions;
};

// Seed the database with transactions
const seedTransactions = async () => {
  try {
    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('Existing transactions cleared');

    // Find all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.error('No users found. Please run the main seed script first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users`);

    // Create transactions for each user
    let allTransactions = [];
    users.forEach(user => {
      // Generate 5-15 transactions per user
      const transactionCount = Math.floor(Math.random() * 11) + 5;
      const userTransactions = createTransactionsForUser(user._id, transactionCount);
      allTransactions = [...allTransactions, ...userTransactions];
    });

    // Insert transactions
    await Transaction.insertMany(allTransactions);
    
    console.log(`${allTransactions.length} transactions created`);
    console.log('Transaction data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding transaction data:', error);
    process.exit(1);
  }
};

seedTransactions();