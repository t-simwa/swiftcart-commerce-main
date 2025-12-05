import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('Connecting to:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in the connection string');
      console.error('💡 Tip: Make sure password is URL-encoded if it has special characters');
    }
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('\n💡 Tip: Add your IP address to MongoDB Atlas Network Access whitelist');
    }
    process.exit(1);
  });