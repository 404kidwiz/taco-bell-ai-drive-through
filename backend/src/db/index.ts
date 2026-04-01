/**
 * OrderFlow AI - Drizzle ORM Client
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export default db;
