
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Tests run from root usually, so this is fine. If not, use relative path.

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to database');

        // Check tables
        const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables found:', tablesRes.rows.map(r => r.table_name));

        // Check columns of class_confirmations
        const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'class_confirmations'
    `);
        console.log('Columns in class_confirmations:', columnsRes.rows);

        // Check columns of classes
        const classesColumnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'classes'
    `);
        console.log('Columns in classes:', classesColumnsRes.rows);

        // Check classes count
        try {
            const classesRes = await client.query('SELECT count(*) FROM classes');
            console.log('Classes count:', classesRes.rows[0].count);
        } catch (e) {
            console.error('Error querying classes table:', e.message);
        }

        // Check first class row
        try {
            const classesRow = await client.query('SELECT * FROM classes LIMIT 1');
            console.log('Class row sample:', classesRow.rows[0]);
        } catch (e) {
            console.error('Error querying classes row:', e.message);
        }

        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        pool.end();
    }
}

testConnection();
