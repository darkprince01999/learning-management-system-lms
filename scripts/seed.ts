const mongoose = require('mongoose');
const User = require('../src/models/User').default;
const connectDB = require('../src/lib/mongodb').default;

async function seedDatabase() {
  try {
    await connectDB();
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
