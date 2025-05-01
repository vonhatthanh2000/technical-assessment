const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['Stake', 'Borrow', 'Lend']
  },
  token: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  txHash: {
    type: String
  },
  networkId: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('transaction', TransactionSchema);
