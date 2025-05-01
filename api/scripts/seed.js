const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Sample users data
const users = [
  {
    name: 'Thanh Vo',
    email: 'thanh@example.com',
    password: 'password123',
    avatar: 'https://gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200'
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    password: 'password123',
    avatar: 'https://gravatar.com/avatar/305e460b479e2e5b48aec07710c08d50?s=200'
  },
  {
    name: 'David Wilson',
    email: 'david@example.com',
    password: 'password123',
    avatar: 'https://gravatar.com/avatar/405e460b479e2e5b48aec07710c08d50?s=200'
  }
];

// Sample profiles data (will be linked to users)
const createProfiles = (userIds) => [
  {
    user: userIds[0],
    company: 'Tech Corp',
    website: 'techcorp.com',
    location: 'San Francisco, CA',
    status: 'Senior Developer',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    bio: 'Senior developer with 10 years of experience',
    githubusername: 'johndoe',
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        from: '2018-01-01',
        current: true,
        description: 'Lead developer for web applications'
      },
      {
        title: 'Junior Developer',
        company: 'Startup Inc',
        location: 'New York, NY',
        from: '2015-01-01',
        to: '2017-12-31',
        description: 'Developed frontend components'
      }
    ],
    education: [
      {
        school: 'University of California',
        degree: 'Masters',
        fieldofstudy: 'Computer Science',
        from: '2012-09-01',
        to: '2014-06-01',
        description: 'Focused on web technologies'
      }
    ],
    social: {
      youtube: 'youtube.com/johndoe',
      twitter: 'twitter.com/johndoe',
      facebook: 'facebook.com/johndoe',
      linkedin: 'linkedin.com/in/johndoe',
      instagram: 'instagram.com/johndoe'
    }
  },
  {
    user: userIds[1],
    company: 'Design Studio',
    website: 'designstudio.com',
    location: 'Los Angeles, CA',
    status: 'UX Designer',
    skills: ['UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS'],
    bio: 'Creative designer with a passion for user experience',
    githubusername: 'janesmith',
    experience: [
      {
        title: 'UX Designer',
        company: 'Design Studio',
        location: 'Los Angeles, CA',
        from: '2019-03-01',
        current: true,
        description: 'Design user interfaces for web and mobile applications'
      }
    ],
    education: [
      {
        school: 'Art Institute',
        degree: 'Bachelors',
        fieldofstudy: 'Graphic Design',
        from: '2014-09-01',
        to: '2018-06-01',
        description: 'Studied visual communication and digital design'
      }
    ],
    social: {
      youtube: 'youtube.com/janesmith',
      twitter: 'twitter.com/janesmith',
      instagram: 'instagram.com/janesmith'
    }
  },
  {
    user: userIds[2],
    company: 'Data Analytics Inc',
    location: 'Chicago, IL',
    status: 'Data Scientist',
    skills: ['Python', 'R', 'Machine Learning', 'SQL', 'TensorFlow'],
    bio: 'Data scientist specializing in machine learning',
    githubusername: 'bobjohnson',
    experience: [
      {
        title: 'Data Scientist',
        company: 'Data Analytics Inc',
        location: 'Chicago, IL',
        from: '2020-01-01',
        current: true,
        description: 'Develop machine learning models for predictive analytics'
      },
      {
        title: 'Data Analyst',
        company: 'Finance Corp',
        location: 'New York, NY',
        from: '2017-06-01',
        to: '2019-12-31',
        description: 'Analyzed financial data and created reports'
      }
    ],
    education: [
      {
        school: 'MIT',
        degree: 'PhD',
        fieldofstudy: 'Computer Science',
        from: '2013-09-01',
        to: '2017-05-01',
        description: 'Research in machine learning algorithms'
      }
    ],
    social: {
      linkedin: 'linkedin.com/in/bobjohnson',
      twitter: 'twitter.com/bobjohnson'
    }
  }
];

// Sample posts data (will be linked to users)
const createPosts = (userIds, userNames, userAvatars) => [
  {
    user: userIds[0],
    text: 'Just finished a new React project. Check out my GitHub!',
    name: userNames[0],
    avatar: userAvatars[0],
    likes: [{ user: userIds[1] }, { user: userIds[2] }],
    comments: [
      {
        user: userIds[1],
        text: 'Great work! Looking forward to seeing it.',
        name: userNames[1],
        avatar: userAvatars[1],
        date: new Date('2023-06-15T10:30:00')
      }
    ],
    date: new Date('2023-06-15T09:00:00')
  },
  {
    user: userIds[1],
    text: 'Just published my UX case study on Behance. Feedback welcome!',
    name: userNames[1],
    avatar: userAvatars[1],
    likes: [{ user: userIds[0] }],
    comments: [
      {
        user: userIds[0],
        text: 'Amazing design work as always!',
        name: userNames[0],
        avatar: userAvatars[0],
        date: new Date('2023-06-14T15:45:00')
      },
      {
        user: userIds[2],
        text: 'The color scheme is perfect.',
        name: userNames[2],
        avatar: userAvatars[2],
        date: new Date('2023-06-14T16:30:00')
      }
    ],
    date: new Date('2023-06-14T14:20:00')
  },
  {
    user: userIds[2],
    text: 'Excited to share my latest research paper on machine learning applications in healthcare.',
    name: userNames[2],
    avatar: userAvatars[2],
    likes: [{ user: userIds[0] }, { user: userIds[1] }],
    comments: [
      {
        user: userIds[0],
        text: 'This is groundbreaking work!',
        name: userNames[0],
        avatar: userAvatars[0],
        date: new Date('2023-06-13T11:15:00')
      }
    ],
    date: new Date('2023-06-13T10:00:00')
  },
  {
    user: userIds[0],
    text: 'What are your favorite Node.js libraries for 2023?',
    name: userNames[0],
    avatar: userAvatars[0],
    likes: [{ user: userIds[2] }],
    comments: [
      {
        user: userIds[2],
        text: "I've been using Express and Mongoose a lot.",
        name: userNames[2],
        avatar: userAvatars[2],
        date: new Date('2023-06-12T14:30:00')
      }
    ],
    date: new Date('2023-06-12T13:45:00')
  },
  {
    user: userIds[1],
    text: 'Just completed a UI redesign for a major e-commerce platform. So proud of the results!',
    name: userNames[1],
    avatar: userAvatars[1],
    likes: [{ user: userIds[0] }, { user: userIds[2] }],
    comments: [],
    date: new Date('2023-06-11T16:20:00')
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Post.deleteMany({});

    console.log('Database cleared');

    // Create users with hashed passwords
    const userPromises = users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return user;
    });

    const hashedUsers = await Promise.all(userPromises);
    const createdUsers = await User.insertMany(hashedUsers);

    console.log(`${createdUsers.length} users created`);

    // Extract user IDs, names, and avatars
    const userIds = createdUsers.map((user) => user._id);
    const userNames = createdUsers.map((user) => user.name);
    const userAvatars = createdUsers.map((user) => user.avatar);

    // Create profiles
    const profiles = createProfiles(userIds);
    await Profile.insertMany(profiles);

    console.log(`${profiles.length} profiles created`);

    // Create posts
    const posts = createPosts(userIds, userNames, userAvatars);
    await Post.insertMany(posts);

    console.log(`${posts.length} posts created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
