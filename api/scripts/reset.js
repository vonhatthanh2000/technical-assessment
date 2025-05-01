const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'), {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const resetDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Post.deleteMany({});

    console.log('Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
