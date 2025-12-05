import 'dotenv/config';
import './migrations/001_create_indexes';
import { runMigrations } from './migrations/index';

const direction = process.argv[2] === 'down' ? 'down' : 'up';

runMigrations(direction);

