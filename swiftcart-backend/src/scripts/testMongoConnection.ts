import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env';

/**
 * Test MongoDB connection
 */
const testMongoConnection = async () => {
  try {
    const mongoUri = env.MONGODB_URI;
    
    console.log('🔍 Testing MongoDB Connection...\n');
    console.log(`Connection String: ${mongoUri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'NOT SET'}\n`);
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.log('\n💡 Make sure you have a .env file with MONGODB_URI set');
      process.exit(1);
    }

    console.log('⏳ Attempting to connect...\n');

    // Connection options
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    };

    // Add timeout wrapper
    const connectionPromise = mongoose.connect(mongoUri, options);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
    );

    const startTime = Date.now();
    const conn = await Promise.race([connectionPromise, timeoutPromise]);
    const duration = Date.now() - startTime;

    console.log('✅ MongoDB Connection Successful!\n');
    console.log(`📊 Connection Details:`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Connection State: ${getConnectionState(conn.connection.readyState)}`);
    console.log(`   Connection Time: ${duration}ms\n`);

    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`✅ Database is accessible`);
    console.log(`📁 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ MongoDB Connection Failed!\n');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('timeout')) {
      console.log('💡 Possible issues:');
      console.log('   1. MongoDB server is not running');
      console.log('   2. Incorrect connection string');
      console.log('   3. Firewall blocking the connection');
      console.log('   4. Network connectivity issues\n');
    } else if (error.message.includes('authentication')) {
      console.log('💡 Authentication failed:');
      console.log('   1. Check your username and password');
      console.log('   2. Verify the database user has proper permissions\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('💡 DNS/Hostname resolution failed:');
      console.log('   1. Check if the hostname is correct');
      console.log('   2. Verify network connectivity\n');
    } else {
      console.log('💡 Check:');
      console.log('   1. MongoDB server status');
      console.log('   2. Connection string format');
      console.log('   3. Network/firewall settings\n');
    }
    
    console.log(`Full error: ${error.stack}\n`);
    process.exit(1);
  }
};

// Helper function to get connection state string
function getConnectionState(state: number): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[state] || 'unknown';
}

// Run the test
testMongoConnection();

