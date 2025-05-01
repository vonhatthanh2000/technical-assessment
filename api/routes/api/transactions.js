const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const checkObjectId = require('../../middleware/checkObjectId');
const { check, validationResult } = require('express-validator');
const Transaction = require('../../models/Transaction');

// @route    GET api/transactions
// @desc     List all transactions with optional type filter
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, me } = req.query;

    // Validate transaction type if provided
    if (type && !['Stake', 'Borrow', 'Lend'].includes(type)) {
      return res.status(400).json({
        errors: [
          {
            msg: 'Invalid transaction type. Must be one of: Stake, Borrow, Lend'
          }
        ]
      });
    }

    const query = {};

    // Add transaction type filter if provided
    if (type) {
      query.transactionType = type;
    }

    // Add user filter if 'me' parameter is true
    if (me === 'true') {
      query.user = req.user.id;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .select('-__v')
      .populate('user', ['name', 'avatar']);

    res.json({
      count: transactions.length,
      transactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/transactions/:id
// @desc     Retrieve a specific transaction by id
// @access   Private
router.get('/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .select('-__v')
      .populate('user', ['name', 'avatar']);

    if (!transaction) {
      return res.status(404).json({
        errors: [{ msg: 'Transaction not found' }]
      });
    }

    // Check if the transaction belongs to the authenticated user
    if (transaction.user._id.toString() !== req.user.id) {
      return res.status(404).json({
        errors: [{ msg: 'Transaction not found' }]
      });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/transactions
// @desc     Create a new transaction
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('transactionType')
        .notEmpty()
        .isIn(['Stake', 'Borrow', 'Lend'])
        .withMessage('Transaction type must be one of: Stake, Borrow, Lend'),
      check('token').notEmpty().withMessage('Token is required'),
      check('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .custom((value) => {
          if (isNaN(value) || parseFloat(value) <= 0) {
            throw new Error('Amount must be a positive number');
          }
          return true;
        })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { transactionType, token, amount } = req.body;

      const newTransaction = new Transaction({
        user: req.user.id,
        transactionType,
        token,
        amount,
        networkId: req.body.networkId || null,
        txHash: req.body.txHash || null
      });

      const transaction = await newTransaction.save();

      res.status(201).json(transaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/transactions/:id
// @desc     Update a transaction
// @access   Private
router.put(
  '/:id',
  [
    auth,
    checkObjectId('id'),
    [
      check('transactionType')
        .optional()
        .isIn(['Stake', 'Borrow', 'Lend'])
        .withMessage('Transaction type must be one of: Stake, Borrow, Lend'),
      check('token').optional(),
      check('amount')
        .optional()
        .custom((value) => {
          if (value && (isNaN(value) || parseFloat(value) <= 0)) {
            throw new Error('Amount must be a positive number');
          }
          return true;
        })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get transaction by ID
      let transaction = await Transaction.findById(req.params.id);

      // Check if transaction exists
      if (!transaction) {
        return res.status(404).json({
          errors: [{ msg: 'Transaction not found' }]
        });
      }

      // Check if the transaction belongs to the authenticated user
      if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({
          errors: [{ msg: 'Not authorized to update this transaction' }]
        });
      }

      // Build update object with only provided fields
      const updateFields = {};
      if (req.body.transactionType)
        updateFields.transactionType = req.body.transactionType;
      if (req.body.token) updateFields.token = req.body.token;
      if (req.body.amount) updateFields.amount = req.body.amount;
      if (req.body.networkId) updateFields.networkId = req.body.networkId;
      if (req.body.txHash) updateFields.txHash = req.body.txHash;

      // Update transaction
      transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      ).select('-__v');

      res.json(transaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/transactions/:id
// @desc     Delete a transaction
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    // Get transaction by ID
    const transaction = await Transaction.findById(req.params.id);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        errors: [{ msg: 'Transaction not found' }]
      });
    }

    // Check if the transaction belongs to the authenticated user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        errors: [{ msg: 'Not authorized to delete this transaction' }]
      });
    }

    // Delete transaction
    await transaction.remove();

    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
