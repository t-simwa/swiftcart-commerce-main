import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully!\n');
    
    // Get the User model (using the same schema structure)
    const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const users = await User.find({}).select('email firstName lastName role isEmailVerified createdAt phone').sort({ createdAt: -1 });
    
    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('═'.repeat(80));
    
    if (users.length === 0) {
      console.log('📭 No users found in the database.');
    } else {
      console.log('👥 Users List:\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided';
        console.log(`   Name: ${fullName}`);
        console.log(`   Role: ${user.role || 'customer'}`);
        console.log(`   Phone: ${user.phone || 'Not provided'}`);
        console.log(`   Verified: ${user.isEmailVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
        console.log('─'.repeat(80));
      });
    }
    
    // Statistics
    const verifiedCount = users.filter(u => u.isEmailVerified).length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const customerCount = users.filter(u => u.role === 'customer' || !u.role).length;
    
    console.log('\n📈 Statistics:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Verified: ${verifiedCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Customers: ${customerCount}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in the connection string');
    }
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('\n💡 Tip: Add your IP address to MongoDB Atlas Network Access whitelist');
    }
    process.exit(1);
  }
}

checkUsers();

