import './env';
import { database, migrate } from '@/lib/server/db';
await migrate();
await database().end();
console.log('APPGRADE database is ready');
