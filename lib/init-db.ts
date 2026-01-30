import { initDatabase } from './db';

// Initialize database on module load (for serverless environments)
if (typeof window === 'undefined') {
  initDatabase().catch(console.error);
}
