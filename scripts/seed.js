const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hippotvme:Daruara%4012345@bsbshs.lgf7yx3.mongodb.net/myapp';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  referralId: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  createdBy: {
    type: String,
    ref: 'User',
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create Super Admin
    const superAdmin = new User({
      email: 'Apple@gmail.com',
      phone: '+1234567890',
      password: '123456', // This will be hashed automatically
      referralId: 'SUPER_ADMIN_001',
      role: 'superadmin',
    });

    await superAdmin.save();
    console.log('Super Admin created successfully!');
    console.log('Email: Apple@gmail.com');
    console.log('Password: 123456');
    console.log('Referral ID:', superAdmin.referralId);

    // Create a sample admin for testing
    const sampleAdmin = new User({
      email: 'admin@example.com',
      phone: '+1234567891',
      password: 'admin123',
      referralId: `ADM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'admin',
      createdBy: superAdmin._id,
    });

    await sampleAdmin.save();
    console.log('\nSample Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Referral ID:', sampleAdmin.referralId);

    console.log('\nDatabase seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
