# How to Verify Users in MongoDB Atlas via Terminal

## Method 1: Using mongosh (MongoDB Shell)

### Step 1: Install mongosh (if not already installed)
```bash
# Windows (using Chocolatey)
choco install mongosh

# Or download from: https://www.mongodb.com/try/download/shell
```

### Step 2: Connect to MongoDB Atlas
```bash
# Get your connection string from your .env file or Atlas dashboard
# Format: mongodb+srv://username:password@cluster.mongodb.net/swiftcart

mongosh "mongodb+srv://username:password@cluster.mongodb.net/swiftcart"
```

### Step 3: Query Users
Once connected, run these commands:

```javascript
// Switch to your database (if not already connected to it)
use swiftcart

// View all users (basic info)
db.users.find().pretty()

// View all users with specific fields only
db.users.find({}, { email: 1, firstName: 1, lastName: 1, role: 1, isEmailVerified: 1, createdAt: 1 }).pretty()

// Count total users
db.users.countDocuments()

// Find a specific user by email
db.users.findOne({ email: "user@example.com" })

// View users created in the last 24 hours
db.users.find({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } }).pretty()

// View only verified users
db.users.find({ isEmailVerified: true }).pretty()

// View only admin users
db.users.find({ role: "admin" }).pretty()

// View users sorted by creation date (newest first)
db.users.find().sort({ createdAt: -1 }).pretty()
```

## Method 2: Using Node.js Script (Quick Check)

Create a temporary script to check users:

```bash
# In your backend directory
cd swiftcart-backend
```

Then create a file `check-users.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({});
    
    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('👥 Users List:');
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || '   Name: Not provided');
      console.log(`   Role: ${user.role || 'customer'}`);
      console.log(`   Verified: ${user.isEmailVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
```

Run it:
```bash
node check-users.js
```

## Method 3: Using MongoDB Compass (GUI - Easiest)

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect using your Atlas connection string
3. Navigate to `swiftcart` database → `users` collection
4. View all documents

## Quick One-Liner (if you have mongosh installed)

```bash
mongosh "YOUR_CONNECTION_STRING" --eval "use swiftcart; db.users.find().pretty()"
```

Replace `YOUR_CONNECTION_STRING` with your actual MongoDB Atlas connection string.

