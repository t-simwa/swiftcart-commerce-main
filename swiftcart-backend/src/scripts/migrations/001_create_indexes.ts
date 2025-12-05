import mongoose from 'mongoose';
import { registerMigration } from './index';

registerMigration({
  name: '001_create_indexes',
  up: async () => {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');

    // Create indexes for Users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ isEmailVerified: 1 });

    // Create indexes for Products collection
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ stock: 1 });
    await db.collection('products').createIndex({ category: 1, price: 1 });
    await db.collection('products').createIndex({ featured: 1, createdAt: -1 });
    await db.collection('products').createIndex({ category: 1, featured: 1 });
    
    // Text search index - handle existing text index conflict
    // MongoDB only allows one text index per collection, so we need to drop any existing one first
    try {
      // Try to create the index first
      await db.collection('products').createIndex(
        { name: 'text', description: 'text' },
        { name: 'product_text_search' }
      );
    } catch (error: any) {
      // If we get an IndexOptionsConflict error, drop the conflicting index and retry
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        // Get all existing indexes
        const existingIndexes = await db.collection('products').indexes();
        
        // Find text indexes (indexes with 'text' in their key values)
        const textIndexes = existingIndexes.filter((idx: any) => {
          if (!idx.key) return false;
          const keys = Object.keys(idx.key);
          return keys.some((key: string) => idx.key[key] === 'text');
        });
        
        // Drop all text indexes except the one we want (if it exists)
        for (const textIndex of textIndexes) {
          // Skip if it's the index we want to create
          if (textIndex.name === 'product_text_search') {
            continue;
          }
          
          try {
            await db.collection('products').dropIndex(textIndex.name);
          } catch (dropError: any) {
            // Ignore if index doesn't exist
            if (dropError.code !== 27 && dropError.codeName !== 'IndexNotFound') {
              throw dropError;
            }
          }
        }
        
        // Now try creating the index again
        try {
          await db.collection('products').createIndex(
            { name: 'text', description: 'text' },
            { name: 'product_text_search' }
          );
        } catch (retryError: any) {
          // If it still fails, check if the correct index already exists
          const indexes = await db.collection('products').indexes();
          const correctIndex = indexes.find((idx: any) => idx.name === 'product_text_search');
          if (!correctIndex) {
            // Index doesn't exist and we can't create it - throw error
            throw retryError;
          }
          // Index exists, continue (idempotent)
        }
      } else {
        // Some other error occurred
        throw error;
      }
    }

    // Create indexes for Orders collection
    await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ transactionId: 1 });

    // Create indexes for Transactions collection
    await db.collection('transactions').createIndex({ txnRef: 1 }, { unique: true });
    await db.collection('transactions').createIndex({ order: 1 });
    await db.collection('transactions').createIndex({ status: 1 });
    await db.collection('transactions').createIndex({ createdAt: -1 });
    await db.collection('transactions').createIndex({ status: 1, createdAt: -1 });
    await db.collection('transactions').createIndex({ gateway: 1, status: 1 });
    await db.collection('transactions').createIndex({ phoneNumber: 1 });

    // Create indexes for Inventory collection
    await db.collection('inventories').createIndex({ product: 1 }, { unique: true });
    await db.collection('inventories').createIndex({ sku: 1 }, { unique: true });
    await db.collection('inventories').createIndex({ quantity: 1 });
    await db.collection('inventories').createIndex({ sku: 1, quantity: 1 });
    await db.collection('inventories').createIndex({ quantity: 1, lowStockThreshold: 1 });

    // Create indexes for Reviews collection
    await db.collection('reviews').createIndex({ product: 1, user: 1 }, { unique: true });
    await db.collection('reviews').createIndex({ product: 1, rating: -1 });
    await db.collection('reviews').createIndex({ product: 1, createdAt: -1 });
    await db.collection('reviews').createIndex({ user: 1, createdAt: -1 });
    await db.collection('reviews').createIndex({ rating: 1 });
  },
  down: async () => {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');

    // Drop indexes (in reverse order)
    await db.collection('reviews').dropIndexes();
    await db.collection('inventories').dropIndexes();
    await db.collection('transactions').dropIndexes();
    await db.collection('orders').dropIndexes();
    await db.collection('products').dropIndexes();
    await db.collection('users').dropIndexes();
  },
});

