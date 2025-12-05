import mongoose from 'mongoose';
import { connectDatabase } from '../../config/database';
import logger from '../../utils/logger';

export interface Migration {
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: Migration[] = [];

export const registerMigration = (migration: Migration) => {
  migrations.push(migration);
};

export const runMigrations = async (direction: 'up' | 'down' = 'up') => {
  try {
    await connectDatabase();
    
    // Create migrations collection if it doesn't exist
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const migrationsCollection = db.collection('migrations');
    
    logger.info(`Running migrations (${direction})...`);
    console.log(`🔄 Running migrations (${direction})...`);

    for (const migration of migrations) {
      const migrationRecord = await migrationsCollection.findOne({ name: migration.name });
      
      if (direction === 'up') {
        if (migrationRecord) {
          logger.info(`Migration ${migration.name} already applied, skipping`);
          console.log(`⏭️  Migration ${migration.name} already applied, skipping`);
          continue;
        }

        logger.info(`Running migration: ${migration.name}`);
        console.log(`▶️  Running migration: ${migration.name}`);
        
        await migration.up();
        
        await migrationsCollection.insertOne({
          name: migration.name,
          appliedAt: new Date(),
        });
        
        logger.info(`✅ Migration ${migration.name} completed`);
        console.log(`✅ Migration ${migration.name} completed`);
      } else {
        if (!migrationRecord) {
          logger.info(`Migration ${migration.name} not applied, skipping rollback`);
          console.log(`⏭️  Migration ${migration.name} not applied, skipping rollback`);
          continue;
        }

        logger.info(`Rolling back migration: ${migration.name}`);
        console.log(`◀️  Rolling back migration: ${migration.name}`);
        
        await migration.down();
        
        await migrationsCollection.deleteOne({ name: migration.name });
        
        logger.info(`✅ Migration ${migration.name} rolled back`);
        console.log(`✅ Migration ${migration.name} rolled back`);
      }
    }

    logger.info('All migrations completed');
    console.log('✅ All migrations completed');
    process.exit(0);
  } catch (error: any) {
    logger.error('Migration error', {
      error: error.message,
      stack: error.stack,
    });
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

