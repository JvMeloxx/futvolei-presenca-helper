
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        await client.query('BEGIN');

        // Check if columns exist to avoid duplicate error
        const check = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'class_confirmations' AND column_name = 'confirmed'
    `);

        if (check.rows.length === 0) {
            console.log('Adding missing columns...');
            await client.query(`
            ALTER TABLE class_confirmations 
            ADD COLUMN confirmed BOOLEAN DEFAULT true,
            ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `);

            // Update existing rows to have consistent data
            await client.query(`UPDATE class_confirmations SET confirmed_at = created_at`);

            console.log('Columns added and data backfilled.');
        } else {
            console.log('Columns already exist. Skipping.');
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
